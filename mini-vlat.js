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
let testEnded = false;
let selectedAnswers = [];
let questionNumber = 0;

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
    if (testEnded) {
        alert("The test has ended because you switched tabs or minimized the window too many times.");
        return;
    }

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

        label.setAttribute('for', input.id);
        label.textContent = answer;

        answerContainer.appendChild(input);
        answerContainer.appendChild(label);
    });

    questionContainer.appendChild(answerContainer);

    // Next Button
    let button = document.createElement("button");
    button.textContent = currentIndex === imageFiles.length - 1 ? "Finish!" : "Submit!";
    button.classList.add("next-btn");
    button.onclick = goToNextImage;
    questionContainer.appendChild(button);

    startTimer();
}

function goToNextImage() {
    let selectedAnswer = document.querySelector('input[name="answer' + currentIndex + '"]:checked');

    if (selectedAnswer) {
        selectedAnswers[currentIndex] = selectedAnswer.value;
    } else {
        return;
    }

    if (currentIndex < imageFiles.length - 1) {
        currentIndex++;
        renderImage(currentIndex);
    } else {
        endTest();
    }
}

function startTimer() {
    let countdownTime = 25;
    updateTimerDisplay(countdownTime);
    clearInterval(timer);

    timer = setInterval(() => {
        countdownTime--;
        updateTimerDisplay(countdownTime);

        if (countdownTime <= 0) {
            clearInterval(timer);
            goToNextImage();
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

    if (visibilityCount === 1) {
      alert("If you switch tabs or minimize the window again, the test will end.");
    } else if (visibilityCount > 1) {
      endTest();
    }
  }
}

function navigateToEnd() {
  navigatingToEnd = true; // Set flag before navigation
  window.location.href = "end.html";
}

function endTest() {
  testEnded = true;
  if (currentIndex == imageFiles.length - 1) {
    navigateToEnd(); // Use safe navigation
  } else {
    window.location.href = "end.html"; // Normal navigation for other pages
  }
}

document.addEventListener('visibilitychange', handleVisibilityChange);

function handleBeforeUnload(event) {
  if (visibilityCount > 1) {
    event.preventDefault();
    event.returnValue = 'The test will be finished if you leave the page now.';
  }
}
window.addEventListener('load', startImageTest);