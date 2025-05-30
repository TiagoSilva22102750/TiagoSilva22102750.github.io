const margin = { top: 20, right: 20, bottom: 50, left: 60 };
const size = 870;
const width = size - margin.left - margin.right;
const height = size - margin.top - margin.bottom;

const files = ["test-trial/test-trial-data-1.csv", "test-trial/test-trial-data-2.csv",];

let currentIndex = 0;
let scatterplotData = [];
let timer;
let visibilityCount = 0;
let testEnded = false;
//let hoverCount = 0;
let hoveredPoints = [];
let interactionLog = [];
let slope = 0.00;
let tries = 0;
let countdownTime = 0;
let startTime = 0.0;
let timespent = 0.0;

function startDashboard() {
  function loadCSV(file) {
    return d3.csv(file);
  }

  Promise.all(files.map(loadCSV))
    .then(dataArray => {
      scatterplotData = dataArray.map(data => {
        data.forEach(d => {
          d.x = +d.x;
          d.y = +d.y;
        });
        return data;
      });
      renderScatterplot(currentIndex);
    })
    .catch(error => console.error("Error loading the CSV files:", error));
}

function updateInstructions(index) {
  const instructionsDiv = document.querySelector('.instructions');

  if (index === 0) {
    instructionsDiv.innerHTML = `
      <h2>Instructions:</h2>
      <p>Adjust the slope of the red line to have a value of <b>-0.50</b>.</p>
    `;
  } else if (index === 1) {
    instructionsDiv.innerHTML = `
      <h2>Instructions:</h2>
      <p>Adjust the slope of the red line to have a value of <b>0.75</b>.</p>
    `;
  }
}

function alertIfTestValueIncorrect(index) {
    const alertBox = document.getElementById("customAlert");
    alertBox.style.display = "block";

    tries++;

    setTimeout(function() {
        alertBox.style.display = "none";
    }, 5000);
}

function updateProgressBar() {
    let totalSteps = scatterplotData.length;
    let currentStep = currentIndex + 1;

    let progress = (currentStep / totalSteps) * 100;
    d3.select("#progressBar").style("width", progress + "%");
    d3.select("#progressText").text(`${currentStep}/${totalSteps}`);
    /*
    let progress = ((currentIndex + 1) / scatterplotData.length) * 100;
    d3.select("#progressBar").style("width", progress + "%");
    d3.select("#progressText").text(Math.round(progress) + "%");
    */
}

/*
function updateHoverDisplay() {
  console.log(`Total Hovers: ${hoverCount}`);
  console.log("Hovered Points:", hoveredPoints);
}
*/

function renderScatterplot(index) {
  startTime = performance.now();

  if (testEnded) {
    alert("The test has ended because you switched tabs or minimized the window too many times.");
    return;
  }

  updateInstructions(index);

  //hoverCount = 0;
  //hoveredPoints = [];
  //updateHoverDisplay();

  d3.select("#scatterPlot").selectAll("*").remove();
  updateProgressBar(); // Update progress bar when rendering new scatterplot

  d3.select("#scatterPlot").selectAll("*").remove();
  const data = scatterplotData[index];
  const svg = d3.select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xMax = Math.max(Math.abs(d3.min(data, d => d.x)), Math.abs(d3.max(data, d => d.x)));
  const xScale = d3.scaleLinear()
    .domain([-xMax, xMax])  // Center the X axis at 0
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.y) - 10, d3.max(data, d => d.y) + 10])
    .range([height, 0]);

  // Axis generators
  const xAxis = d3.axisBottom(xScale).tickSize(0).tickFormat('');
  const yAxis = d3.axisLeft(yScale).tickSize(0).tickFormat('');

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  // Add Y axis
  svg.append("g")
    .call(yAxis);

  svg.selectAll(".circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 3)
    .attr("fill", "steelblue")
    .attr("stroke", "black")
    .on("mouseover", function (event, d) {
        timespent = ((performance.now() - startTime) / 1000).toFixed(3);
        hoveredPoints.push({ x: d.x, y: d.y, timespent: timespent });
        interactionLog.push({ type: "hover", scatterplot: files[currentIndex], x: d.x, y: d.y, timespent: timespent });
        //updateHoverDisplay();
    });

  svg.append("line")
    .attr("x1", 0)
    .attr("y1", height)
    .attr("x2", width)
    .attr("y2", height)
    .attr("stroke", "black");

  svg.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", height)
    .attr("stroke", "black");

  const regressionLine = svg.append("line")
    .attr("x1", 0)
    .attr("y1", height / 2)
    .attr("x2", width)
    .attr("y2", height / 2)
    .attr("stroke", "red")
    .attr("stroke-width", 3);

  const ballLeft = svg.append("circle")
    .attr("cx", 0)
    .attr("cy", height / 2)
    .attr("r", 8)
    .attr("fill", "red");

  const smallBallLeft = svg.append("circle")
    .attr("cx", 0)
    .attr("cy", height / 2)
    .attr("r", 4)  // Smaller radius
    .attr("fill", "white");

  const ballRight = svg.append("circle")
    .attr("cx", width)
    .attr("cy", height / 2)
    .attr("r", 8)
    .attr("fill", "red");

  const smallBallRight = svg.append("circle")
    .attr("cx", width)
    .attr("cy", height / 2)
    .attr("r", 4)
    .attr("fill", "white");

  function updateSlopeDisplay() {
    let y1 = parseFloat(ballRight.attr("cy"));
    let y2 = parseFloat(ballLeft.attr("cy"));
    slope = (y2 - y1) / width;
    slope = slope.toFixed(2);

    d3.select("#slopeDisplay").text(`Slope: ${slope}`);

    if (slope > 0.00) {
      d3.select("#slopeDisplay").style("color", "green");
    } else if (slope < 0.00) {
      d3.select("#slopeDisplay").style("color", "red");
    } else {
      d3.select("#slopeDisplay").style("color", "black");
    }
  }

  updateSlopeDisplay();

  let dragLeftCount = 0;
  let dragRightCount = 0;

  let dragData = {
    left: { start: null, end: null, displacement: null },
    right: { start: null, end: null, displacement: null }
  };

  dragData.left.start = yScale.invert(parseFloat(ballLeft.attr("cy")));
  dragData.right.start = yScale.invert(parseFloat(ballRight.attr("cy")));

  const dragLeft = d3.drag()
    .on("start", function () {
      d3.select(this).style("cursor", "grabbing"); // 👈 closed hand
      dragLeftCount++;
      timespent = ((performance.now() - startTime) / 1000).toFixed(3);
      interactionLog.push({ type: "dragStart", scatterplot: files[currentIndex], side: "left", y: yScale.invert(parseFloat(ballLeft.attr("cy"))), timespent: timespent });
    })
    .on("drag", function (event) {
      let newY = Math.max(0, Math.min(height, event.y));
      ballLeft.attr("cy", newY);
      smallBallLeft.attr("cy", newY);
      regressionLine.attr("y1", newY);
      updateSlopeDisplay();
    })
    .on("end", function () {
      d3.select(this).style("cursor", "grab"); // 👈 back to open hand
      timespent = ((performance.now() - startTime) / 1000).toFixed(3);
      interactionLog.push({ type: "dragEnd", scatterplot: files[currentIndex], side: "left", y: yScale.invert(parseFloat(ballLeft.attr("cy"))), timespent: timespent });
      dragData.left.end = yScale.invert(parseFloat(ballLeft.attr("cy")));
    });

  const dragRight = d3.drag()
    .on("start", function () {
      d3.select(this).style("cursor", "grabbing");
      dragRightCount++;
      timespent = ((performance.now() - startTime) / 1000).toFixed(3);
      interactionLog.push({ type: "dragStart", scatterplot: files[currentIndex], side: "right", y: yScale.invert(parseFloat(ballRight.attr("cy"))), timespent: timespent });
    })
    .on("drag", function (event) {
      let newY = Math.max(0, Math.min(height, event.y));
      ballRight.attr("cy", newY);
      smallBallRight.attr("cy", newY);
      regressionLine.attr("y2", newY);
      updateSlopeDisplay();
    })
    .on("end", function () {
      d3.select(this).style("cursor", "grab");
      timespent = ((performance.now() - startTime) / 1000).toFixed(3);
      interactionLog.push({ type: "dragEnd", scatterplot: files[currentIndex], side: "right", y: yScale.invert(parseFloat(ballRight.attr("cy"))), timespent: timespent });
      dragData.right.end = yScale.invert(parseFloat(ballRight.attr("cy")));
    });

  ballLeft.call(dragLeft);
  ballRight.call(dragRight);
  smallBallLeft.call(dragLeft);
  smallBallRight.call(dragRight);

  function updateDragCountDisplay() {
    console.log(`Left Drags: ${dragLeftCount}, Right Drags: ${dragRightCount}`);
  }

  function storeFinalPositions() {
    dragData.left.displacement = dragData.left.end - dragData.left.start;
    dragData.right.displacement = dragData.right.end - dragData.right.start;

    interactionLog.push({
      type: "final",
      left: { start: dragData.left.start, end: dragData.left.end, displacement: dragData.left.displacement },
      right: { start: dragData.right.start, end: dragData.right.end, displacement: dragData.right.displacement },
      hoveredPoints: [...hoveredPoints]
    });

    console.log("Final Interaction Log:", interactionLog);
  }

  const style = document.createElement("style");
  style.innerHTML = `
    .button-container {
     display: flex;
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

  d3.select("#nextButton").selectAll("*").remove(); // Fix for duplicate buttons

    const buttonContainer = d3.select("#nextButton")
      .append("div")
      .attr("class", "button-container");

    buttonContainer.append("button")
      .attr("class", "next-btn")
      .text(currentIndex === scatterplotData.length - 1 ? "Continue" : "Submit")
      .on("click", () => {
        alertIfTestValueIncorrect(index);
        if (index == 0 && slope == -0.50 && tries <= 1 ) {
            storeFinalPositions();
            clearTimeout(timer);
            updateInstructions(currentIndex);
            tries = 0;
            d3.select("#customAlert").style("display", "none");
            goToNextScatterplot();
        } else if (index == 1 && slope == 0.75 && tries <= 1) {
            storeFinalPositions();
            clearTimeout(timer);
            updateInstructions(currentIndex);
            tries = 0;
            d3.select("#customAlert").style("display", "none");
            goToNextScatterplot();
        } else if (tries > 1) {
            storeFinalPositions();
            clearTimeout(timer);
            updateInstructions(currentIndex);
            tries = 0;
            d3.select("#customAlert").style("display", "none");
            goToNextScatterplot();
        }
      });

  startTimer();


  function goToNextScatterplot() {
    if (currentIndex < scatterplotData.length - 1) {
      currentIndex++;
      updateInstructions(currentIndex);
      renderScatterplot(currentIndex);
    } else if (currentIndex == scatterplotData.length - 1) {
      endTest()
    }
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
              let timestamp = new Date().toLocaleString();
              interactionLog.push({ type: "timeout", scatterplot: files[currentIndex], index: currentIndex, countdownTime });
              storeFinalPositions();
              goToNextScatterplot();
          }
      }, 1000);
  }

  function updateTimerDisplay(time) {
    const tens = Math.floor(time / 10);
    const units = time % 10;
    document.querySelector('#timer .tick:nth-child(1)').setAttribute('data-value', String(tens));
    document.querySelector('#timer .tick:nth-child(2)').setAttribute('data-value', String(units));
  }
}

let navigatingToStudy = false;

function handleVisibilityChange() {
  if (document.hidden) {
    if (navigatingToStudy) {
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

function navigateToStudy() {
  navigatingToStudy = true; // Set flag before navigation
  d3.select("#customAlert").style("display", "none");
  window.location.href = "study.html";
}

function endTest() {
  testEnded = true;
  if (currentIndex == scatterplotData.length - 1) {
    navigateToStudy(); // Use safe navigation
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

startDashboard();