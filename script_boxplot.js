const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const size = 650;
const width = size - margin.left - margin.right;
const height = size - margin.top - margin.bottom;

const files = ["top-narrow-equidistant/data_0,0000_normal_narrow_equidistant_top.csv"];

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

  d3.select("#scatterPlot").selectAll("*").remove();
  updateProgressBar();

  const data = scatterplotData[index].data;
  const svg = d3.select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 50)  // Extra space for boxplots
    .attr("height", height + margin.top + margin.bottom + 50)
    .append("g")
    .attr("transform", `translate(${margin.left + 60},${margin.top})`);  // Shift right for y boxplot

  const xMax = Math.max(Math.abs(d3.min(data, d => d.x)), Math.abs(d3.max(data, d => d.x)));
  const xScale = d3.scaleLinear()
    .domain([-xMax, xMax])  // Center the X axis at 0
    .range([0, width]);

  const yMin = d3.min(data, d => d.y);
  const yMax = d3.max(data, d => d.y);
  const yScale = d3.scaleLinear()
    .domain([yMin - 10, yMax + 10])
    .range([height, 0]);

  // Axes without ticks (you had them hidden)
  const xAxis = d3.axisBottom(xScale).tickSize(0).tickFormat('');
  const yAxis = d3.axisLeft(yScale).tickSize(0).tickFormat('');

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  // Add Y axis
  svg.append("g")
    .call(yAxis);

  // Scatter plot points
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
    });

  // Draw bounding axis lines
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

  // Boxplot parameters
  const boxplotHeight = 40;  // height for boxplot below x-axis
  const boxplotWidth = 40;   // width for boxplot left of y-axis
  const boxplotMargin = 10;

  // --- Helper function to calculate boxplot stats ---
  function boxplotStats(values) {
    values = values.slice().sort(d3.ascending);
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const XtremeUpperFence = q3 + 3 * iqr;
    const XtremeLowerFence = q1 - 3 * iqr;

    const outliers = values.filter(v => v < lowerFence || v > upperFence);
    const nonOutliers = values.filter(v => v >= lowerFence && v <= upperFence);

    const min = d3.min(nonOutliers);
    const max = d3.max(nonOutliers);

    return { q1, median, q3, iqr, lowerFence, XtremeLowerFence, upperFence, XtremeUpperFence, min, max, outliers };
  }

  // --- Boxplot for X values under the x axis ---
  const xValues = data.map(d => d.x);
  const xStats = boxplotStats(xValues);

  // Group for x boxplot (below x axis)
  const xBoxplot = svg.append("g")
    .attr("transform", `translate(0, ${height + boxplotMargin})`);

  // Scale for x boxplot (horizontal)
  const xBoxScale = xScale;

  // Vertical scale for boxplot (small fixed height)
  const yBoxScale = d3.scaleLinear()
    .domain([0, 1])
    .range([boxplotHeight, 0]);

  // Draw box for IQR
  xBoxplot.append("rect")
    .attr("x", xBoxScale(xStats.q1))
    .attr("y", 0)
    .attr("width", xBoxScale(xStats.q3) - xBoxScale(xStats.q1))
    .attr("height", boxplotHeight)
    .attr("fill", "#ccc")
    .attr("stroke", "black");

  // Median line
  xBoxplot.append("line")
    .attr("x1", xBoxScale(xStats.median))
    .attr("x2", xBoxScale(xStats.median))
    .attr("y1", 0)
    .attr("y2", boxplotHeight)
    .attr("stroke", "black")
    .attr("stroke-width", 2);

  // Whiskers
  xBoxplot.append("line")  // lower whisker
    .attr("x1", xBoxScale(xStats.min))
    .attr("x2", xBoxScale(xStats.q1))
    .attr("y1", boxplotHeight / 2)
    .attr("y2", boxplotHeight / 2)
    .attr("stroke", "black");

  xBoxplot.append("line")  // upper whisker
    .attr("x1", xBoxScale(xStats.q3))
    .attr("x2", xBoxScale(xStats.max))
    .attr("y1", boxplotHeight / 2)
    .attr("y2", boxplotHeight / 2)
    .attr("stroke", "black");

  // Whisker caps
  xBoxplot.append("line")
    .attr("x1", xBoxScale(xStats.min))
    .attr("x2", xBoxScale(xStats.min))
    .attr("y1", boxplotHeight / 4)
    .attr("y2", (boxplotHeight / 4) * 3)
    .attr("stroke", "black");

  xBoxplot.append("line")
    .attr("x1", xBoxScale(xStats.max))
    .attr("x2", xBoxScale(xStats.max))
    .attr("y1", boxplotHeight / 4)
    .attr("y2", (boxplotHeight / 4) * 3)
    .attr("stroke", "black");

  // Outliers as circles
  xBoxplot.selectAll(".outlier")
    .data(xStats.outliers)
    .enter()
    .append("circle")
    .attr("cx", d => xBoxScale(d))
    .attr("cy", boxplotHeight / 2)
    .attr("r", 3)
    .attr("fill", "red")
    .attr("stroke", "black");

  // --- Boxplot for Y values left of y axis ---
  const yValues = data.map(d => d.y);
  const yStats = boxplotStats(yValues);

  // Group for y boxplot (left of y axis)
  const yBoxplot = svg.append("g")
    .attr("transform", `translate(${-boxplotWidth - boxplotMargin}, 0)`);

  // Vertical scale for y boxplot
  const yBoxScaleY = d3.scaleLinear()
    .domain([yMin - 10, yMax + 10])
    .range([height, 0]);

  // Horizontal scale for boxplot width
  const xBoxScaleY = d3.scaleLinear()
    .domain([0, 1])
    .range([0, boxplotWidth]);

  // Draw box for IQR (horizontal orientation)
  yBoxplot.append("rect")
    .attr("x", 0)
    .attr("y", yBoxScaleY(yStats.q3))
    .attr("width", boxplotWidth)
    .attr("height", yBoxScaleY(yStats.q1) - yBoxScaleY(yStats.q3))
    .attr("fill", "#ccc")
    .attr("stroke", "black");

  // Median line
  yBoxplot.append("line")
    .attr("x1", 0)
    .attr("x2", boxplotWidth)
    .attr("y1", yBoxScaleY(yStats.median))
    .attr("y2", yBoxScaleY(yStats.median))
    .attr("stroke", "black")
    .attr("stroke-width", 2);

  // Whiskers
  yBoxplot.append("line")  // lower whisker
    .attr("x1", boxplotWidth / 2)
    .attr("x2", boxplotWidth / 2)
    .attr("y1", yBoxScaleY(yStats.min))
    .attr("y2", yBoxScaleY(yStats.q1))
    .attr("stroke", "black");

  yBoxplot.append("line")  // upper whisker
    .attr("x1", boxplotWidth / 2)
    .attr("x2", boxplotWidth / 2)
    .attr("y1", yBoxScaleY(yStats.q3))
    .attr("y2", yBoxScaleY(yStats.max))
    .attr("stroke", "black");

  // Whisker caps
  yBoxplot.append("line")
    .attr("x1", boxplotWidth / 4)
    .attr("x2", (boxplotWidth / 4) * 3)
    .attr("y1", yBoxScaleY(yStats.min))
    .attr("y2", yBoxScaleY(yStats.min))
    .attr("stroke", "black");

  yBoxplot.append("line")
    .attr("x1", boxplotWidth / 4)
    .attr("x2", (boxplotWidth / 4) * 3)
    .attr("y1", yBoxScaleY(yStats.max))
    .attr("y2", yBoxScaleY(yStats.max))
    .attr("stroke", "black");

  // Outliers as circles
  yBoxplot.selectAll(".outlier")
    .data(yStats.outliers)
    .enter()
    .append("circle")
    .attr("cy", d => yBoxScaleY(d))
    .attr("cx", boxplotWidth / 2)
    .attr("r", 3)
    .attr("fill", "red")
    .attr("stroke", "black")

  console.log("Xupperfence: " + xStats.upperFence);
  console.log("Yupperfence: " + yStats.upperFence);
  console.log("Ylowerfence: " + yStats.lowerFence);
  console.log("Xextremeupperfence: " + xStats.XtremeUpperFence);
  console.log("Yextremeupperfence: " + yStats.XtremeUpperFence);
  console.log("Yextremelowerfence: " + yStats.XtremeLowerFence);
  console.log("Number of X outliers: " + xStats.outliers.length);
  console.log("Number of Y outliers: " + yStats.outliers.length);

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
        clearTimeout(timer);
        goToNextScatterplot();
      });

  startTimer();


  function goToNextScatterplot() {
    if (currentIndex < scatterplotData.length - 1) {
      currentIndex++;
      renderScatterplot(currentIndex);
    } else if (currentIndex == scatterplotData.length - 1) {
      endTest()
    }
  }

  function startTimer() {
      countdownTime = 300;
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