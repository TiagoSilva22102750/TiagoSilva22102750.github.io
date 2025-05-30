// Define margin and dimensions for the scatterplot
const margin = { top: 20, right: 20, bottom: 50, left: 50 }; // Increased bottom margin for axis labels
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
  const file3 = "extreme-outliers-round-one-spot.csv";  // Extreme Outliers data

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

// Function to calculate boxplot statistics
function calculateBoxplotStats(data, valueAccessor) {
  const sorted = data.map(valueAccessor).sort(d3.ascending);
  const q1 = d3.quantile(sorted, 0.25);
  const median = d3.quantile(sorted, 0.5);
  const q3 = d3.quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const lowerWhisker = d3.max([d3.min(sorted), q1 - 1.5 * iqr]);
  const upperWhisker = d3.min([d3.max(sorted), q3 + 1.5 * iqr]);

  return { q1, median, q3, lowerWhisker, upperWhisker };
}

// Function to identify outliers based on boxplot statistics
function identifyOutliers(data, xStats, yStats) {
  return data.filter(d => {
    // Check if x and y are outliers based on the boxplot whiskers
    return (
      d.x < xStats.lowerWhisker || d.x > xStats.upperWhisker ||
      d.y < yStats.lowerWhisker || d.y > yStats.upperWhisker
    );
  });
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

  // Set domain for both axes
  const xScale = d3
    .scaleLinear()
    .domain([-7, d3.max(data1, d => d.x) + 10])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([d3.min(data1, d => d.y) - 10, d3.max(data1, d => d.y) + 10])
    .range([height, 0]);

  // Plot data1 (Main dataset)
  svg.selectAll(".circle1")
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

  // Plot data3 (Extreme outliers) - Outliers data
  svg.selectAll(".circle3")
    .data(data3)
    .enter()
    .append("circle")
    .attr("class", "circle3")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 4)
    .attr("fill", "red")
    .attr("stroke", "black")
    .append("title")
    .text(d => `x: ${d.x.toFixed(2)}, y: ${d.y.toFixed(2)}`);

  // Calculate boxplot statistics for X and Y from file1
  const xStats = calculateBoxplotStats(data1, d => d.x);
  const yStats = calculateBoxplotStats(data1, d => d.y);

  // Identify outliers from file3 based on boxplot stats of file1
  const outliers = identifyOutliers(data3, xStats, yStats);

  // Add points for outliers in boxplot sections
  // Plot X-axis outliers
  svg.selectAll(".outlierX")
    .data(outliers.filter(d => d.x < xStats.lowerWhisker || d.x > xStats.upperWhisker))
    .enter()
    .append("circle")
    .attr("class", "outlierX")
    .attr("cx", d => xScale(d.x))
    .attr("cy", height + 20) // Positioning the outliers below the X-axis boxplot
    .attr("r", 5)
    .attr("fill", "orange")
    .attr("stroke", "black")
    .append("title")
    .text(d => `Outlier X: ${d.x.toFixed(2)}`);

  // Plot Y-axis outliers
  svg.selectAll(".outlierY")
    .data(outliers.filter(d => d.y < yStats.lowerWhisker || d.y > yStats.upperWhisker))
    .enter()
    .append("circle")
    .attr("class", "outlierY")
    .attr("cx", -20) // Positioning the outliers to the left of the Y-axis boxplot
    .attr("cy", d => yScale(d.y))
    .attr("r", 5)
    .attr("fill", "orange")
    .attr("stroke", "black")
    .append("title")
    .text(d => `Outlier Y: ${d.y.toFixed(2)}`);

  // Add X-axis without ticks and numbers
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).tickSize(0).tickFormat(() => "")); // No ticks and no numbers on X-axis

  // Add Y-axis without ticks and numbers
  svg.append("g")
    .call(d3.axisLeft(yScale).tickSize(0).tickFormat(() => "")); // No ticks and no numbers on Y-axis

  // Draw X-axis boxplot
  svg.append("rect")
    .attr("x", xScale(xStats.q1))
    .attr("y", height + 10)
    .attr("width", xScale(xStats.q3) - xScale(xStats.q1))
    .attr("height", 20)
    .attr("fill", "lightgrey")
    .attr("stroke", "black");

  svg.append("line")
    .attr("x1", xScale(xStats.median))
    .attr("y1", height + 10)
    .attr("x2", xScale(xStats.median))
    .attr("y2", height + 30)
    .attr("stroke", "black");

  svg.append("line")
    .attr("x1", xScale(xStats.lowerWhisker))
    .attr("y1", height + 20)
    .attr("x2", xScale(xStats.q1))
    .attr("y2", height + 20)
    .attr("stroke", "black");

  svg.append("line")
    .attr("x1", xScale(xStats.q3))
    .attr("y1", height + 20)
    .attr("x2", xScale(xStats.upperWhisker))
    .attr("y2", height + 20)
    .attr("stroke", "black");

  // Draw Y-axis boxplot
  svg.append("rect")
    .attr("x", -30)
    .attr("y", yScale(yStats.q3))
    .attr("width", 20)
    .attr("height", yScale(yStats.q1) - yScale(yStats.q3))
    .attr("fill", "lightgrey")
    .attr("stroke", "black");

  svg.append("line")
    .attr("x1", -30)
    .attr("y1", yScale(yStats.median))
    .attr("x2", -10)
    .attr("y2", yScale(yStats.median))
    .attr("stroke", "black");

  svg.append("line")
    .attr("x1", -20)
    .attr("y1", yScale(yStats.lowerWhisker))
    .attr("x2", -20)
    .attr("y2", yScale(yStats.q1))
    .attr("stroke", "black");

  svg.append("line")
    .attr("x1", -20)
    .attr("y1", yScale(yStats.q3))
    .attr("x2", -20)
    .attr("y2", yScale(yStats.upperWhisker))
    .attr("stroke", "black");
}
