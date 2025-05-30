let timer;
let currentIndex = 0;
let visibilityCount = 0;
let testEnded = false;

function startMiniVLAT() {
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
    countdownTime = 30;
    updateTimerDisplay(countdownTime);
    clearInterval(timer);

    timer = setInterval(() => {
        countdownTime--;
        updateTimerDisplay(countdownTime);

        if (countdownTime <= 0) {
            clearInterval(timer);
            navigatingToMinivlat();
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

    if (visibilityCount === 1) {
      alert("If you switch tabs or minimize the window again, the test will end.");
    } else if (visibilityCount > 1) {
      endTest();
    }
  }
}

function navigateToMinivlat() {
  navigatingToMinivlat = true;
  window.location.href = "mini-vlat.html";
}

function endTest() {
  testEnded = true;
  window.location.href = "end.html";
}

document.addEventListener('visibilitychange', handleVisibilityChange);

function handleBeforeUnload(event) {
  if (visibilityCount > 1) {
    event.preventDefault();
    event.returnValue = 'The test will be finished if you leave the page now.';
  }
}

window.addEventListener('load', startMiniVLAT);