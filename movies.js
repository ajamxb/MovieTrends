// Contains the top 25 movies from 1983-2012 
var moviesDataset;

// Contains genre data for the top 25 movies from 1983-2012
var genreGroupsIncomeDataset, genreGroupsIncomeInflationDataset;

// Contains total incomes for the top 25 movies from 1983-2012
var totalIncomeDataset;

// CSV filenames 
var files = new Array("1983-2012_movies.csv", "1983-2012_movies_totalincomes.csv", "1983-2012_genre_groups_income.csv", "1983-2012_genre_groups_income_inflation.csv");

// Dimensions for all the components in our vis
var svgWidth = 1000;
var svgHeight = 800;
var totalChartHeight = 300;
var chartWidth = 1000;
var chartHeight = 300;
var detailsWidth = 1000;
var detailsHeight = 150; //200;
var filtersWidth = 200;
var filtersHeight = 800;

var hiddenCoordinate = -100;

// svg variables
var svg, bubbleSvg, detailsSvg, lineSvg, barSvg;

// Details on demand space
var detailsRect;

// Linechart Variables
// once data is imported, will map genre group name to values (.year and .count)
var genreGroupsIncome, genreGroupsIncomeInflation;

// Bubblechart variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var years = [1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1992, 1993, 1994, 1995, 1996,
             1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
             2012];

var genreNames = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", 
				  "Fantasy", "Horror", "Musical", "Romance", "Sci-Fi", "Thriller", "War", 
				  "Western"];
             
var genreColors = ["#D63E3F", "#C1E090", "#65B5F7", "#F5EA58", "#FAAC3E", "#BFE3E1", "#89739E", "#DE76A1",
                   "#454269", "#D8C0EB", "#FAC8E8", "#7CB360", "#BFBFBF", "#9E5D5D", "#E8C387"];
                   
//var genreList = [""]
var currYear = years[years.length-1];

// Represent Jan and Dec, respectively
var startMonth = 11; 
var endMonth = 11;

// Represent first and last day of the month, respectively
var startDay = 25; 
var endDay = 31; // Because year ends with December, we use 31st

var startDate = "2013-01-01";
var endDate = "2013-12-31";

// Format used to parced the dates in the csv
var dateFormat = d3.time.format("%Y-%m-%d").parse;

// Indicates the graph's current mode (e.g., domestic income or inflation adjusted income)
var indexCurrYValue = 0;
var yValues = ["inflation_domestic_income", "domestic_income"];

var scaleOffset = 50;
var axisLabelMargin = 40;
var axisLabelWidth = 50;

// Radius of a bubble
var radius = 7;
var stroke = 4;

// Width of a bar 
var barWidth = 25;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var genreGroupNames = ["Action, Adventure, Thriller, Crime, Western", "Animation", "Horror, Fantasy, Sci-Fi", 
					   "Comedy, Musical", "Drama, Romance, War", "Documentary"];
					   
var genreGroupColors = ["#D63E3F", "#65B5F7", "#454269", "#F5EA58", "#89739E", "#BFE3E1"];

var genreColorKeyValue = {"Action, Adventure, Thriller, Crime, Western": "#D63E3F",
					  "Animation": "#65B5F7",
					  "Horror, Fantasy, Sci-Fi": "#454269",
					  "Comedy, Musical": "#F5EA58",
					  "Drama, Romance, War": "#89739E",
					  "Documentary": "#BFE3E1"};

// Instead of having incomes display as millions (1,000,000), have them display as 100
var factor = 1000000.0;

// Variables used for details on demand 
// These are set when hovering over a point on the line graph or a movie in the bubble graph
var year, currDistributor, currRating, currGenre, currTitle, currBudget, currIncome, currAdjustedIncome;

// formats dollar amount with dollar sign and commas							        
var incomeFormat = d3.format("$,f");
	
/*
 * We have referenced this code from https://gist.github.com/trtg/3922684
 * We use this to move an element to the front.
 */
d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
				this.parentNode.appendChild(this);
				});
};

// set up the svg layout 
function setupLayout(){
	
	var data = d3.select("#data");
	
	data.attr("width", svgWidth)
		.attr("height", svgHeight);
	
	svg = data.append("svg:svg")
				.attr("width", svgWidth)
				.attr("height", svgHeight);
			

	lineSvg = svg.append("svg")
						.attr("id", "lineChart")
						.attr("x", "0")
						.attr("y", 0)
						.attr("width", chartWidth)
						.attr("height", chartHeight)
						.attr("overflow","visible");
						
	detailsSvg = svg.append("svg")
						.attr("id", "details")
						.attr("x", "0")
						.attr("y", chartHeight)
						.attr("width", detailsWidth)
						.attr("height", detailsHeight)

	bubbleSvg = svg.append("svg")
						.attr("id", "bubbleChart")
						.attr("x", "0")
						.attr("y", (chartHeight + detailsHeight))
						.attr("width", chartWidth)
						.attr("height", chartHeight)
						.attr("overflow","visible");
	
	
}

loadData(files[0]);
loadData(files[1]);
loadData(files[2]);
loadData(files[3]);

/*
 * Prepares the data so it can be manipulated in
 * d3.js.
 */ 
function loadData(filename){
    d3.csv(filename, function(error, data) {
        if (error) {
            console.log(error);
        }
        else{
            console.log(data);  //DEBUG: delete this later...     
            if (filename == files[0]) {
            	setupLayout();
            	moviesDataset = data;
            	generateBubbleGraph();
            	generateDetails();
            	
            }  
            else if (filename == files[1]) {
            	totalIncomeDataset = data;
            }
            else if (filename == files[2]) {
            	genreGroupsIncomeDataset = data;
            	
            	// adapted example from http://bl.ocks.org/mbostock/3884955
	            // d3.keys(data[0]).filter(function(key) { return key !== "year"; })
	            
	            genreGroupsIncome = d3.keys(data[0]).filter(function(key) { return key !== "year"; })
	            			.map(function(name) {
							    return {
							      name: name,
							      values: data.map(function(d) {
							        return { year: d.year, income: +d[name]};
							      })
							    };
							  });
							  
            }
            
            else {
            	
            	genreGroupsIncomeInflationDataset = data;
            	            	
            	genreGroupsIncomeInflation = d3.keys(data[0]).filter(function(key) { return key !== "year"; })
	            			.map(function(name) {
							    return {
							      name: name,
							      values: data.map(function(d) {
							        return { year: d.year, income: +d[name]};
							      })
							    };
							  });
											  
            	generateLineGraph();
            	generateSidePanel();
            }
     
    		
        }
    });	
}

/*
 * Creates the side panel.
 */
function generateSidePanel() {

}

/*
 * Creates the details-on-demand space.
 */
function generateDetails() {
	
	detailsSvg.append("rect")
					.attr("x", "0")
					.attr("y", "0")
					.attr("width", detailsWidth)
					.attr("height", detailsHeight)
					.attr("fill", "rgb(240,240,240)");
	
	displayLegend();
}

/*
 * Displays the key for both the bubble and line charts.
 * @author ajam 
 */
function displayLegend() {
	
	displayBubbleChartKey();
	displayLineChartKey();
}

/*
 * Creates the color swatches and corresponding text for 
 * the bubble chart key.
 * @author ajam
 */
function displayBubbleChartKey(){
	
	var xOffset = 20;
	var yOffset = 20;
	var xSpacing = 125;//150;
	var ySpacing = 28;
	
	var vertBubbleOffset = 2;
	
	var rows = 4;
	var cols = 4;
	
	detailsSvg.append("svg:g")
				.attr("class", "legend")
	    		.selectAll("circle")
				.data(genreNames)
				.enter()
				.append("circle")
				.attr("id", function(d, i) {
					return "colorSwatch" + String(i);
				});

	var count = 0;
	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			displayColorSwatch(count, i * xSpacing + xOffset, j * ySpacing + yOffset * 2 - radius + vertBubbleOffset, 
							   radius, genreColors[count]);
			addText("legend", i * xSpacing + xOffset * 2, j * ySpacing + yOffset * 2, "start", genreNames[count]);
			count++;
		}
	}	
}

/*
 * Creates a color swatch for the bubble chart key.
 */
function displayColorSwatch(index, cx, cy, radius, fill) {
	
	detailsSvg.select("#colorSwatch" + String(index))
	    		.attr("cx", cx)
	    		.attr("cy", cy)
	    		.attr("r", radius + 2)
	    		.attr("fill", fill);
	
}

/*
 * Creates the color swatches and corresponding text for 
 * the line chart key.
 * @author ajam
 */
function displayLineChartKey() {
	
	detailsSvg.append("svg:g")
				.attr("class", "legend")
	    		.selectAll("line")
				.data(genreGroupNames)
				.enter()
				.append("line")
				.attr("id", function(d, i) {
					return "lineSwatch" + String(i);
				});
				
	var xOffset = 545;
	var yOffset = 20;
	var horizTextOffset = 5;
	var vertOffset = 3;
	var xSpacing = 285;
	var ySpacing = 28;
	
	var rows = 4;
	var cols = 2;
	
	var lineLength = 30;
	
	var count = 0;
	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			var x = i * xSpacing + xOffset;
			var y = j * ySpacing + yOffset * 2 - radius + vertOffset;
			displayLineSwatch(count, x, y, x + lineLength, y, genreGroupColors[count]);
			addText("legend", i * xSpacing + xOffset + lineLength + horizTextOffset, j * ySpacing + yOffset * 2, "start", genreGroupNames[count]);
			count++;
		}
	}
}


/*
 * Creates a line swatch for the line graph key.
 * @author ajam
 */
function displayLineSwatch(index, x1, y1, x2, y2, stroke) {
	
	detailsSvg.select("#lineSwatch" + String(index))
				.attr("x1", x1)
				.attr("y1", y1)
				.attr("x2", x2)
				.attr("y2", y2)
				.attr("stroke", stroke)
				.attr("stroke-width", 5);
}

/*
 * Displays the data pertaining to a movie when a user
 * hovers over a bubble.
 * @author ajam 
 */
function displayDetails() {
	
	var xOffset = 20;
	
	// Represents the left, middle, and rightmost columns in the DOD space
	var xPos = [xOffset, detailsWidth / 2, detailsWidth - xOffset];
	
	// Represent the top, middle, and bottom y-coordinates for the rows of the DOD space
	var yPos = [40, 80, 120]; 
	
	var xAlign = ["start", "middle", "end"];
	
	var leftColText = [currDistributor, currRating, currGenre];
	var rightColText = [currBudget, currIncome, currAdjustedIncome];
	
	for (var i = 0; i < yPos.length; i++) {
		addText("leftColumn details", xPos[0], yPos[i], xAlign[0], leftColText[i]);	
	}
        		
	addText("middleColumn details title", xPos[1], yPos[1], xAlign[1], currTitle);
     
   	for (var i = 0; i < yPos.length; i++) {
		addText("rightColumn details", xPos[2], yPos[i], xAlign[2], rightColText[i]);	
	}   	   	    	   		      	   	       	        	   	       	
}

/*
 * Displays the data pertaining to a genre group when a user
 * hovers over a point on a line.
 */
function displayPointDetails() {
	
	var xOffset = 20;
	
	// Represents the left, middle, and rightmost columns in the DOD space
	var xPos = [xOffset, detailsWidth / 2, detailsWidth - xOffset];
	
	// Represent the top, middle, and bottom y-coordinates for the rows of the DOD space
	var yPos = [40, 80, 120];
	
	var xAlign = ["start", "middle", "end"];
	
	var middleColText = [year, currGenre, currIncome];
	
   	for (var i = 0; i < yPos.length; i++) {
		addText("middleColumn details", xPos[1], yPos[i], xAlign[1], middleColText[i]);	
	}	
}


/*
 * Function used to add the text for the DoD.
 * @author ajam 
 */
function addText(classAttr, x, y, textAnchor, text) {
    detailsSvg.append("svg:text")
    			.attr("class", classAttr)
        	   	.attr("x", x)
        	   	.attr("y", y)
        	   	.attr("text-anchor", textAnchor)
        	   	.text(text);  	
}

/*
 * Removes the data displayed in the DoD area.
 * @author ajam
 */
function removeDetails(className) {
	detailsSvg.selectAll(className).remove();
}


/*
 * Generates the bubble chart. 
 */
function generateBubbleGraph(){

	// Setup the scales
	var bubbleXScale = d3.time.scale()
							.domain([new Date(currYear - 1, startMonth, startDay), new Date(currYear, endMonth, endDay)])
        					.range([scaleOffset, chartWidth - scaleOffset]);
        			
    var bubbleYScale = d3.scale.linear()
    						.domain([d3.min(moviesDataset, function(d) { return d[yValues[indexCurrYValue]] / factor;}),
    								d3.max(moviesDataset, function(d) { return d[yValues[indexCurrYValue]] / factor;})])
    						.range([chartHeight - scaleOffset, scaleOffset]);
    						
	var bubbleXAxis = d3.svg.axis()
						.scale(bubbleXScale)
						.orient("bottom")
						.tickFormat(d3.time.format("%b"))
						.tickSize(0);
				
	var bubbleYAxis = d3.svg.axis()
						.scale(bubbleYScale)
						.orient("left")
						.ticks(6);
					
	bubbleSvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (chartHeight - scaleOffset) + ")")
		.call(bubbleXAxis)
		.append("text")
		.attr("text-anchor","middle")
		.attr("x", (chartWidth - scaleOffset) / 2)
		.attr("y", axisLabelMargin - 12)
		.text("Movie Release Date");
	
	bubbleSvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + scaleOffset + ", 0)")
		.call(bubbleYAxis)
		.append("text")
		.attr("text-anchor","middle")
		.attr("transform","rotate(-90)")
		.attr("x", -(chartHeight) / 2)
        .attr("y", -axisLabelMargin)
        .text(determineCurrentLabel());	     					 
			
	var bubbles = bubbleSvg.append("g")
						.attr("class", "bubbles")
						.selectAll("circle")
						.data(moviesDataset)
						.enter()
						.append("circle");

			
	bubbles.attr("cx", function(d) {
				if (d.production_year == currYear) {
					return bubbleXScale(new Date(currYear, d.month - 1, d.day)); 
				}
				return hiddenCoordinate; 
			})
			.attr("cy", function (d) {
				if (d.production_year == currYear) {
					return bubbleYScale(d[yValues[indexCurrYValue]] / factor); 
				}
				return hiddenCoordinate;
			})
			.attr("r", radius)
			.attr("fill", function (d) {
				return genreColors[parseInt(d.genre1_index)];
			})
			.attr("stroke", function (d) {
				if (d.genre2_index != "") {
					return genreColors[parseInt(d.genre2_index)];
				}
				return genreColors[parseInt(d.genre1_index)];
			})
			.on("mouseover", function(d) { 
				removeDetails("g.legend");
				removeDetails("text.legend");
            	d3.select(this.parentNode)
                	.selectAll("circle")
                    .attr("opacity", 0.5);
                d3.select(this).moveToFront()
                	.attr("opacity", 1.0);
               	currDistributor = "Distributor: " + d.distributor;
               	currRating = "Rating: " + d.rating;
               	currGenre = "Genre: " + d.genre;
               	currTitle = d.title;
               	currBudget = "Production Budget: " + d.formatted_production_budget;
               	currIncome = "Domestic Income: " + incomeFormat(d.domestic_income);
               	currAdjustedIncome = "Adjusted Income: " + incomeFormat(d.inflation_domestic_income);
               	displayDetails();
            })
            .on("mouseout", function(d) { 
            	displayLegend();
                d3.select(this.parentNode)
                	.selectAll("circle")
                    .attr("opacity", 1.0);
               	currDistributor = "";
               	currRating = "";
               	currGenre = "";
               	currTitle = "";
               	currBudget = "";
               	currIncome = "";
               	currAdjustedIncome = "";
               	removeDetails("text.details");
            })
			.attr("stroke-width", stroke)
			.attr("opacity", function (d) {
				if (d.production_year != currYear){
					return 0.0;
				}
				return 1.0;
			});
			
	// draw graph title
	bubbleSvg.selectAll(".graphTitle").remove();
	bubbleSvg.append("text")
			.attr("class", "graphTitle")
			.attr("x", chartWidth / 2)
			.attr("y", 25)
			.attr("text-anchor", "middle")
			.text("Top 25 Movies | " + currYear.toString());
}

/*
 * Determines the label for the y-axes based on what mode (adjusted income or
 * actual domestic income) the user is in.
 * 
 * @author ajam
 */      
function determineCurrentLabel() {
	if (indexCurrYValue == 0) {
		return " Adjusted Domestic Income (in millions USD)";
	}
	return "Domestic Income (in USD millions)";
}

/*
 * Updates bubble graph to display current selected year
 */
function updateBubbleGraph() {
	bubbleSvg.selectAll("g").remove();
	generateBubbleGraph();
}


  
  /*
* generates the bar graph to display the total income of the particular year.
*@author Bharadwaj Tanikella
*/
function barGraph(){
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, chartWidth-margin.left-margin.right], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(8);

var svg = d3.select("body").append("svg")
    .attr("width", chartWidth)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("1983-2012_movies_totalincomes.csv", function(error, data) {
  x.domain(data.map(function(d) { return d.year; }));
  y.domain([0, d3.max(data, function(d) { return d.inflation_domestic_income/factor;  })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Income per year(in Millions USD)");

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.year); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.inflation_domestic_income/factor); })
      .attr("height", function(d) { return height - y(d.inflation_domestic_income/factor); })
	  .attr('fill', 'lightgrey');

});
}
  

/*
 * generates the line graph to display genre data
 * @author Allison Chislett
 */
function generateLineGraph(){
	
	// setup axis scales
	var maxIncome = 6500000000;
	//var maxIncomeInflation = d3.max(genreGroupsIncomeInflationDataset);
	
	var lineXScale = d3.scale.linear()
        					.domain([years[0] - 0.5, years[years.length-1] + 1])
        					.range([scaleOffset, chartWidth - scaleOffset]);

    var lineYScale = d3.scale.linear()
    						.domain([maxIncome,0])
    						.range([scaleOffset, chartHeight - scaleOffset]);
    						
	var line = d3.svg.line()
				    .x(function(d) { return lineXScale(d.year); })
				    .y(function(d) { return lineYScale(d.income); });
    
    
	// draw axes
	var lineXAxis = d3.svg.axis()
						.scale(lineXScale)
						.orient("bottom")
						.ticks(15)
						.tickFormat(d3.format("f"));
				
	var lineYAxis = d3.svg.axis()
						.scale(lineYScale)
						.orient("left")
						.ticks(8)
						.tickFormat(d3.format(",.2s"));
				
	lineSvg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + (chartHeight-scaleOffset) + ")")
				.call(lineXAxis)
				.append("text")
					.attr("text-anchor","middle")
					.attr("x", (chartWidth - scaleOffset) / 2)
					.attr("y", axisLabelMargin)
					.text("Year");
				
	lineSvg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(" + scaleOffset + ",0)")
				.call(lineYAxis)
				.append("text")
					.attr("transform","rotate(-90)")
					.attr("text-anchor","middle")
					.attr("x", -(chartHeight) / 2)
			        .attr("y", -axisLabelMargin)
			        .text(determineCurrentLabel());
			        
	// draw bars representing total income for top 25 movies each year
	var barColor = "#d3d3d3";
	var barHighlightColor = "#b0b0b0";	        
	var bars = lineSvg.append("g")
						.attr("class", "bars")
						.selectAll("rect")
						.data(totalIncomeDataset)
						.enter()
						.append("rect")
						.attr("id", function(d) { return d.year.toString() + "bar"; })
						.attr("class", "bar")
						.attr("x", function(d) {
							return lineXScale(d.year) - barWidth / 2;
						})
						.attr("y", function(d) {
							return lineYScale(d.inflation_domestic_income);
						})
						.attr("width", barWidth)
						.attr("height", function(d) {
							return chartHeight - scaleOffset - lineYScale(d.inflation_domestic_income);
						})
						.attr("fill", function(d) {
							if(d.year == currYear) return barHighlightColor;
							else return barColor;
						})
						.on("click", function(d) {
							d3.selectAll(".bar")
								.attr("fill", barColor);
							d3.select(this)
								.attr("fill", barHighlightColor);
							currYear = d.year;
							updateBubbleGraph();
						})
						.on("mouseover", function(d) {
							d3.select(this)
								.attr("fill", barHighlightColor);
							lineSvg.append("text")
									.attr("class", "barDetails")
									.attr("x", chartWidth / 2)
									.attr("y", 45)
									.attr("text-anchor", "middle")
									.text(function() { 
										return d.year + " | " + incomeFormat(d.inflation_domestic_income); })
									.style("font-size", "12px");
						})
						.on("mouseout", function(d) {
							lineSvg.selectAll(".barDetails").remove();
							if(d.year != currYear) {
								d3.select(this)
									.attr("fill", barColor);
							}
						});
						
	// draw lines representing total incomes for each genre group
	var genreLines = lineSvg.selectAll(".genreLine")
						      	.data(function() { 
						      			if(indexCurrYValue == 0) 
						      				return genreGroupsIncomeInflation;
			      						else 
			      							return genreGroupsIncome; })
						    	.enter()
						    	.append("g")
						      	.attr("class", "genreLine");
	
						      	
	genreLines.append("path")
		  .attr("id", function(d) { return d.name + " Line"; })
	      .attr("class", "line")
	      .attr("d", function(d) { return line(d.values); })
	      .on("mouseover", function(d) { 
	      	highlightLine(d3.select(this));
	      })
	      .on("mouseout", function(d) { 
	      	unhighlightLine(d3.select(this)); 
	      })
	      .style("stroke", function(d) { 
	      	return genreColorKeyValue[d.name]; 
	      })
	      .style("stroke-width", 2)
	      .style("fill","none")
	      .append("title")
          .text(function(d) { return d.name;});
    
    // add circles to data points on each line
    // these will appear when the data point on the line is hovered over      
    genreLines.each(
    	function (d) { 
    		var genreName = d.name;
    		var thisLine = d3.select(this).select("path");
			d3.select(this)
				.append("g")
				.attr("class", "genrePoints")
				.selectAll("circle")
				.data(function() { 
						if(indexCurrYValue == 0) 
	      					return genreGroupsIncomeInflationDataset;
						else 
							return genreGroupsIncomeDataset; 
				})
				.enter()
				.append("circle")
				.attr("id", function(d) { return d.year.toString() + " " + genreName + " Point"; })
		      	.attr("class", "point")
		      	.attr("cx", function(d) { return lineXScale(d.year); })
				.attr("cy", function(d) { return lineYScale(d[genreName]); })
				.attr("r", 5)
				.on("mouseover", function(d) {
					removeDetails("g.legend");
					removeDetails("text.legend");
					year = d.year;
					currGenre = "Genres: " + genreName;
					currIncome = "Income: " + incomeFormat(d[genreName]);
					highlightPoint(this);
					highlightLine(thisLine);
					displayPointDetails();
				})
				.on("mouseout", function(d) {
					displayLegend(); 
					unhighlightPoint(this);
					unhighlightLine(thisLine);
					removeDetails("text.details");
				})
				.on("click", function(d) { 
					currYear = d.year; 
					updateBubbleGraph(); 
				})
 				.attr("opacity", 0.0)
 				.style("stroke", function(d, i) { 
 					console.log(genreName);
 					return genreColorKeyValue[genreName];
 				})
 				.style("stroke-width", 2)
				.style("fill", "white");
		}
	);
	

	d3.selectAll(".point").moveToFront();

	// draw graph title
	lineSvg.append("text")
			.attr("class", "graphTitle")
			.attr("x", chartWidth / 2)
			.attr("y", 25)
			.attr("text-anchor", "middle")
			.text("Total Income for Top 25 Movies per Year");
}


/*
 * Highlights the line that's being hovered over.
 */
function highlightLine(o) {
	d3.selectAll(".line")
	      		.attr("opacity", 0.2);
	      		
	d3.select(this.parentNode).moveToFront();
	
	o.attr("opacity", 1.0)
		.style("stroke-width",4);
			
	d3.selectAll(".point").moveToFront();
}

/*
 * Returns all of the lines to their normal state when
 * the user is not hovering over any of them.
 */
function unhighlightLine(o) {
	d3.selectAll(".line")
	    .attr("opacity", 1.0);
	    
	o.style("stroke-width",2);
		
	d3.selectAll(".point").moveToFront();
}

/*
 * Highlights the point that's being hovered over.
 */
function highlightPoint(o) {
	d3.select(o)
		.attr("opacity", 1.0);

	d3.selectAll(".point").moveToFront();
}

/*
 * Returns the point to its normal state when
 * the user is not hovering over it.
 */
function unhighlightPoint(o) {
	d3.select(o)
		.attr("opacity", 0.0);

	d3.selectAll(".point").moveToFront();
}



