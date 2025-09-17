let timer;
let countdownTime = 90;
let startTime = 0.0;
let timespent = 0.0;
let timerStartTimestamp = null;

let currentIndex = 0;
let visibilityCount = 0;
let testEnded = false;
let navigatingToTestTrial = false;

let restoringSession = false;
let visibilityChangeHandled = false;
let videoWatched = false;
let userID = '';

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
  const cameFromInitial = getCookie('cameFromInitial');
  const testEnded = getCookie('testEnded') === 'true';

  if (cameFromInitial && !testEnded) {
    restoringSession = true; // prevent visibility change during redirect
    setCookie('cameFromInitial', 'false');
    window.location.replace("test-trial.html");
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
    if (window.alertShown) return;
    window.alertShown = true;

    loadState();
    startTime = performance.now();

    userID = localStorage.getItem('prolificUserID');

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

    const videoElement = document.getElementById('video');
    if (videoElement) {
        videoElement.addEventListener('ended', () => {
            videoWatched = true;
            enableStartButton();
        });

        // Optional: If you want to allow button when 90% of the video is watched
        videoElement.addEventListener('timeupdate', () => {
            if (!videoWatched && videoElement.currentTime >= videoElement.duration * 0.9) {
                videoWatched = true;
                enableStartButton();
            }
        });
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
            justify-content: center;
            margin-top: 20px;
        }

        .next-btn {
            background: linear-gradient(135deg, #007BFF, #0056b3);
            color: white;
            font-size: 18px;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: not-allowed;
            opacity: 0.5;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            font-weight: bold;
        }

        .next-btn.enabled {
            cursor: pointer;
            opacity: 1;
        }

        .next-btn.enabled:hover {
            background: linear-gradient(135deg, #0056b3, #003f7f);
            transform: translateY(-2px);
            box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.3);
        }

        .timer {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);

    const container = document.createElement("div");
    container.classList.add("button-container");

    const button = document.createElement("button");
    button.textContent = "Start Test Trial";
    button.classList.add("next-btn");
    button.disabled = true; // Initially disabled
    container.appendChild(button);

    button.addEventListener('click', () => {
        if (videoWatched) navigateToTestTrial();
        else alert("Please watch the video before starting the test.");
    });

    const thankYouCard = document.querySelector('.thank-you-card');
    if (thankYouCard) thankYouCard.appendChild(container);
    else console.error("Thank You Card element not found!");
}

function enableStartButton() {
    const button = document.querySelector('.next-btn');
    if (button) {
        button.disabled = false;
        button.classList.add('enabled');
    }
}

function startTimer() {
    if (!countdownTime || countdownTime <= 0 || countdownTime > 90) {
      countdownTime = 90;
    }

    updateTimerDisplay(countdownTime);
    clearInterval(timer);

    timer = setInterval(() => {
      countdownTime--;
      updateTimerDisplay(countdownTime);

      if (countdownTime <= 0) {
        clearInterval(timer);
        navigateToTestTrial();
      }
    }, 1000);
  }

function updateTimerDisplay(time) {
    const tens = Math.floor(time / 10);
    const units = time % 10;
    document.querySelector('#timer .tick:nth-child(1)').setAttribute('data-value', String(tens));
    document.querySelector('#timer .tick:nth-child(2)').setAttribute('data-value', String(units));
}

function handleVisibilityChange() {
  if (document.hidden) {
    if (navigatingToTestTrial) {
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

function navigateToTestTrial() {
  navigatingToTestTrial = true;
  clearTimerCookies();

  setCookie('visibilityCount', visibilityCount);
  setCookie('testEnded', testEnded);
  setCookie('cameFromInitial', 'true');
  window.location.replace("test-trial.html");
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

document.addEventListener('keydown', (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    return false;
  }
});

window.addEventListener('beforeunload', handleBeforeUnload);
window.addEventListener('load', startStudy);