const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const size = 700;
const width = size - margin.left - margin.right;
const height = size - margin.top - margin.bottom;

const files = ["top-round-uniform/data_0,0000_normal_round_uniform_top.csv", "top-round-uniform/data_0,0000_extreme_round_uniform_top.csv",
"top-round-equidistant/data_0,0000_normal_round_equidistant_top.csv", "top-round-equidistant/data_0,0000_extreme_round_equidistant_top.csv",
"top-round-onespot/data_0,0000_normal_round_one-spot_top.csv", "top-round-onespot/data_0,0000_extreme_round_one-spot_top.csv",
"top-narrow-uniform/data_0,0000_normal_narrow_uniform_top.csv", "top-narrow-uniform/data_0,0000_extreme_narrow_uniform_top.csv",
"top-narrow-equidistant/data_0,0000_normal_narrow_equidistant_top.csv", "top-narrow-equidistant/data_0,0000_xtreme_narrow_equidistant_top.csv",
"top-narrow-onespot/data_0,0000_normal_narrow_one-spot_top.csv", "top-narrow-onespot/data_0,0000_extreme_narrow_one-spot_top.csv",
"bottom-round-uniform/data_0,0000_normal_round_uniform_bottom.csv", "bottom-round-uniform/data_0,0000_extreme_round_uniform_bottom.csv",
"bottom-round-equidistant/data_0,0000_normal_round_equidistant_bottom.csv", "bottom-round-equidistant/data_0,0000_extreme_round_equidistant_bottom.csv",
"bottom-round-onespot/data_0,0000_normal_round_one-spot_bottom.csv", "bottom-round-onespot/data_0,0000_extreme_round_one-spot_bottom.csv",
"bottom-narrow-uniform/data_0,0000_normal_narrow_uniform_bottom.csv", "bottom-narrow-uniform/data_0,0000_extreme_narrow_uniform_bottom.csv",
"bottom-narrow-equidistant/data_0,0000_normal_narrow_equidistant_bottom.csv", "bottom-narrow-equidistant/data_0,0000_xtreme_narrow_equidistant_bottom.csv",
"bottom-narrow-onespot/data_0,0000_normal_narrow_one-spot_bottom.csv", "bottom-narrow-onespot/data_0,0000_extreme_narrow_one-spot_bottom.csv"];
let effectiveFiles;

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
let ballLeftY = null;
let ballRightY = null;
let smallBallLeftY = null;
let smallBallRightY = null;
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
  setCookie('scatterplotData', JSON.stringify(scatterplotData));
  setCookie('hoveredPoints', JSON.stringify(hoveredPoints));
  setCookie('interactionLog', JSON.stringify(interactionLog));
  setCookie('slope', slope);
  setCookie('countdownTime', countdownTime);
  setCookie('startTime', startTime);
  setCookie('timespent', timespent);
  setCookie('ballLeftY', ballLeftY);
  setCookie('ballRightY', ballRightY);
  setCookie('smallBallLeftY', smallBallLeftY);
  setCookie('smallBallRightY', smallBallRightY);
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
  const savedScatter = getCookie('scatterplotData');
  const hovered = getCookie('hoveredPoints');
  const interactions = getCookie('interactionLog');

  if (isValidNumber(idx)) currentIndex = Number(idx);
  if (isValidNumber(savedTime)) countdownTime = Number(savedTime);
  if (savedScatter) scatterplotData = JSON.parse(savedScatter);
  if (hovered) hoveredPoints = JSON.parse(hovered);
  if (interactions) interactionLog = JSON.parse(interactions);

  const slopeVal = getCookie('slope');
  const start = getCookie('startTime');
  const spent = getCookie('timespent');
  const savedBallLeftY = getCookie('ballLeftY');
  const savedBallRightY = getCookie('ballRightY');
  const savedSmallBallLeftY = getCookie('smallBallLeftY');
  const savedSmallBallRightY = getCookie('smallBallRightY');

  if (isValidNumber(slopeVal)) slope = Number(slopeVal);
  if (isValidNumber(start)) startTime = Number(start);
  if (isValidNumber(spent)) timespent = Number(spent);

  // Safe fallback to default if values are not valid numbers
  ballLeftY = isValidNumber(savedBallLeftY) ? Number(savedBallLeftY) : height / 2;
  ballRightY = isValidNumber(savedBallRightY) ? Number(savedBallRightY) : height / 2;
  smallBallLeftY = isValidNumber(savedSmallBallLeftY) ? Number(savedSmallBallLeftY) : height / 2;
  smallBallRightY = isValidNumber(savedSmallBallRightY) ? Number(savedSmallBallRightY) : height / 2;
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
  const ended = getCookie('testEnded') === 'true';

  if (ended) {
    // User already finished → send them straight to end page
    window.location.replace("behaviour_end.html");
    return;
  }
  // This fires even on back navigation
  const cameFromIntermediate = getCookie('cameFromIntermediate');
  blockReentryIfAlreadyStarted();
});

function blockReentryIfAlreadyStarted() {
  const cameFromIntermediate = getCookie('cameFromIntermediate');
  const testEnded = getCookie('testEnded') === 'true';

  if (cameFromIntermediate === 'true' && !testEnded) {
    restoringSession = true; // prevent visibility change during redirect
    setCookie('cameFromIntermediate', 'false');
    window.location.replace("intermediate.html");
  }
}

function startDashboard() {
  if (window.alertShown) return;
  window.alertShown = true;

  setCookie('cameFromStudy', 'true');

  const cameFromTestTrial = getCookie('cameFromTestTrial') === 'true';
  userID = localStorage.getItem('prolificUserID');

  // Detect navigation type
  let navType = performance.getEntriesByType("navigation")[0]?.type || "navigate";

  // Show alert only if it's a reload and not from initial.js
  if (visibilityCount === 1 && navType === "reload" && !cameFromTestTrial) {
    alert("If you switch tabs, refresh or minimize the window again, the test will end.");
  } else if (visibilityCount > 1) {
    behaviourEndTest();
  }

  // Clear the flag after use
  setCookie('cameFromTestTrial', 'false');

  function loadCSV(file) {
    return d3.csv(file);
  }

  let savedShuffledFiles = getCookie('shuffledFiles');

  if (savedShuffledFiles) {
    // Use the saved order
    effectiveFiles = JSON.parse(savedShuffledFiles);
  } else {
    // Shuffle and save new order
    const shuffledIndices = d3.shuffle(d3.range(files.length));
    effectiveFiles = shuffledIndices.map(i => files[i]);
    setCookie('shuffledFiles', JSON.stringify(effectiveFiles));
  }

  Promise.all(effectiveFiles.map(loadCSV)).then(mainDataArray => {
    // Parse and convert strings to numbers
    mainDataArray = mainDataArray.map(data => {
      data.forEach(d => {
        d.x = +d.x;
        d.y = +d.y;
      });
      return data;
    });

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
      <p>Adjust the slope or position of the red line, so that the value is <b>-1.00</b>.</p>
    `;
  } else if (type === "attentionbottom") {
    instructionsDiv.innerHTML = `
      <h2>Instructions:</h2>
      <p>Adjust the slope or position of the red line, so that the value is <b>1.00</b>.</p>
    `;
  } else {
    instructionsDiv.innerHTML = `
      <h2>Instructions:</h2>
      <p>Adjust the slope or position of the red line.</p>
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

  function getCurrentScatterplotFile(index) {
    const item = scatterplotData[index];
    if (!item || !item.type) return "unknown";

    if (item.type === "main") {
      // Find corresponding index in effectiveFiles by skipping attention checks
      const mainIndex = scatterplotData
        .slice(0, index)
        .filter(d => d.type === "main").length;

      return effectiveFiles[mainIndex];
    }

    if (item.type === "attentiontop") return attentionCheckFiles[0];
    if (item.type === "attentionbottom") return attentionCheckFiles[1];

    return "unknown";
  }


  if (!isValidNumber(getCookie('ballLeftY'))) {
    clearCookies();
  }

  const defaultY = height / 2;
  const leftY = ballLeftY !== null ? ballLeftY : defaultY;
  const rightY = ballRightY !== null ? ballRightY : defaultY;

  if (testEnded) {
    alert("The test has ended because you switched tabs, refreshed or minimized the window too many times.");
    return;
  }

  //hoverCount = 0;
  //hoveredPoints = [];
  //updateHoverDisplay();

  d3.select("#scatterPlot").selectAll("*").remove();
  updateProgressBar(); // Update progress bar when rendering new scatterplot

  const pointsWidth = width * 1.5;

  d3.select("#scatterPlot").selectAll("*").remove();
  const data = scatterplotData[index].data;
  const svg = d3.select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xExtent = d3.extent(data, d => d.x);
  const xMax = Math.max(Math.abs(xExtent[0]), Math.abs(xExtent[1]));
  const xScale = d3.scaleLinear()
    .domain([-xMax, xMax])
    .range([5, pointsWidth]);

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
        interactionLog.push({ type: "hover", scatterplot: getCurrentScatterplotFile(currentIndex), x: d.x, y: d.y, timespent: timespent });
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
    .attr("y1", leftY)
    .attr("x2", width)
    .attr("y2", rightY)
    .attr("stroke", "red")
    .attr("stroke-width", 3);

  const ballLeft = svg.append("circle")
    .attr("cx", 0)
    .attr("cy", leftY)
    .attr("r", 8)
    .attr("fill", "red")
    .style("cursor", "grab");

  const smallBallLeft = svg.append("circle")
    .attr("cx", 0)
    .attr("cy", leftY)
    .attr("r", 4)  // Smaller radius
    .attr("fill", "white")
    .style("cursor", "grab");

  const ballRight = svg.append("circle")
    .attr("cx", width)
    .attr("cy", rightY)
    .attr("r", 8)
    .attr("fill", "red")
    .style("cursor", "grab");

  const smallBallRight = svg.append("circle")
    .attr("cx", width)
    .attr("cy", rightY)
    .attr("r", 4)
    .attr("fill", "white")
    .style("cursor", "grab");

  function updateSlopeDisplay() {
    let y1 = parseFloat(ballRight.attr("cy"));
    let y2 = parseFloat(ballLeft.attr("cy"));
    slope = (y2 - y1) / width;
    slope = slope.toFixed(2);

    d3.select("#slopeDisplay").text(`Slope: ${slope}`);
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
      interactionLog.push({ type: "dragStart", scatterplot: getCurrentScatterplotFile(currentIndex), side: "left", y: yScale.invert(parseFloat(ballLeft.attr("cy"))), timespent: timespent });
    })
    .on("drag", function (event) {
      let newY = Math.max(0, Math.min(height, event.y));
      ballLeft.attr("cy", newY);
      ballLeftY = newY;
      smallBallLeft.attr("cy", newY);
      smallBallLeftY = newY;
      regressionLine.attr("y1", newY);
      updateSlopeDisplay();
    })
    .on("end", function () {
      d3.select(this).style("cursor", "grab"); // 👈 back to open hand
      let now = new Date();
      let timestamp = now.toLocaleString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
      timespent = ((performance.now() - startTime) / 1000).toFixed(3);
      interactionLog.push({ type: "dragEnd", scatterplot: getCurrentScatterplotFile(currentIndex), side: "left", y: yScale.invert(parseFloat(ballLeft.attr("cy"))), timespent: timespent });
      dragData.left.end = yScale.invert(parseFloat(ballLeft.attr("cy")));
    });

  const dragRight = d3.drag()
    .on("start", function () {
      d3.select(this).style("cursor", "grabbing");
      dragRightCount++;
      let now = new Date();
      let timestamp = now.toLocaleString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
      timespent = ((performance.now() - startTime) / 1000).toFixed(3);
      interactionLog.push({ type: "dragStart", scatterplot: getCurrentScatterplotFile(currentIndex), side: "right", y: yScale.invert(parseFloat(ballRight.attr("cy"))), timespent: timespent });
    })
    .on("drag", function (event) {
      let newY = Math.max(0, Math.min(height, event.y));
      ballRight.attr("cy", newY);
      ballRightY = newY;
      smallBallRight.attr("cy", newY);
      smallBallRightY = newY;
      regressionLine.attr("y2", newY);
      updateSlopeDisplay();
    })
    .on("end", function () {
      d3.select(this).style("cursor", "grab");
      let now = new Date();
      let timestamp = now.toLocaleString() + '.' + now.getMilliseconds().toString().padStart(3, '0');
      timespent = ((performance.now() - startTime) / 1000).toFixed(3);
      interactionLog.push({ type: "dragEnd", scatterplot: getCurrentScatterplotFile(currentIndex), side: "right", y: yScale.invert(parseFloat(ballRight.attr("cy"))), timespent: timespent });
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
      scatterplot: getCurrentScatterplotFile(currentIndex),
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
        timespent = ((performance.now() - startTime) / 1000).toFixed(3);

        const trialData = {
          user_id: userID, // pode vir de uma variável global ou input
          file_name: getCurrentScatterplotFile(currentIndex), // substitui se necessário
          slope: slope,
          timespent: timespent, // calcula esta duração como quiseres
          start_position_left: dragData.left.start,
          end_position_left: dragData.left.end,
          start_position_right: dragData.right.start,
          end_position_right: dragData.right.end
        };

        const eventData = {
          user_id: userID, // pode vir de uma variável global ou input
          file_name: getCurrentScatterplotFile(currentIndex), // substitui se necessário
          start_position_left: dragData.left.start,
          end_position_left: dragData.left.end,
          start_position_right: dragData.right.start,
          end_position_right: dragData.right.end,
          interaction_log: interactionLog
        };

        Promise.all([
          sendTrialData(trialData),
          sendEventData(eventData)
        ]).then(() => {
          storeFinalPositions();
          clearTimeout(timer);
          updateInstructions(currentIndex);
          goToNextScatterplot();
        }).catch((error) => {
          console.error("Error sending the data:", error);
        });
      });

  startTimer();


  function goToNextScatterplot() {
    if (currentIndex < scatterplotData.length - 1) {
      currentIndex++;

      countdownTime = 30;
      ballLeftY = null;
      ballRightY = null;
      smallBallLeftY = null;
      smallBallRightY = null;

      updateInstructions(currentIndex);
      renderScatterplot(currentIndex);
    } else if (currentIndex === scatterplotData.length - 1) {
      behaviourEndTest();
    }
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
        const trialData = {
          user_id: userID, // pode vir de uma variável global ou input
          file_name: getCurrentScatterplotFile(currentIndex), // substitui se necessário
          slope: slope,
          timespent: timespent, // calcula esta duração como quiseres
          start_position_left: dragData.left.start,
          end_position_left: dragData.left.end,
          start_position_right: dragData.right.start,
          end_position_right: dragData.right.end
        };

        const eventData = {
          user_id: userID, // pode vir de uma variável global ou input
          file_name: getCurrentScatterplotFile(currentIndex), // substitui se necessário
          start_position_left: dragData.left.start,
          end_position_left: dragData.left.end,
          start_position_right: dragData.right.start,
          end_position_right: dragData.right.end,
          interaction_log: interactionLog
        };

        clearInterval(timer);
        let timestamp = new Date().toLocaleString();
        interactionLog.push({ type: "timeout", scatterplot: getCurrentScatterplotFile(currentIndex), index: currentIndex, countdownTime });

        Promise.all([
          sendTrialData(trialData),
          sendEventData(eventData)
        ]).then(() => {
          storeFinalPositions();
          goToNextScatterplot();
        }).catch((error) => {
          console.error("Error sending the data:", error);
        });
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
    setCookie('visibilityCount', visibilityCount);
    saveState();

    if (visibilityCount === 1) {
      alert("If you switch tabs, refresh or minimize the window again, the test will end.");
    } else if (visibilityCount > 1) {
      behaviourEndTest();
    }
  }
}

function navigateToIntermediate() {
  navigatingToIntermediate = true; // Set flag before navigation
  clearCookies();
  setCookie('cameFromStudy', 'true');
  window.location.replace("intermediate.html");
}

function behaviourEndTest() {
  clearCookies();
  testEnded = true;

  const userBehaviourData = {
    user_id: userID,
    visibilityCount: visibilityCount
  };

  if (currentIndex == scatterplotData.length - 1) {
    navigateToIntermediate(); // Use safe navigation
  } else {
    setCookie('testEnded', testEnded);
    sendUserBehaviourData(userBehaviourData);
    window.location.replace("behaviour_end.html"); // Normal navigation for other pages
  }
}

document.addEventListener('visibilitychange', handleVisibilityChange);

function handleBeforeUnload(event) {
  //if (visibilityCount > 1) {
    //event.preventDefault();
    //event.returnValue = 'The test will be finished if you leave the page now.';
  //}
}

function sendTrialData(data) {
  /*
  return fetch("http://193.136.128.108:5000/submit-trial", {
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
  return fetch("//web.tecnico.ulisboa.pt/ist1111187/submit-trial.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
}

function sendEventData(data) {
  /*
  return fetch("http://193.136.128.108:5000/submit-event", {
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
  return fetch("//web.tecnico.ulisboa.pt/ist1111187/submit-event.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
}

function sendUserBehaviourData(data) {
  return fetch("//web.tecnico.ulisboa.pt/ist1111187/submit-user-behaviour.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json(); // Or res.text() if PHP returns plain text
  })
  .then(result => {
    //console.log("Behaviour response:", result);
    return result;
  })
  .catch(err => {
    console.error("BehaviourData error:", err);
    throw err;
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    return false;
  }
});

loadState();
startDashboard();