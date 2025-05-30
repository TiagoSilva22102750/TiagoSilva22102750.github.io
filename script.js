const margin = { top: 20, right: 20, bottom: 50, left: 60 };
const size = 870;
const width = size - margin.left - margin.right;
const height = size - margin.top - margin.bottom;

const files = ["top/data_0,0000_normal_narrow_equidistant_top.csv", "top/data_0,0000_xtreme_narrow_equidistant_top.csv",
"top/data_0,2500_normal_narrow_equidistant_top.csv", "top/data_0,2500_xtreme_narrow_equidistant_top.csv",
"top/data_0,5000_normal_narrow_equidistant_top.csv", "top/data_0,5000_xtreme_narrow_equidistant_top.csv",
"top/data_0,7500_normal_narrow_equidistant_top.csv", "top/data_0,7500_xtreme_narrow_equidistant_top.csv",
"top/data_-0,2500_normal_narrow_equidistant_top.csv", "top/data_-0,2500_xtreme_narrow_equidistant_top.csv",
"top/data_-0,5000_normal_narrow_equidistant_top.csv", "top/data_-0,5000_xtreme_narrow_equidistant_top.csv",
"top/data_-0,7500_normal_narrow_equidistant_top.csv", "top/data_-0,7500_xtreme_narrow_equidistant_top.csv",
"bottom/data_0,0000_normal_narrow_equidistant_bottom.csv", "bottom/data_0,0000_xtreme_narrow_equidistant_bottom.csv",
"bottom/data_0,2500_normal_narrow_equidistant_bottom.csv", "bottom/data_0,2500_xtreme_narrow_equidistant_bottom.csv",
"bottom/data_0,5000_normal_narrow_equidistant_bottom.csv", "bottom/data_0,5000_xtreme_narrow_equidistant_bottom.csv",
"bottom/data_0,7500_normal_narrow_equidistant_bottom.csv", "bottom/data_0,7500_xtreme_narrow_equidistant_bottom.csv",
"bottom/data_-0,2500_normal_narrow_equidistant_bottom.csv", "bottom/data_-0,2500_xtreme_narrow_equidistant_bottom.csv",
"bottom/data_-0,5000_normal_narrow_equidistant_bottom.csv", "bottom/data_-0,5000_xtreme_narrow_equidistant_bottom.csv",
"bottom/data_-0,7500_normal_narrow_equidistant_bottom.csv", "bottom/data_-0,7500_xtreme_narrow_equidistant_bottom.csv"];

const attentionCheckFiles = ["attention-checks/data_0,7500_xtreme_narrow_uniform_top.csv",
"attention-checks/data_-0,7500_xtreme_narrow_uniform_bellow.csv"]

let currentIndex = 0;
let scatterplotData = [];
let timer;
let visibilityCount = 0;
let testEnded = false;
//let hoverCount = 0;
let hoveredPoints = [];
let interactionLog = [];
let slope = 0.00;
let countdownTime = 0;
let startTime = 0.0;
let timespent = 0.0;

function startDashboard() {
  function loadCSV(file) {
    return d3.csv(file);
  }

  Promise.all(files.map(loadCSV)).then(mainDataArray => {
    // Parse and convert strings to numbers
    mainDataArray = mainDataArray.map(data => {
      data.forEach(d => {
        d.x = +d.x;
        d.y = +d.y;
      });
      return data;
    });

    // Shuffle main data
    mainDataArray = mainDataArray.sort(() => Math.random() - 0.5);

    // Load attention check files
    Promise.all(attentionCheckFiles.map(loadCSV)).then(attentionDataArray => {
      attentionDataArray = attentionDataArray.map(data => {
        data.forEach(d => {
          d.x = +d.x;
          d.y = +d.y;
        });
        return data;
      });

      const oneThirdIndex = Math.floor(mainDataArray.length / 3);
      const twoThirdIndex = Math.floor((mainDataArray.length * 2) / 3) + 1; // +1 to account for earlier insertion

      scatterplotData = [
        ...mainDataArray.slice(0, oneThirdIndex).map(d => ({ data: d, type: "main" })),
        { data: attentionDataArray[0], type: "attentiontop" },
        ...mainDataArray.slice(oneThirdIndex, twoThirdIndex).map(d => ({ data: d, type: "main" })),
        { data: attentionDataArray[1], type: "attentionbottom" },
        ...mainDataArray.slice(twoThirdIndex).map(d => ({ data: d, type: "main" }))
      ];

      renderScatterplot(currentIndex);
    });
  }).catch(error => console.error("Error loading CSV files:", error));
}

function updateInstructions(index) {
  const type = scatterplotData[index].type;
  const instructionsDiv = document.querySelector('.instructions');

  if (type === "attentiontop") {
    instructionsDiv.innerHTML = `
      <h2>Instructions:</h2>
      <p>Adjust the slope of the red line, so that the value is <b>-1.00</b>.</p>
    `;
  } else if (type === "attentionbottom") {
    instructionsDiv.innerHTML = `
      <h2>Instructions:</h2>
      <p>Adjust the slope of the red line, so that the value is <b>1.00</b>.</p>
    `;
  } else {
    instructionsDiv.innerHTML = `
      <h2>Instructions:</h2>
      <p>Adjust the slope of the red line to reflect the trend you perceive on the scatterplot.</p>
    `;
  }
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

  //hoverCount = 0;
  //hoveredPoints = [];
  //updateHoverDisplay();

  d3.select("#scatterPlot").selectAll("*").remove();
  updateProgressBar(); // Update progress bar when rendering new scatterplot

  d3.select("#scatterPlot").selectAll("*").remove();
  const data = scatterplotData[index].data;
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
  //const xAxis = d3.axisBottom(xScale);
  //const yAxis = d3.axisLeft(yScale);
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

  const first100 = data.slice(0, 100);
  const avgY100 = d3.mean(first100, d => d.y);
  const y_100 = yScale(avgY100);

  const regressionLine = svg.append("line")
    .attr("x1", 0)
    .attr("y1", height/2)
    .attr("x2", width)
    .attr("y2", height/2)
    .attr("stroke", "red")
    .attr("stroke-width", 3);

  const ballLeft = svg.append("circle")
    .attr("cx", 0)
    .attr("cy", height/2)
    .attr("r", 8)
    .attr("fill", "red")
    .style("cursor", "grab");

  const smallBallLeft = svg.append("circle")
    .attr("cx", 0)
    .attr("cy", height/2)
    .attr("r", 4)  // Smaller radius
    .attr("fill", "white")
    .style("cursor", "grab");

  const ballRight = svg.append("circle")
    .attr("cx", width)
    .attr("cy", height/2)
    .attr("r", 8)
    .attr("fill", "red")
    .style("cursor", "grab");

  const smallBallRight = svg.append("circle")
    .attr("cx", width)
    .attr("cy", height/2)
    .attr("r", 4)
    .attr("fill", "white")
    .style("cursor", "grab");

  function updateSlopeDisplay() {
    let slope = 0.00
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
      let now = new Date();
      let timestamp = now.toLocaleString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
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
      let now = new Date();
      let timestamp = now.toLocaleString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
      timespent = ((performance.now() - startTime) / 1000).toFixed(3);
      interactionLog.push({ type: "dragEnd", scatterplot: files[currentIndex], side: "left", y: yScale.invert(parseFloat(ballLeft.attr("cy"))), timespent: timespent });
      dragData.left.end = yScale.invert(parseFloat(ballLeft.attr("cy")));
    });

  const dragRight = d3.drag()
    .on("start", function () {
      d3.select(this).style("cursor", "grabbing");
      dragRightCount++;
      let now = new Date();
      let timestamp = now.toLocaleString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
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
      let now = new Date();
      let timestamp = now.toLocaleString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
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
      scatterplot: files[currentIndex],
      left: { start: dragData.left.start, end: dragData.left.end },
      right: { start: dragData.right.start, end: dragData.right.end },
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
      .text(currentIndex === scatterplotData.length - 1 ? "Finish!" : "Submit!")
      .on("click", () => {
        storeFinalPositions();
        clearTimeout(timer);
        updateInstructions(currentIndex);
        goToNextScatterplot();
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
              let now = new Date();
              let timestamp = now.toLocaleString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
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

let navigatingToIntermediate = false;

function handleVisibilityChange() {
  if (document.hidden) {
    if (navigatingToIntermediate) {
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

function navigateToIntermediate() {
  navigatingToIntermediate = true; // Set flag before navigation
  window.location.href = "intermediate.html";
}

function endTest() {
  testEnded = true;
  if (currentIndex == scatterplotData.length - 1) {
    navigateToIntermediate(); // Use safe navigation
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