let timer;
let countdownTime = 120;
let startTime = 0.0;
let timespent = 0.0;
let timerStartTimestamp = null;

let currentIndex = 0;
let testEnded = false;
let navigatingToInitial = false;

let restoringSession = false;
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
  setCookie('testEnded', testEnded);
  setCookie('currentIndex', currentIndex);
  if (timerStartTimestamp) {
    setCookie('timerStartTimestamp', timerStartTimestamp);
  }
}

function loadState() {
  const ended = getCookie('testEnded');
  const idx = getCookie('currentIndex');
  const savedTimestamp = getCookie('timerStartTimestamp');

  if (ended) testEnded = ended === 'true';
  if (idx) currentIndex = Number(idx);
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
    window.location.replace("initial.html");
  }
}

window.addEventListener('load', () => {
  const ended = getCookie('testEnded') === 'true';

  if (ended) {
    // User already finished → send them straight to end page
    window.location.replace("end.html");
    return;
  }

  blockReentryIfAlreadyStarted();
  startStudy();
});

function startStudy() {
    clearTimerCookies();
    document.cookie = 'visibilityCount=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

    if (window.alertShown) return;
    window.alertShown = true;

    loadState();
    startTime = performance.now();

    userIdInput = document.getElementById('prolific-id');
    userIdInput.addEventListener('input', () => {
      userIdInput.value = userIdInput.value.replace(/[^a-zA-Z0-9]/g, '');
    });

    // Check if the button already exists
    const existingButton = document.querySelector('.next-btn');
    if (existingButton) {
        return; // Exit if the button already exists
    }

    let timerDisplay = document.createElement("div");
    timerDisplay.id = "timer";
    timerDisplay.classList.add("timer");
    document.body.appendChild(timerDisplay);

    createStartButton();
    startTimer();
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
      const userID = userIdInput.value.trim();

      checkIfUserIdExists(userID)
       .then(exists => {
         if (exists) {
           showToast("This Prolific ID is already registered.");
         } else {
           Promise.all([
             sendUserData({ user_id: userID })
           ]).then(() => {
             localStorage.setItem('prolificUserID', userIdInput.value);
             navigateToInitial();
           }).catch((error) => {
             console.error("Erro ao enviar dados:", error);
           });
         }
       });
    });

    document.querySelector('.thank-you-card').appendChild(container);
}

function startTimer() {
  // If no timestamp exists, set it now
  if (!timerStartTimestamp) {
    timerStartTimestamp = Date.now();
    setCookie('timerStartTimestamp', timerStartTimestamp);
  }

  // Compute remaining time
  let elapsed = Math.floor((Date.now() - timerStartTimestamp) / 1000);
  countdownTime = 120 - elapsed;

  if (countdownTime <= 0) {
    navigateToInitial(); // Timer finished
    return;
  }

  updateTimerDisplay(countdownTime);
  clearInterval(timer);

  timer = setInterval(() => {
    countdownTime--;
    updateTimerDisplay(countdownTime);

    if (countdownTime <= 0) {
      clearInterval(timer);
      navigateToInitial();
    }

    saveState(); // persist state each tick
  }, 1000);
}

function updateTimerDisplay(time) {
    const str = String(time).padStart(3, "0");

    document.querySelector('#timer .tick:nth-child(1)').setAttribute('data-value', str[0]);
    document.querySelector('#timer .tick:nth-child(2)').setAttribute('data-value', str[1]);
    document.querySelector('#timer .tick:nth-child(3)').setAttribute('data-value', str[2]);
}


function navigateToInitial() {
  navigatingToInitial = true;
  clearTimerCookies();

  setCookie('testEnded', testEnded);
  setCookie('cameFromProlificID', 'true');
  window.location.replace("initial.html");
}

function endTest() {
  testEnded = true;
  clearTimerCookies();

  setCookie('testEnded', testEnded);

  window.location.replace("end.html");
}

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
  /*=
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
  */
  return fetch("https://web.tecnico.ulisboa.pt/ist1111187/submit-user-data.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
}

function checkIfUserIdExists(userId) {
  /*
  return fetch("http://193.136.128.108:5000/check-user-id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  })
  .then(res => res.json())
  .then(data => data.exists)
  .catch(err => {
    alert("Error checking user ID:", err);
    return false;
  });
  */
  return fetch("https://web.tecnico.ulisboa.pt/ist1111187/check-user-id.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  })
  .then(res => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  })
  .then(data => {
    // Make sure your PHP returns { "exists": true/false }
    return data.exists === true;
  })
  .catch(err => {
    console.error("Error checking user ID:", err);
    return false; // fail safe: assume user does NOT exist if check fails
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    return false;
  }
});

window.addEventListener('beforeunload', handleBeforeUnload);
window.addEventListener('load', startStudy);