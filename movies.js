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
var svg, bubbleSvg, detailsSvg, lineSvg, barSvg, tooltipSvg;

// tooltip div (location set based on mouse location when hovering over an element)
var tooltipDiv;
// tooltip dimensions
var tooltipHeight = 40;
var tooltipWidth = 100;
var tooltipTextMargin = {side: 10, top: 17};

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

var axisOffset = 65;
var axisLabelMargin = 55;
var axisLabelWidth = 50;

// Radius of a bubble
var radius = 7;
var stroke = 4;

var bubbleXScale;
var bubbleYScale;

// Width of a bar 
var barWidth = 25;

// Sizes of the text
var regTextSize = 11;
var smallText = 5;

var regTitleSize = 24;
var smallTitleSize = 18;


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
					  
var distributor = ["Buena Vista", "DreamWorks", "Fox", "Paramount Pictures", "Sony Pictures",
					"Universal", "Warner Bros.", "Other"];					 

// Instead of having incomes display as millions (1,000,000), have them display as 100
var factor = 1000000.0;

// Variables used for details on demand 
// These are set when hovering over a point on the line graph or a movie in the bubble graph
var year, currDistributor, currRating, currGenre, currTitle, currBudget, currIncome, currAdjustedIncome;

// boolean to let us know if movie details are currently being displayed
var movieDetailsOn = false;

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
function setupLayout() {
	
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
	
	// create "tooltip" div and svg that will pop up next to mouse to display details-on-demand
	tooltipDiv = d3.select("body")
		.append("div")
		.attr("id", "tooltipDiv")
		.style("position","absolute")
		.style("visibility","collapse");
	
	tooltipSvg = tooltipDiv.append("svg")
			.attr("id", "tooltipSvg")
			.attr("height", tooltipHeight)
			.attr("width", tooltipWidth)
			.attr("overflow","visible")
			.style("opacity",0);
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
					.attr("fill", "rgb(248,248,248)");
	
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
function displayBubbleChartKey() {
	
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
 * display pop-up details next to mouse
 * @author allichis
 */
function displayBubbleTooltipDetails(d) {
	
	tooltipDiv.style("visibility","visible");	
	tooltipDiv.style("left", (d3.event.pageX + 10) + "px");     
    tooltipDiv.style("top", (d3.event.pageY - 55) + "px");
    
    var tooltipTitle = tooltipSvg.append("svg:text")
    	.attr("class", "tooltipTitle")
		.attr("x",tooltipTextMargin.side)
		.attr("y",tooltipTextMargin.top)
		.text(d.title);
	var tooltipGenre = tooltipSvg.append("svg:text")
		.attr("class", "tooltipText")
		.attr("x",tooltipTextMargin.side)
		.attr("y",tooltipTextMargin.top + 15)
		.text(d.genre);
	
	/*
	tooltipSvg.attr("width", function() {
    				return d3.max(tooltipTitle.textLength, tooltipGenre.textLength) 
    						+ 2 * tooltipTextMargin.side;
    			});
    */
   	tooltipSvg.attr("width",tooltipWidth * 2);
   				
	tooltipSvg.transition()        
        .duration(200)      
        .style("opacity", .7);
        	
}



function displayBarTooltipDetails(d) {
	
	tooltipDiv.style("visibility","visible");
	tooltipDiv.style("left", (d3.event.pageX + 10) + "px");     
    tooltipDiv.style("top", (d3.event.pageY - 55) + "px");
    			     
	var tooltipYear = tooltipSvg.append("text")
		.attr("class", "tooltipText")
		.attr("x",tooltipTextMargin.side)
		.attr("y",tooltipTextMargin.top)
		.text(d.year);
	var tooltipIncome = tooltipSvg.append("text")
		.attr("class", "tooltipText")
		.attr("x",tooltipTextMargin.side)
		.attr("y",tooltipTextMargin.top + 15)
		.text(function() {
			if(indexCurrYValue == 0) {
				return incomeFormat(d.inflation_domestic_income)
			}
			else {
				return incomeFormat(d.domestic_income)
			}
		});
	
	tooltipSvg.attr("width",100);
		
	tooltipSvg.transition()        
        .duration(200)      
        .style("opacity", .7);      
	
}


function displayLineTooltipDetails(d, genreName) {
	
	tooltipDiv.style("visibility","visible");
	tooltipDiv.style("left", (d3.event.pageX + 10) + "px");     
    tooltipDiv.style("top", (d3.event.pageY - 55) + "px");
                 
	var tooltipGenre = tooltipSvg.append("text")
		.attr("class", "tooltipText")
		.attr("x",tooltipTextMargin.side)
		.attr("y",tooltipTextMargin.top)
		.text(genreName);
	var tooltipYearIncome = tooltipSvg.append("text")
		.attr("class", "tooltipText")
		.attr("x",tooltipTextMargin.side)
		.attr("y",tooltipTextMargin.top + 15)
		.text(d.year + " | " + incomeFormat(d[genreName]));
	
	/*
	tooltipSvg.attr("width", function() {
    				return d3.max(tooltipTitle.textLength, tooltipGenre.textLength) 
    						+ 2 * tooltipTextMargin.side;
    			});	
	*/
	tooltipSvg.attr("width",tooltipWidth * 2)
	
	tooltipSvg.transition()        
        .duration(200)      
        .style("opacity", .7);      

}


/*
 * remove pop-up details
 * @author allichis
 */
function removeTooltipDetails() {
	
	tooltipSvg.transition()        
        .duration(200)      
        .style("opacity", 0);
        
    tooltipSvg.selectAll("text").remove();
    
    tooltipDiv.style("visibility","collapse");
}



/*
 * Generates the bubble chart. 
 */
function generateBubbleGraph(){

	// Setup the scales
	bubbleXScale = d3.time.scale()
							.domain([new Date(currYear - 1, startMonth, startDay), new Date(currYear, endMonth, endDay)])
        					.range([axisOffset, chartWidth - axisOffset]);
        			
    bubbleYScale = d3.scale.linear()
    						.domain([d3.min(moviesDataset, function(d) { return d[yValues[indexCurrYValue]] / factor;}),
    								d3.max(moviesDataset, function(d) { return d[yValues[indexCurrYValue]] / factor;})])
    						.range([chartHeight - axisOffset, axisOffset]);
    						
	var bubbleXAxis = d3.svg.axis()
						.scale(bubbleXScale)
						.orient("bottom")
						.tickFormat(d3.time.format("%b"))
						.tickSize(0);
				
	var bubbleYAxis = d3.svg.axis()
						.scale(bubbleYScale)
						.orient("left")
						.ticks(6)
						.tickFormat(function(d) { return incomeFormat(d); });
					
	bubbleSvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (chartHeight - axisOffset) + ")")
		.call(bubbleXAxis)
		.append("text")
		.attr("text-anchor","middle")
		.attr("x", chartWidth / 2)
		.attr("y", axisLabelMargin - 12)
		.text("Movie Release Date");
	
	bubbleSvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + axisOffset + ", 0)")
		.call(bubbleYAxis)
		.append("text")
		.attr("text-anchor","middle")
		.attr("transform","rotate(-90)")
		.attr("x", -(chartHeight) / 2)
        .attr("y", -axisLabelMargin)
        .text(determineCurrentLabel());	 
    
    bubbleSvg.selectAll("text")
    			.attr("font-size", regTextSize);    					 
			
	var bubbles = bubbleSvg.append("g")
						.attr("class", "bubbleChartSvg")
						/*
						.on("click", function(d) {
							if(movieDetailsOn) {
								movieDetailsOn = false;
								console.log("g " + movieDetailsOn);
			            		// hide move details
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
				            }
						})
						*/
						.selectAll("circle")
						.data(moviesDataset)
						.enter()
						.append("circle");
						

			
	bubbles.attr("class", "bubble")
			.attr("cx", function(d) {
				return bubbleXScale(new Date(currYear, d.month - 1, d.day));  
			})
			.attr("cy", function(d) {
				return bubbleYScale(d[yValues[indexCurrYValue]] / factor); 
			})
			.attr("r", radius)
			.attr("fill", function(d) {
				return genreColors[parseInt(d.genre1_index)];
			})
			.attr("stroke", function(d) {
				if (d.genre2_index != "") {
					return genreColors[parseInt(d.genre2_index)];
				}
				return genreColors[parseInt(d.genre1_index)];
			})
			.attr("visibility", function(d) {
				if (d.production_year == currYear) {
					return "visible"
				}
				return "hidden";				
			})
			.on("mouseover", function(d) { 
				d3.select(this.parentNode)
	                	.selectAll("circle")
	                    .attr("opacity", 0.5);
	            d3.select(this).moveToFront()
	                	.attr("opacity", 1.0);
	            displayBubbleTooltipDetails(d);
            })
            .on("mouseout", function(d) { 
            	d3.select(this.parentNode)
	                	.selectAll("circle")
	                    .attr("opacity", 1.0);
	            removeTooltipDetails();
            })
            .on("click", function(d) {
            	if(movieDetailsOn){
            		movieDetailsOn = false;
            		//console.log("c " + movieDetailsOn);
            		// hide move details
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
            	}
            	else {
            		movieDetailsOn = true;
            		//console.log("c " + movieDetailsOn);
            		// show movie details
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
            	}
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
			.attr("y", 35)
			.attr("text-anchor", "middle")
			.text("U.S. Domestic Income for Top 25 Movies | " + currYear.toString());
}

/*
 * Determines the label for the y-axes based on what mode (adjusted income or
 * actual domestic income) the user is in.
 * 
 * @author ajam
 */      
function determineCurrentLabel() {
	if (indexCurrYValue == 0) {
		return " Adjusted Income (millions USD)";
	}
	return "Income (millions USD)";
}

/*
 * Determines the label for the y-axes based on what mode (adjusted income or
 * actual domestic income) the user is in.
 */
function determineCurrentBarYLabel() {
	if (indexCurrYValue == 0) {
		return " Adjusted Income (billions USD)";
	}
	return "Income (billions USD)";
}

/*
 * Updates bubble graph to display current selected year
 */
function updateBubbleGraph() {
	bubbleSvg.selectAll("g").remove();
	generateBubbleGraph();
		
	var distributors = document.getElementsByName("distributorFilter");
	for (var i = 0; i < distributors.length; i++) {
		selectDistributor(distributors[i].value);
	}
}
 

/*
 * generates the line graph to display genre data
 * @author Allison Chislett
 */
function generateLineGraph(){
	
	// setup axis scales
	var maxIncome = 6500000000;
	//var maxIncomeInflation = d3.max(genreGroupsIncomeInflationDataset);
	
	// set up axis scales
	var lineXScale = d3.scale.linear()
        					.domain([years[0] - 0.5, years[years.length-1] + 1])
        					.range([axisOffset, chartWidth - axisOffset]);

    var lineYScale = d3.scale.linear()
    						.domain([maxIncome,0])
    						.range([axisOffset, chartHeight - axisOffset]);
    						
    var lineYValueScale = d3.scale.linear()
    						.domain([maxIncome,0])
    						.range([axisOffset, chartHeight - axisOffset - 2]);
    
    						
	var line = d3.svg.line()
				    .x(function(d) { return lineXScale(d.year); })
				    .y(function(d) { return lineYValueScale(d.income); });
    
    
	// draw bars representing total income for top 25 movies each year
	var barColor = "rgb(230,230,230)";
	var barHighlightColor = "#f0f0f0";	
	var barSelectedColor = "#b0b0b0"        
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
							return lineYScale(d[yValues[indexCurrYValue]]);
						})
						.attr("width", barWidth)
						.attr("height", function(d) {
							return chartHeight - axisOffset - lineYValueScale(d[yValues[indexCurrYValue]]);
						})
						.attr("fill", function(d) {
							if(d.year == currYear) return barSelectedColor;
							else return barColor;
						})
						.on("click", function(d) {
							d3.selectAll(".bar")
								.attr("fill", barColor);
							d3.select(this)
								.attr("fill", barSelectedColor);
							currYear = d.year;
							updateBubbleGraph();
						})
						.on("mouseover", function(d) {
							d3.select(this)
								.attr("fill", barHighlightColor);
							/*lineSvg.append("text")
									.attr("class", "barDetails")
									.attr("x", chartWidth / 2)
									.attr("y", 45)
									.attr("text-anchor", "middle")
									.text(function() { 
										return d.year + " | " + incomeFormat(d.inflation_domestic_income); })
									.style("font-size", "12px");
							*/
							displayBarTooltipDetails(d);
						})
						.on("mouseout", function(d) {
							//lineSvg.selectAll(".barDetails").remove();
							if(d.year != currYear) {
								d3.select(this)
									.attr("fill", barColor);
							}
							else {
								d3.select(this)
									.attr("fill", barSelectedColor);
							}
							
							removeTooltipDetails(d);
						});
	
	// set up axes
	var lineXAxis = d3.svg.axis()
						.scale(lineXScale)
						.orient("bottom")
						.ticks(15)
						.tickSize(0)
						.tickFormat(d3.format("f"));
				
	var lineYAxis = d3.svg.axis()
						.scale(lineYScale)
						.orient("left")
						.ticks(8)
						.tickFormat(function(d) { return incomeFormat(d / (factor*1000)); });
			        
	// draw axes
	lineSvg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + (chartHeight-axisOffset) + ")")
				.call(lineXAxis)
				.selectAll("text")
			    .attr("x", 0)
			    .attr("y", 5)
			    .style("text-anchor", "middle");
			    
	lineSvg.select(".axis").append("text")
					.attr("text-anchor","middle")
					.attr("x", chartWidth / 2)
					.attr("y", axisLabelMargin - 12)
					.text("Year");
				
	lineSvg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(" + axisOffset + ",0)")
				.call(lineYAxis)
				.append("text")
					.attr("transform","rotate(-90)")
					.attr("text-anchor","middle")
					.attr("x", -(chartHeight) / 2)
			        .attr("y", -axisLabelMargin)
			        .text(determineCurrentBarYLabel());
			        
			        
	lineSvg.selectAll("text")
			.attr("font-size", regTextSize);
						
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
				.attr("cy", function(d) { return lineYValueScale(d[genreName]); })
				.attr("r", 5)
				.on("mouseover", function(d) {
					//removeDetails("g.legend");
					//removeDetails("text.legend");
					//year = d.year;
					//currGenre = genreName;
					//currIncome = incomeFormat(d[genreName]);
					highlightPoint(this);
					highlightLine(thisLine);
					//displayPointDetails();
					displayLineTooltipDetails(d,genreName);
				})
				.on("mouseout", function(d) {
					//displayLegend(); 
					unhighlightPoint(this);
					unhighlightLine(thisLine);
					//removeDetails("text.details");
					removeTooltipDetails();
				})
				.on("click", function(d) { 
					currYear = d.year; 
					updateBubbleGraph(); 
				})
 				.attr("opacity", 0.0)
 				.style("stroke", function(d, i) { 
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
			.attr("y", 35)
			.attr("text-anchor", "middle")
			.text("U.S. Total Domestic Income for Top 25 Movies per Year");
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
 * 
 */
function unhighlightPoint(o) {
	d3.select(o)
		.attr("opacity", 0.0);

	d3.selectAll(".point").moveToFront();
}


/**
 * Filter for genres. This is the function that gets called when a 
 * checkbox under the Genre category gets checked/unchecked. This 
 * function is hooked to the HTML.
 * 
 * @param {Object} value the input obtained from the checkbox when it's clicked
 */
function selectGenre(value) {
	filter(value, "genre1");
	filter(value, "genre2");
}

/**
 * Filter for ratings. This is the function that gets called when a 
 * checkbox under the Rating category gets checked/unchecked. This 
 * function is hooked to the HTML.
 * 
 * @param {Object} value the input obtained from the checkbox when it's clicked
 */
function selectRating(value) {
	filter(value, "rating");
}

/**
 * Filter for distributors. This is the function that gets called when a 
 * checkbox under the Distributor category gets checked/unchecked. This 
 * function is hooked to the HTML.
 * 
 * @param {Object} value the input obtained from the checkbox when it's clicked
 */
function selectDistributor(value) {
	filter(value, "distributor_filter");
}


/**
 * Filter for the elements that get checked/uncked in the checkboxes.
 * 
 * @param {Object} value the input obtained from the checkbox when it's clicked
 * @param {Object} filterName the name of the column in the dataset D3 will 
 *                 use to see whether a bubble has the same category that is
 *                 being filtered 
 */
function filter(value, filterName) {
	var isChecked = document.getElementById(value).checked;
	
	if (isChecked == false) {
		updateBubbleVisibility("visible", isChecked, filterName, value);
	}
	else {
		updateBubbleVisibility("hidden", isChecked, filterName, value);
	}	
}

/**
 * Based on the input from the checkboxes, this function updates the
 * visibility of the bubbles and either hides them or makes them visible.
 * 
 * @param {Object} classAttr check for element that has a class of "visible" or "hidden"
 * @param {Object} checkboxInput the inputted value of the checkbox (true or false)
 * @param {Object} filterType can be genre_filter, rating_filter, or distributor_filter
 * @param {Object} category the actual category for which the checkbox corresponds
 */
function updateBubbleVisibility(visibilityAttribute, checkboxInput, filterType, category) {
	
	var visibilityStatus;
	
	d3.selectAll(".bubble").each(function(d) {
		visibilityStatus = d3.select(this).attr("visibility");
		
		if (visibilityStatus == visibilityAttribute) {
			d3.select(this)
		    	.attr("visibility", function(d) {
						if (checkboxInput == false) {
					    	if (d[filterType] == category || d.production_year != currYear) {
							    return "hidden";
							}
							else {
								return "visible";
							}
						}
						else if (checkboxInput == true && d[filterType] == category && d.production_year == currYear) {
							return "visible";
						}
						return "hidden";						    		
		    	});
		}
	});
}