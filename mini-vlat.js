const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const imageFiles = [
    "TreeMap.png",
    "Stacked100.png",
    "Histogram.png",
    "Choropleth_New.png",
    "PieChart.png",
    "BubbleChart.png",
    "StackedBar.png",
    "LineChart.png",
    "BarChart.png",
    "AreaChart.png",
    "StackedArea.png",
    "Scatterplot.png"
];

const answers = [
    ["True", "False", "Skip"], // TreeMap
    ["Great Britain", "USA", "Japan", "Australia", "Skip"], // Stacked100
    ["60 – 70 km", "30 – 40 km", "20 – 30 km", "50 – 60 km", "Skip"], // Histogram
    ["True", "False", "Skip"], // Choropleth_New
    ["17.6%", "25.3%", "10.9%", "35.2%", "Skip"], // PieChart
    ["Beijing", "Shanghai", "London", "Seoul", "Skip"], // BubbleChart
    ["$5.2", "$6.1", "$7.5", "$4.5", "Skip"], // StackedBar
    ["$50.54", "$47.02", "$42.34", "$43.48", "Skip"], // LineChart
    ["42.30 Mbps", "40.51 Mbps", "35.25 Mbps", "16.16 Mbps", "Skip"], // BarChart
    ["$0.71", "$0.90", "$0.80", "$0.63", "Skip"], // AreaChart
    ["1 to 1", "1 to 2", "1 to 3", "1 to 4", "Skip"], // StackedArea
    ["True", "False", "Skip"], // Scatterplot
];

let currentIndex = 0;
let timer;
let visibilityCount = 0;
let countdownTime = 0;
let testEnded = false;
let selectedAnswers = [];
let questionNumber = 0;

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
  setCookie('selectedAnswers', JSON.stringify(selectedAnswers));
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
  const savedAnswers = getCookie('selectedAnswers');

  if (isValidNumber(idx)) currentIndex = Number(idx);
  if (isValidNumber(savedTime)) countdownTime = Number(savedTime);
  if (savedAnswers) selectedAnswers = JSON.parse(savedAnswers);
}

function clearCookies() {
  [
    'currentIndex',
    'countdownTime',
    'selectedAnswers'
  ].forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
}

// Preload all images
const preloadedImages = [];
function preloadImages() {
    imageFiles.forEach((src) => {
        let img = new Image();
        img.src = src;
        preloadedImages.push(img);
    });
}

function startImageTest() {
    if (window.alertShown) return;
    window.alertShown = true;

    setCookie('cameFromMiniVlat', 'true');

    loadState();

    const cameFromIntermediate = getCookie('cameFromIntermediate') === 'true';

    // Detect navigation type
    let navType = performance.getEntriesByType("navigation")[0]?.type || "navigate";

    // Show alert only if it's a reload and not from initial.js
    if (visibilityCount === 1 && navType === "reload" && !cameFromIntermediate) {
      alert("If you switch tabs, refresh or minimize the window again, the test will end.");
    } else if (visibilityCount > 1) {
      endTest();
    }

    // Clear the flag after use
    setCookie('cameFromIntermediate', 'false');

    preloadImages();
    renderImage(currentIndex);
}

function updateProgressBar() {
    let totalSteps = imageFiles.length;
    let currentStep = currentIndex + 1;
    let progress = (currentStep / totalSteps) * 100;
    document.querySelector("#progressBar").style.width = progress + "%";
    document.querySelector("#progressText").textContent = `${currentStep}/${totalSteps}`;
}

function renderImage(index) {
    updateProgressBar();

    let imageContainer = document.querySelector("#imageContainer");
    let questionContainer = document.querySelector(".question-container");

    imageContainer.innerHTML = "";
    questionContainer.innerHTML = "";

    // Render Image
    let img = document.createElement("img");
    img.src = preloadedImages[index].src;
    img.style.maxHeight = "600px";
    img.style.borderRadius = "10px";

    img.onerror = function () {
        alert("Error loading image: " + imageFiles[index]);
        console.error("Error loading image:", imageFiles[index]);
    };

    imageContainer.appendChild(img);

    // Render Question
    let questionText = document.createElement("h3");
    questionNumber = index + 1;
    questionText.innerHTML = `${questionNumber}. ${getQuestionForImage(index)}`; // Use innerHTML instead of textContent
    questionText.classList.add("question");
    questionContainer.appendChild(questionText);

    // Render Answer Options
    let answerContainer = document.createElement("div");
    answerContainer.classList.add("options");

    answers[index].forEach((answer, i) => {
        let label = document.createElement("label");
        let input = document.createElement("input");
        input.type = "radio";
        input.name = "answer" + index;
        input.value = answer;
        input.id = "answer" + index + "_" + i;

        input.addEventListener('change', () => {
            selectedAnswers[index] = input.value;
            saveState();
        });

        label.setAttribute('for', input.id);
        label.textContent = answer;

        answerContainer.appendChild(input);
        answerContainer.appendChild(label);
    });

    // Restore saved answer if available
    if (selectedAnswers[index]) {
        const selectedValue = selectedAnswers[index];
        const radioButtons = answerContainer.querySelectorAll(`input[name="answer${index}"]`);
        radioButtons.forEach((radio) => {
            if (radio.value === selectedValue) {
                radio.checked = true;
            }
        });
    }

    questionContainer.appendChild(answerContainer);

    // Next Button
    let button = document.createElement("button");
    button.textContent = currentIndex === imageFiles.length - 1 ? "Finish!" : "Submit!";
    button.classList.add("next-btn");
    button.addEventListener("click", () => {
        let selectedAnswer = document.querySelector('input[name="answer' + currentIndex + '"]:checked');

        if (!selectedAnswer) {
          return;
        }

        const answerData = {
          user_id: 123,
          question_number: questionNumber,
          selected_answer: selectedAnswers[index]
        };

        Promise.all([
          sendMiniVlatAnswerData(answerData)
        ]).then(() => {
          goToNextImage();
        }).catch((error) => {
          console.error("Error sending the data:", error);
        });
      });
    questionContainer.appendChild(button);

    startTimer();
}

function goToNextImage() {
    let selectedAnswer = document.querySelector('input[name="answer' + currentIndex + '"]:checked');

    if (selectedAnswer) {
        selectedAnswers[currentIndex] = selectedAnswer.value;
        saveState();
    }

    if (currentIndex < imageFiles.length - 1) {
        currentIndex++;
        countdownTime = 25;
        renderImage(currentIndex);
    } else {
        endTest();
    }
}

function startTimer() {
    if (!countdownTime || countdownTime <= 0 || countdownTime > 25) {
      countdownTime = 25;
    }

    updateTimerDisplay(countdownTime);
    clearInterval(timer);

    timer = setInterval(() => {
      countdownTime--;
      updateTimerDisplay(countdownTime);

      if (countdownTime <= 0) {
        clearInterval(timer);

        let selectedAnswer = document.querySelector('input[name="answer' + currentIndex + '"]:checked');
        let recordedAnswer = selectedAnswer ? selectedAnswer.value : "TIMEOUT";

        selectedAnswers[currentIndex] = recordedAnswer;
        saveState();

        const answerData = {
          user_id: 123,
          question_number: questionNumber,
          selected_answer: recordedAnswer
        };

        Promise.all([
          sendMiniVlatAnswerData(answerData)
        ]).then(() => {
          goToNextImage();
        }).catch((error) => {
          console.error("Error sending the data:", error);
        });
      }
    }, 1000);
  }

function getQuestionForImage(index) {
    const questions = [
        "eBay is nested in the Software category.", // TreeMap
        "Which country has the lowest proportion of Gold medals?", // Stacked100
        "What distance have customers traveled in the taxi the most?", // Histogram
        "In 2020, the unemployment rate for Washington (WA) was higher than that of Wisconsin (WI)?", // Choropleth_New
        "What is the approximate global smartphone market share of Samsung?", // PieChart
        "Which city’s metro system has the largest number of stations?", // BubbleChart
        "What is the cost of peanuts in Seoul?", // StackedBar
        "What was the price of a barrel of oil in February 2020?", // LineChart
        "What is the average internet speed in Japan?", // BarChart
        "What was the average price of a pound of coffee in October 2019?", // AreaChart
        "What was the ratio of girls named “Isla” to girls named “Amelia” in 2012 in the UK?", // StackedArea
        "There is a negative relationship between the height and the weight of the 85 males.", // Scatterplot
    ];

    return questions[index];
}

function updateTimerDisplay(time) {
    const tens = Math.floor(time / 10);
    const units = time % 10;
    document.querySelector('#timer .tick:nth-child(1)').setAttribute('data-value', String(tens));
    document.querySelector('#timer .tick:nth-child(2)').setAttribute('data-value', String(units));
}

let navigatingToEnd = false;

function handleVisibilityChange() {
  if (document.hidden) {
    if (navigatingToEnd) {
      return;
    }

    visibilityCount++;
    setCookie('visibilityCount', visibilityCount);
    saveState();

    if (visibilityCount === 1) {
      alert("If you switch tabs or minimize the window again, the test will end.");
    } else if (visibilityCount > 1) {
      //setCookie('testEnded', testEnded);
      endTest();
    }
  }
}

function navigateToEnd() {
  navigatingToEnd = true; // Set flag before navigation
  setCookie('cameFromMiniVlat', 'true');
  window.location.replace("end.html");
}

function endTest() {
  clearCookies();
  testEnded = true;
  setCookie('testEnded', testEnded);
  if (currentIndex == imageFiles.length - 1) {
    navigateToEnd(); // Use safe navigation
  } else {
    window.location.replace("end.html"); // Normal navigation for other pages
  }
}

document.addEventListener('visibilitychange', handleVisibilityChange);

function handleBeforeUnload(event) {
  //if (visibilityCount > 1) {
    //event.preventDefault();
    //event.returnValue = 'The test will be finished if you leave the page now.';
  //}
}

function sendMiniVlatAnswerData(data) {
  return fetch("https://193.136.128.108:5000/submit-minivlat-answer", {
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
window.addEventListener('load', startImageTest);