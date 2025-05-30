// Define margin and dimensions for the scatterplot
const margin = { top: 20, right: 20, bottom: 20, left: 20 }; // Increased bottom margin for axis labels
const width = 1000 - margin.left - margin.right;
const height = 650 - margin.top - margin.bottom;

// Function to start the dashboard
function startDashboard() {
  // Helper function to load a CSV file
  function loadCSV(file) {
    return d3.csv(file);
  }

  // File names for the CSV files
  const file1 = "data--0043.csv"; // Main data
  const file2 = "";  // Normal Outliers data
  const file3 = "extreme-outliers-round-one-spot.csv";  // Normal Outliers data

  // Load both files and process the data
  Promise.all([loadCSV(file1), loadCSV(file2), loadCSV(file3)])
    .then(([data1, data2, data3]) => {
      // Parse the data from both files to ensure numeric values for x and y
      data1.forEach(d => {
        d.x = +d.x; // Convert to numeric
        d.y = +d.y; // Convert to numeric
      });
      data2.forEach(d => {
        d.x = +d.x; // Convert to numeric
        d.y = +d.y; // Convert to numeric
      });
      data3.forEach(d => {
        d.x = +d.x; // Convert to numeric
        d.y = +d.y; // Convert to numeric
      });

      // Call the function to create the scatterplot with the two datasets
      startScatterplot(data1, data2, data3);
    })
    .catch(error => console.error("Error loading the CSV files:", error));
}


// Function to create the scatterplot
function startScatterplot(data1, data2, data3) {
  // Set up the SVG element for the scatterplot
  const svg = d3
    .select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set domain starting at -10 for both axes
  const xScale = d3
    .scaleLinear()
    .domain([-7, d3.max(data1, d => d.x) + 10]) // Set domain for x-axis starting at -10
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([d3.min(data1, d => d.y) - 10, d3.max(data1, d => d.y) + 10]) // Add more padding for more space
    .range([height, 0]);

  // Plot data1
  svg
    .selectAll(".circle1")
    .data(data1)
    .enter()
    .append("circle")
    .attr("class", "circle1")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 3)
    .attr("fill", "steelblue")
    .attr("stroke", "black")
    .append("title")
    .text(d => `x: ${d.x.toFixed(2)}, y: ${d.y.toFixed(2)}`);

  // Plot data2
  svg
    .selectAll(".circle2")
    .data(data2)
    .enter()
    .append("circle")
    .attr("class", "circle2")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 3)
    .attr("fill", "purple")
    .attr("stroke", "black")
    .append("title")
    .text(d => `x: ${d.x.toFixed(2)}, y: ${d.y.toFixed(2)}`);

  // Plot data3
  svg
    .selectAll(".circle3")
    .data(data3)
    .enter()
    .append("circle")
    .attr("class", "circle3")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 3)
    .attr("fill", "steelblue")
    .attr("stroke", "black")
    .append("title")
    .text(d => `x: ${d.x.toFixed(2)}, y: ${d.y.toFixed(2)}`);

  // Add a simple X-axis line (bottom horizontal line)
  svg
    .append("line")
    .attr("x1", 0) // Start at x = 0
    .attr("y1", height) // Position at the bottom of the chart
    .attr("x2", width) // End at the right of the chart
    .attr("y2", height) // End at the bottom of the chart
    .attr("stroke", "black") // Line color
    .attr("stroke-width", 2); // Line thickness

  // Add a simple Y-axis line (left vertical line)
  svg
    .append("line")
    .attr("x1", 0) // Start at x = 0
    .attr("y1", 0) // Start at the top of the chart
    .attr("x2", 0) // End at the bottom of the chart
    .attr("y2", height) // End at the bottom of the chart
    .attr("stroke", "black") // Line color
    .attr("stroke-width", 2); // Line thickness

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const regressionLine = svg.append("line")
    .attr("id", "regression-line")
    .attr("x1", 0)
    .attr("y1", height / 2)
    .attr("x2", width)
    .attr("y2", height / 2)
    .attr("stroke", "red")
    .attr("stroke-width", 3);

  // Add a slider to control the angle of the regression line
  const angleSlider = d3.select("#scatterPlot").append("input")
    .attr("type", "range")
    .attr("min", -90) // Angle range from -90 to 90 degrees for full rotation
    .attr("max", 90)
    .attr("value", 0) // Start with a horizontal line (0 degrees)
    .attr("step", 1)
    .attr("id", "angle-slider")
    .style("width", "100%")
    .on("input", function() {
      const angle = +this.value * (Math.PI / 180); // Convert degrees to radians
      rotateRegressionLine(angle);
    });

    const leftSlider = d3.select("#scatterPlot").append("input")
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", height)
    .attr("value", height / 2)
    .attr("step", 1)
    .attr("id", "line-slider-left")
    .style("position", "absolute")
    .style("transform", "rotate(90deg)") // Rotate the slider to make it vertical
    .style("left", "-178px") // Adjust the left position to align with the Y-axis
    .style("top", "355px") // Center it vertically based on the height of the scatterplot
    .style("width", "650px") // Set a width for the slider
    .on("input", function() {
      const newY = +this.value;
      regressionLine.attr("y1", newY);
    });

  // Function to rotate the regression line based on the angle
  function rotateRegressionLine(angle) {
    const centerX = width / 2;
    const centerY = height / 2;
    const length = Math.max(width, height); // Ensure the line extends beyond plot limits

    // Calculate new coordinates based on angle
    const x1 = centerX - (length * Math.cos(angle));
    const y1 = centerY - (length * Math.sin(angle));
    const x2 = centerX + (length * Math.cos(angle));
    const y2 = centerY + (length * Math.sin(angle));

    regressionLine
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2);
  }

  // Initialize with a horizontal line at the start
  rotateRegressionLine(0);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Add the X-axis with ticks and labels
  //const xAxis = d3.axisBottom(xScale).ticks(10); // Number of ticks on the X-axis

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .selectAll("text")
    .style("font-size", "12px"); // Customize font size for axis labels

  // Add the Y-axis with ticks and labels
  //const yAxis = d3.axisLeft(yScale).ticks(10); // Number of ticks on the Y-axis

  svg.append("g")
    .call(yAxis)
    .selectAll("text")
    .style("font-size", "12px"); // Customize font size for axis labels
}
