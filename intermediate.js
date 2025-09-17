let timer;
let countdownTime = 30;
let timerStartTimestamp = null;

let currentIndex = 0;
let visibilityCount = 0;
let testEnded = false;

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

function isValidNumber(val) {
  return !isNaN(val) && val !== null && val !== '';
}

function loadState() {
  const savedVisibility = getCookie('visibilityCount');
  if (isValidNumber(savedVisibility)) visibilityCount = Number(savedVisibility);
  const ended = getCookie('testEnded');
  if (ended) testEnded = ended === 'true';

  const idx = getCookie('currentIndex');
  const savedTime = getCookie('countdownTime');
  const savedTimestamp = getCookie('timerStartTimestamp');

  if (idx) currentIndex = Number(idx);
  if (savedTime) countdownTime = Number(savedTime);
  if (savedTimestamp) timerStartTimestamp = Number(savedTimestamp);
}

function clearTimerCookies() {
  document.cookie = 'countdownTime=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'timerStartTimestamp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

function clearCookies() {
  [
    'currentIndex',
    'scatterplotData',
    'hoveredPoints',
    'interactionLog',
    'slope',
    'tries',
    'countdownTime',
    'startTime',
    'timespent'
  ].forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
}

window.addEventListener('pageshow', (event) => {
  // This fires even on back navigation
  const cameFromMiniVlat = getCookie('cameFromMiniVlat');
  blockReentryIfAlreadyStarted();
});

function blockReentryIfAlreadyStarted() {
  const cameFromMiniVlat = getCookie('cameFromMiniVlat');
  const testEnded = getCookie('testEnded') === 'true';

  if (cameFromMiniVlat === 'true' && !testEnded) {
    restoringSession = true; // prevent visibility change during redirect
    setCookie('cameFromMiniVlat', 'false');
    window.location.replace("mini-vlat.html");
  }
}

function startMiniVLAT() {
    if (window.alertShown) return;
    window.alertShown = true;

    setCookie('cameFromIntermediate', 'true');

    loadState();

    const cameFromStudy = getCookie('cameFromStudy') === 'true';

    // Detect navigation type
    let navType = performance.getEntriesByType("navigation")[0]?.type || "navigate";

    // Show alert only if it's a reload and not from initial.js
    if (visibilityCount === 1 && navType === "reload" && !cameFromStudy) {
      alert("If you switch tabs, refresh or minimize the window again, the test will end.");
    } else if (visibilityCount > 1) {
      endTest();
    }

    // Clear the flag after use
    setCookie('cameFromStudy', 'false');

    // Check if the button already exists
    const existingButton = document.querySelector('.next-btn');
    if (existingButton) {
        return; // Exit if the button already exists
    }

    // Add button styles
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

        .timer {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);

    let container = document.createElement("div");
    container.classList.add("button-container");

    let button = document.createElement("button");
    button.textContent = "Start Mini-VLAT";
    button.classList.add("next-btn");
    button.onclick = navigateToMinivlat;
    container.appendChild(button);

    // Append button inside the thank-you card
    let thankYouCard = document.querySelector('.thank-you-card');
    if (thankYouCard) {
        thankYouCard.appendChild(container);
    } else {
        console.error("Thank You Card element not found!");
    }

    let timerDisplay = document.createElement("div");
    timerDisplay.id = "timer";
    timerDisplay.classList.add("timer");
    document.body.appendChild(timerDisplay);

    startTimer();
}

function startTimer() {
    if (!countdownTime || countdownTime <= 0 || countdownTime > 30) {
      countdownTime = 30;
    }

    updateTimerDisplay(countdownTime);
    clearInterval(timer);

    timer = setInterval(() => {
      countdownTime--;
      updateTimerDisplay(countdownTime);

      if (countdownTime <= 0) {
        clearInterval(timer);
        navigateToMinivlat();
      }
    }, 1000);
  }

function updateTimerDisplay(time) {
    const tens = Math.floor(time / 10);
    const units = time % 10;
    document.querySelector('#timer .tick:nth-child(1)').setAttribute('data-value', String(tens));
    document.querySelector('#timer .tick:nth-child(2)').setAttribute('data-value', String(units));
}

let navigatingToMinivlat = false;

function handleVisibilityChange() {
  if (document.hidden) {
    if (navigatingToMinivlat) {
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

function navigateToMinivlat() {
  navigatingToMinivlat = true;
  clearCookies();
  setCookie('cameFromIntermediate', 'true');
  window.location.replace("mini-vlat.html");
}

function endTest() {
  clearCookies();
  testEnded = true;

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

document.addEventListener('keydown', (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    return false;
  }
});

window.addEventListener('beforeunload', handleBeforeUnload);
window.addEventListener('load', startMiniVLAT);