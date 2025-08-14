let timer;
let countdownTime = 90;
let startTime = 0.0;
let timespent = 0.0;
let timerStartTimestamp = null;

let currentIndex = 0;
let visibilityCount = 0;
let testEnded = false;
let navigatingToInitial = false;

let restoringSession = false;
let visibilityChangeHandled = false;
let userIdInput = '';

function setCookie(name, value, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}

function saveState() {
  setCookie('visibilityCount', visibilityCount);
  setCookie('testEnded', testEnded);
  setCookie('currentIndex', currentIndex);
  setCookie('countdownTime', countdownTime);
  setCookie('timerStartTimestamp', timerStartTimestamp);
}

function loadState() {
  const vCount = getCookie('visibilityCount');
  const ended = getCookie('testEnded');
  const idx = getCookie('currentIndex');
  const savedTime = getCookie('countdownTime');
  const savedTimestamp = getCookie('timerStartTimestamp');

  if (vCount) visibilityCount = Number(vCount);
  if (ended) testEnded = ended === 'true';
  if (idx) currentIndex = Number(idx);
  if (savedTime) countdownTime = Number(savedTime);
  if (savedTimestamp) timerStartTimestamp = Number(savedTimestamp);
}

function clearTimerCookies() {
  document.cookie = 'countdownTime=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'timerStartTimestamp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

function blockReentryIfAlreadyStarted() {
  const cameFromProlificID = getCookie('cameFromProlificID');
  const testEnded = getCookie('testEnded') === 'true';

  if (cameFromProlificID && !testEnded) {
    restoringSession = true; // prevent visibility change during redirect
    setCookie('cameFromProlificID', 'false');
    window.location.replace("index.html");
  }
}

window.addEventListener('load', () => {
  blockReentryIfAlreadyStarted();
  startStudy();
});

function startStudy() {
    if (window.alertShown) return;
    window.alertShown = true;

    loadState();
    startTime = performance.now();

    userIdInput = document.getElementById('prolific-id');
    userIdInput.addEventListener('input', () => {
      userIdInput.value = userIdInput.value.replace(/[^a-zA-Z0-9]/g, '');
    });

    if (visibilityCount === 1) {
      alert("If you switch tabs, refresh or minimize the window again, the test will end.");
    } else if (visibilityCount > 1) {
      endTest();
    }

    // Check if the button already exists
    const existingButton = document.querySelector('.next-btn');
    if (existingButton) {
        return; // Exit if the button already exists
    }

    createStartButton();
}

function createStartButton() {
    // Prevent duplicate button
    if (document.querySelector('.next-btn')) return;

    const style = document.createElement("style");
    style.innerHTML = `
        .button-container {
         display: flex;
         margin-top: 10px;
         justify-content: center;
        }

        .next-btn {
         background: linear-gradient(135deg, #007BFF, #0056b3);
         color: white;
         font-size: 18px;
         padding: 12px 24px;
         border: none;
         border-radius: 8px;
         cursor: pointer;
         box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
         transition: all 0.3s ease;
         font-weight: bold;
        }

        .next-btn:hover {
         background: linear-gradient(135deg, #0056b3, #003f7f);
         transform: translateY(-2px);
         box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.3);
        }

        .next-btn:active {
         transform: translateY(1px);
         box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(style);

    const container = document.createElement("div");
    container.classList.add("button-container");

    const button = document.createElement("button");
    button.textContent = "Submit ID";
    button.classList.add("next-btn");
    container.appendChild(button);

    button.addEventListener('click', () => {
        const userData = {
            user_id: userIdInput.value
        };

        Promise.all([
           sendUserData(userData)
        ]).then(() => {
           localStorage.setItem('prolificUserID', userIdInput.value);
           navigateToInitial();
        }).catch((error) => {
            console.error("Erro ao enviar dados:", error);
        });
    });

    document.querySelector('.thank-you-card').appendChild(container);
}

function handleVisibilityChange() {
  if (document.hidden) {
    if (navigatingToInitial) {
      return;
    }

    visibilityCount++;
    setCookie('visibilityCount', visibilityCount);
    saveState();

    if (visibilityCount === 1) {
      alert("If you switch tabs or minimize the window again, the test will end.");
    } else if (visibilityCount > 1) {
      endTest();
    }
  }
}

function navigateToInitial() {
  navigatingToInitial = true;
  clearTimerCookies();

  setCookie('visibilityCount', visibilityCount);
  setCookie('testEnded', testEnded);
  setCookie('cameFromProlificID', 'true');
  window.location.replace("index.html");
}

function endTest() {
  testEnded = true;
  clearTimerCookies();

  setCookie('visibilityCount', visibilityCount);
  setCookie('testEnded', testEnded);

  window.location.replace("end.html");
}

document.addEventListener('visibilitychange', handleVisibilityChange);

function handleBeforeUnload(event) {
  //if (visibilityCount > 1) {
    //event.preventDefault();
    //event.returnValue = 'The test will be finished if you leave the page now.';
  //}
}

function showToast(message, duration = 5000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function sendUserData(data) {
  return fetch("http://193.136.128.108:5000/submit-user-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    console.log("Resposta do servidor:", result);
  })
  .catch(error => {
    console.error("Erro ao enviar os dados:", error);
  });
}

window.addEventListener('beforeunload', handleBeforeUnload);
window.addEventListener('load', startStudy);