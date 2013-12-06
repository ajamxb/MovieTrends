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
var svgHeight = 900;
var totalChartHeight = 300;
var chartWidth = 1000;
var dodChartHeight = 300;
var lineChartHeight = 250;
var bubbleChartHeight = 350;
var detailsWidth = 1000;
var detailsHeight = 150; //200;
var filtersWidth = 160;
var filtersHeight = 900;

var hiddenCoordinate = -100;

// svg variables
var svg, bubbleSvg, detailsSvg, lineSvg, barSvg, tooltipSvg;

// tooltip div (location set based on mouse location when hovering over an element)
var tooltipDiv;
// tooltip dimensions
var tooltipHeight = 40;
var tooltipWidth = 100;
var tooltipTextMargin = {side: 10, top: 17};
var tooltipXOffset = 10;
var tooltipYOffset = -50;

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
var axisLabelMargin = 50;
var axisLabelWidth = 50;

// Radius of a bubble
var radius = 9;

// Array containing the movies for the selected year
var prevYearMovies;
var currYearMovies;

var bubbleXScale;
var bubbleXAxis;
var bubbleYScale;
var bubbleYAxis;

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

// which genre line is currently selected
var lineSelected = null;

// formats dollar amount with dollar sign and commas							        
var incomeFormat = d3.format("$,f");

// Keeps track of whether the bubble chart has expanded in height
var isBubbleChartExpanded = true;
	
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
						.attr("height", lineChartHeight)
						.attr("overflow","visible");
						
	detailsSvg = svg.append("svg")
						.attr("id", "details")
						.attr("x", "0")
						.attr("y", dodChartHeight)
						.attr("width", detailsWidth)
						.attr("height", detailsHeight)

	bubbleSvg = svg.append("svg")
						.attr("id", "bubbleChart")
						.attr("x", "0")
						.attr("y", (bubbleChartHeight + detailsHeight -50))
						.attr("width", chartWidth)
						.attr("height", bubbleChartHeight - 50)
						.attr("overflow","visible");
	
	detailsSvg.attr("transform", "translate(0, -50)");
	bubbleSvg.attr("transform", "translate(0, -50)");
	
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
			
			
	// set height of filter div to match svg height
	d3.select("#filter")
		.attr("height",filtersHeight)
		.attr("width",filtersWidth);
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
            //console.log(data);  //DEBUG: delete this later...     
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

/**
 * Displays the key for both the bubble and line charts.
 * 
 * @author Annette Almonte 
 */
function displayLegend() {
	
	displayBubbleChartKey();
	displayLineChartKey();
}

/**
 * Creates the color swatches and corresponding text for 
 * the bubble chart key.
 * 
 * @author Annette Almonte
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

/**
 * Creates a color swatch for the bubble chart key.
 * 
 * @author Annette Almonte
 */
function displayColorSwatch(index, cx, cy, radius, fill) {
	
	detailsSvg.select("#colorSwatch" + String(index))
	    		.attr("cx", cx)
	    		.attr("cy", cy)
	    		.attr("r", radius)
	    		.attr("fill", fill);
	
}

/**
 * Creates the color swatches and corresponding text for 
 * the line chart key.
 * 
 * @author Annette Almonte
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


/**
 * Creates a line swatch for the line graph key.
 * 
 * @author Annette Almonte
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

/**
 * Displays the data pertaining to a movie when a user clicks on a 
 * bubble.
 * 
 * @author Annette Almonte and Bharadwaj Tanikella
 */
function displayDetails() {
        
        var xOffset = 20;
        
        // Represents the left, middle, and rightmost columns in the DOD space
        var xPos = [xOffset, 180, 410, 640,870];
		var tPos=[420,650,880];
		
        
        // Represent the top, middle, and bottom y-coordinates for the rows of the DOD space
        var yPos = [50, 80, 97];
        
        var xAlign = ["start", "middle", "end"];
        
        var leftColText = [currRating, currGenre, currBudget, currIncome, currAdjustedIncome];
        var rightColText = [budget,income,aincome];
        
        for (var i = 0; i < xPos.length; i++) {
                addText("leftColumn details", xPos[i], yPos[2], xAlign[0], leftColText[i]);        
        }
                        
        addText("middleColumn details title", detailsWidth/2, yPos[0], xAlign[1], currTitle);
		addText("middleColumn details distributor", detailsWidth/2, 65,xAlign[1],currDistributor+"|"+currYear);
     
          for (var i = 0; i < yPos.length; i++) {
               addText("rightColumn details", tPos[i], 115, xAlign[0], rightColText[i]);        
        }                                                                                                  
}


/**
 * Function used to add the text for the DoD space.
 * @author Annette Almonte 
 */
function addText(classAttr, x, y, textAnchor, text) {
    detailsSvg.append("svg:text")
    			.attr("class", classAttr)
        	   	.attr("x", x)
        	   	.attr("y", y)
        	   	.attr("text-anchor", textAnchor)
        	   	.text(text);  	
}

/**
 * Removes the data displayed in the DoD area.
 * @author Annette Almonte
 */
function removeDetails(className) {
	detailsSvg.selectAll(className).remove();
}

		
/**
 * display pop-up details next to mouse
 * when hovering over a bubble
 * 
 * @author Allison Chislett
 */
function displayBubbleTooltipDetails(d) {
	
	tooltipDiv.style("visibility","visible");	
	tooltipDiv.style("left", (d3.event.pageX + tooltipXOffset) + "px");     
    tooltipDiv.style("top", (d3.event.pageY + tooltipYOffset) + "px");
    
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
	
	
	tooltipSvg.attr("width", function() {
								var widths = [measureTextWidth(tooltipTitle.text()), measureTextWidth(tooltipGenre.text())];
			    				return d3.max(widths) + (2 * tooltipTextMargin.side) + 2;
			    			});
   				
	tooltipSvg.transition()        
        .duration(200)      
        .style("opacity", .8);
        	
}


/**
 * display pop-up details next to mouse
 * when hovering over a bar
 * 
 * @author Allison Chislett
 */
function displayBarTooltipDetails(d) {
	
	tooltipDiv.style("visibility","visible");
	tooltipDiv.style("left", (d3.event.pageX + tooltipXOffset) + "px");     
    tooltipDiv.style("top", (d3.event.pageY + tooltipYOffset) + "px");
    			     
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
	
	tooltipSvg.attr("width", function() {
								var widths = [measureTextWidth(tooltipYear.text()), measureTextWidth(tooltipIncome.text())];
			    				return d3.max(widths) + (2 * tooltipTextMargin.side);
			    			});
		
	tooltipSvg.transition()        
        .duration(200)      
        .style("opacity", .8);      
	
}

/**
 * display pop-up details next to mouse
 * when hovering over a data point on a genre line
 * 
 * @author Allison Chislett
 */
function displayLineTooltipDetails(d, genreName) {
	
	tooltipDiv.style("visibility","visible");
	tooltipDiv.style("left", (d3.event.pageX + tooltipXOffset) + "px");     
    tooltipDiv.style("top", (d3.event.pageY + tooltipYOffset) + "px");
                 
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
	
	
	tooltipSvg.attr("width", function() {
								var widths = [measureTextWidth(tooltipGenre.text()), measureTextWidth(tooltipYearIncome.text())];
			    				return d3.max(widths) + (2 * tooltipTextMargin.side);
			    			});	

	tooltipSvg.transition()        
        .duration(200)      
        .style("opacity", .8);      

}


/**
 * remove pop-up details
 * 
 * @author Allison Chislett
 */
function removeTooltipDetails() {
	
	tooltipSvg.transition()        
        .duration(200)      
        .style("opacity", 0);
        
    tooltipSvg.selectAll("text").remove();
    
    tooltipDiv.style("visibility","collapse");
}


/**
 * Sets up the bubble chart's y-scale according to the min and max incomes
 * for the current year.
 * 
 * @author Annette Almonte
 */
function updateBubbleScalesAndAxes() {
	prevYearMovies = currYearMovies;
	currYearMovies = moviesDataset.filter(function(d) {	
									return d.production_year == String(currYear);
								});
								

	console.log(currYearMovies);

	bubbleXScale = d3.time.scale()
							.domain([new Date(currYear - 1, startMonth, startDay), new Date(currYear, endMonth, endDay)])
        					.range([axisOffset, chartWidth - axisOffset]);	
	
								
    bubbleYScale = d3.scale.linear()
    						.domain([0, d3.max(currYearMovies, function(d) { return d[yValues[indexCurrYValue]] / factor;})])
    						.range([bubbleChartHeight - axisOffset, axisOffset]);

	bubbleXAxis = d3.svg.axis()
					.scale(bubbleXScale)
					.orient("bottom")
					.tickFormat(d3.time.format("%b"))
					.tickSize(0); 

	bubbleYAxis = d3.svg.axis()
					.scale(bubbleYScale)
					.orient("left")
					.ticks(6)
					.tickFormat(function(d) { 
						return incomeFormat(d); 
					});       		
}


/**
 * Generates the bubble chart.
 * 
 * @author Annette Almonte 
 */
function generateBubbleGraph(){

	bubbleSvg.append("rect")
				.attr("id", "bubbleRect")
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", chartWidth)
				.attr("height", bubbleChartHeight)
				.attr("fill", "rgb(255, 255, 255)");
					
    			
    updateBubbleScalesAndAxes();
	
	bubbleSvg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + (bubbleChartHeight - axisOffset) + ")")
				.call(bubbleXAxis)
				.append("text")
				.attr("text-anchor","middle")
				.attr("x", chartWidth / 2)
				.attr("y", axisLabelMargin - 12)
				.text("Movie Release Date");
	
	bubbleSvg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + axisOffset + ", 0)")
				.call(bubbleYAxis)
				.append("text")
				.attr("id", "yLabel")
				.attr("text-anchor","middle")
				.attr("transform","rotate(-90)")
				.attr("x", -(bubbleChartHeight) / 2)
        		.attr("y", -axisLabelMargin)
        		.text(determineCurrentLabel());	 
    
    bubbleSvg.selectAll("text")
    			.attr("font-size", regTextSize);		   					 
		
	graphBubbles();
	
	bubbleSvg.select(".x.axis")
				.append("text")
				.attr("text-anchor","middle")
				.attr("x", chartWidth / 2)
				.attr("y", axisLabelMargin - 12)
				.text("Movie Release Date");
	
	// If you click anywhere in the bubble chart after a circle is selected
	// the DoD appearing for that circle in the DoD space will disappear		
	d3.select("#bubbleRect")
		.on("click", function(d) {
			d3.select("#bubbleRect")
				.attr("fill", "#FFFFFF");
			if (movieDetailsOn) {
				movieDetailsOn = false;          
				d3.selectAll(".bubble")
				    .attr("opacity", 1.0);
				clearMovieDetails();
			}
			if (!isBubbleChartExpanded) {
				isBubbleChartExpanded = true;
				bubbleChartHeight = 350;				
				lineChartHeight = 250;
				removeLineAndBarGraphs();
				detailsSvg.attr("transform", "translate(0, -50)");
				bubbleSvg.attr("transform", "translate(0, -50)");
				generateLineGraph();
				updateBubbleGraph();
					
			}

		})
		.on("mouseover", function(d) {
			if (!isBubbleChartExpanded) {
				d3.select("#bubbleRect")
					.attr("fill", "#F2F9FA");				
			}
			
		})
		.on("mouseout", function(d) {
			if (!isBubbleChartExpanded) {
				d3.select("#bubbleRect")
					.attr("fill", "#FFFFFF");				
			}
		});
	//d3.select("#bubbleRect")
	
}

/**
 * Graphs the bubbles on the bubble chart and adds interactions.
 * 
 * @author Annette Almonte
 */
function graphBubbles() {

	var bubbles = bubbleSvg.append("g")
							.attr("class", "bubbleChartSvg")
							.selectAll(".bubble")
							.data(currYearMovies)
							.enter()
							.append("g")
							.attr("class", "bubble")
							.attr("visibility", "visible")
							.append("circle")
							.attr("class", "bubbleHalf");
								
	bubbles.attr("cx", function(d) {
				return bubbleXScale(new Date(currYear, d.month - 1, d.day));  
			})
			.attr("cy", function(d) {
				return bubbleYScale(0); 
			})
			.attr("r", radius/2)
			.attr("fill", function(d) {
				return genreColors[parseInt(d.genre1_index)];
			})
			.attr("visibility", "visible");

	arc = d3.svg.arc()
			.innerRadius(0)
			.outerRadius(radius / 2)
			.startAngle(0)
			.endAngle(Math.PI);
			
	bubbleSvg.selectAll(".bubble")
			 .append("path")	
			 .attr("class", "bubbleHalf")
			 .attr("d", arc)
			 .attr("fill", function(d) {
			 	if (d.genre2_index != "") {
					return genreColors[parseInt(d.genre2_index)];
				}
				return genreColors[parseInt(d.genre1_index)]
			  })
			  .attr("transform", function(d) { 
			      return "translate("+ bubbleXScale(new Date(currYear, d.month - 1, d.day)) + "," 
				                     + bubbleYScale(0) + ")";
			  })
			  .attr("visibility", "visible");
			  
	d3.select(".bubbleChartSvg")
		.selectAll("g")
		.transition()
		.duration(2000)
		.attr("transform", function(d) {
			return "translate("+ (-bubbleXScale(new Date(currYear, d.month - 1, d.day))) + "," 
				                     + (-bubbleYScale(0)) + ") scale(2) translate(" + (0) + "," 
				                     + ((bubbleYScale(d[yValues[indexCurrYValue]] / factor) - (bubbleChartHeight - axisOffset)) / 2) + ")";			
		});
	
	bubbleSvg.selectAll(".bubble")
				.on("mouseover", function(d) { 
					if (!movieDetailsOn) {
						d3.selectAll(".bubble")
			                    .attr("opacity", 0.5);
			            d3.select(this).moveToFront()
			                	.attr("opacity", 1.0);
			            displayBubbleTooltipDetails(d);					
					}
	            })
	            .on("mouseout", function(d) { 
	            	if (!movieDetailsOn) {
		            	d3.selectAll(".bubble")
			                    .attr("opacity", 1.0);
			            removeTooltipDetails();            		
	            	}
	            })
	            .on("click", function(d) { 
	            	// Remove the legend if it was previously displayed
	            	if (!movieDetailsOn) {
	            		removeDetails("g.legend");
						removeDetails("text.legend");    			
	           		}
	           		
	           		// Removes details for previously selected movie         	
	            	removeDetails("text.details"); 
	            	
	            	// Removes the tooltip for the movies
	            	removeTooltipDetails(); 
	            	movieDetailsOn = true;
	
		            d3.selectAll(".bubble")
		            	.attr("opacity", 0.5);
		            d3.select(this).moveToFront()
		                .attr("opacity", 1.0);
		            updateMovieDetails(d);
	            });	
	            
	// Draw graph title
	drawBubbleGraphTitle();
	
	bubbleSvg.selectAll(".axis").selectAll(".text").remove();
	
	bubbleSvg.select(".x.axis")
				.attr("transform", "translate(0," + (bubbleChartHeight - axisOffset) + ")")
				.call(bubbleXAxis);
	

	
	bubbleSvg.select("#yLabel")
				.transition()
				.duration(500)
				.attr("transform","rotate(-90)")
				.attr("text-anchor","middle")
				.attr("x", -(bubbleChartHeight) / 2)
        		.attr("y", -axisLabelMargin)
        		.text(determineCurrentLabel());	 
    
    bubbleSvg.selectAll("text")
    			.attr("font-size", regTextSize); 	
}

/**
 * Updates the DoD for the movie data in the DoD space.
 * 
 * @author Annette Almonte and Allison Chislett and Bharadwaj Tanikella
 */
function updateMovieDetails(d) {
		
        currDistributor = d.distributor;
		rating="Movie Rating";
		currRating =  d.rating;
		genre="Genre(s)";
		currGenre =  d.genre;
        currTitle = d.title;
		budget = "Production Budget" ;
        currBudget =  d.formatted_production_budget;
		income = "Domestic Income";
        currIncome = incomeFormat(d.domestic_income);
		aincome= "Adjusted Income";
        currAdjustedIncome = incomeFormat(d.inflation_domestic_income);
        displayDetails();        
}

/**
 * Clears the DoD for the movie data in the DoD space.
 * 
 * @author Annette Almonte
 */
function clearMovieDetails() {
	currDistributor = "";
	currRating = "";
	currGenre = "";
	currTitle = "";
	currBudget = "";
	currIncome = "";
	currAdjustedIncome = "";
	removeDetails("text.details");	
	displayLegend();
}

/**
 * Determines the label for the y-axes based on what mode (adjusted income or
 * actual domestic income) the user is in.
 * 
 * @author Annette Almonte
 */      
function determineCurrentLabel() {
	if (indexCurrYValue == 0) {
		return " Adjusted Income (millions USD)";
	}
	return "Income (millions USD)";
}

/**
 * Determines the label for the y-axes based on what mode (adjusted income or
 * actual domestic income) the user is in.
 * 
 * @author Annette Almonte
 */
function determineCurrentBarYLabel() {
	if (indexCurrYValue == 0) {
		return " Adjusted Income (billions USD)";
	}
	return "Income (billions USD)";
}

/**
 * Draws the title of the bubble graph with the current year.
 * 
 * @author Allison Chislett
 */
function drawBubbleGraphTitle() {
	bubbleSvg.selectAll(".graphTitle").remove();
	bubbleSvg.append("text")
		.attr("class", "graphTitle")
		.attr("x", chartWidth / 2)
		.attr("y", 35)
		.attr("text-anchor", "middle")
		.text("U.S. Adjusted Domestic Income for Top 25 Movies | " + currYear.toString());	
}

/**
 * Updates bubble graph to display current selected year with the filtered
 * components.
 * 
 * NOTE: var t0 = bubbleSvg.transition().duration(500); was a snippet of code
 * I got from HW6; it was made by my then partner, Edward Purcell
 * 
 * @author Annette Almonte
 */
function updateBubbleGraph() {
	
	var t0 = bubbleSvg.transition().duration(500);
	
	updateBubbleScalesAndAxes();
	
	d3.select(".bubbleChartSvg")
		.remove();
		
	graphBubbles();
		
	t0.select(".x.axis").call(bubbleXAxis);
	t0.select(".y.axis").call(bubbleYAxis);
			  
	updateFilter("genreFilter", selectGenre);
	updateFilter("ratingFilter", selectRating);
	updateFilter("distributorFilter", selectDistributor);
		
}

/**
 * generates the line graph to display genre data
 * 
 * @author Allison Chislett
 */
function generateLineGraph(){
	
	lineSvg.append("rect")
				.attr("id", "lineGraphRect")
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", chartWidth)
				.attr("height", lineChartHeight)
				.attr("fill", "rgb(255, 255, 255)")
				.on("click", function(d) {
					d3.select("#lineGraphRect")
						.attr("fill", "#FFFFFF");
					if (lineSelected != null) {
						lineSelected = null;          
						unhighlightPoints();
						unhighlightLines();
					}
					if (isBubbleChartExpanded) {
						isBubbleChartExpanded = false;
						bubbleChartHeight = 250;				
						lineChartHeight = 350;
						removeLineAndBarGraphs();
						detailsSvg.attr("transform", "translate(0, 50)");
						bubbleSvg.attr("transform", "translate(0, 50)");
						generateLineGraph();
						updateBubbleGraph();						
					}
										
					if (movieDetailsOn) {
						movieDetailsOn = false;          
						d3.selectAll(".bubble")
						    .attr("opacity", 1.0);
						clearMovieDetails();
					}
				})
				.on("mouseover", function(d) {
					if (isBubbleChartExpanded) {
						d3.select("#lineGraphRect")
							.attr("fill", "#F2F9FA");				
					}
					
				})
				.on("mouseout", function(d) {
					if (isBubbleChartExpanded) {
						d3.select("#lineGraphRect")
							.attr("fill", "#FFFFFF");				
					}
				});				
	
	// setup axis scales
	var maxIncome = 6500000000;
	//var maxIncomeInflation = d3.max(genreGroupsIncomeInflationDataset);
	
	// set up axis scales
	var lineXScale = d3.scale.linear()
        					.domain([years[0] - 0.5, years[years.length-1] + 1])
        					.range([axisOffset, chartWidth - axisOffset]);

    var lineYScale = d3.scale.linear()
    						.domain([maxIncome,0])
    						.range([axisOffset, lineChartHeight - axisOffset]);
    						
    var lineYValueScale = d3.scale.linear()
    						.domain([maxIncome,0])
    						.range([axisOffset, lineChartHeight - axisOffset - 2]);
    
    						
	var line = d3.svg.line()
				    .x(function(d) { return lineXScale(d.year); })
				    .y(function(d) { return lineYValueScale(d.income); });
    
    
	// draw bars representing total income for top 25 movies each year
	var barColor = "rgb(230,230,230)";
	var barHighlightColor = "#f0f0f0";	
	var barSelectedColor = "#b0b0b0";        
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
							return lineChartHeight - axisOffset - lineYValueScale(d[yValues[indexCurrYValue]]);
						})
						.attr("fill", function(d) {
							if(d.year == currYear) return barSelectedColor;
							else return barColor;
						})
						.on("click", function(d) {
							d3.selectAll(".bar")
								.attr("fill", barColor);
							d3.select(this)
								//.attr("fill", barSelectedColor);
								.attr("fill", function(d) {
									currYear = d.year;
									updateBubbleGraph();
									return barSelectedColor;
								});
							lineSelected = null;
				      		unhighlightLines();
				      		unhighlightPoints();
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
				.attr("transform", "translate(0," + (lineChartHeight-axisOffset) + ")")
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
					.attr("x", -(lineChartHeight) / 2)
			        .attr("y", -axisLabelMargin)
			        .text(determineCurrentBarYLabel());
			        
			        
	lineSvg.selectAll("text")
			.attr("font-size", regTextSize);
						
	// draw lines representing total incomes for each genre group
	var genreLines = lineSvg.selectAll(".genreGroup")
						      	.data(function() { 
						      			if(indexCurrYValue == 0) 
						      				return genreGroupsIncomeInflation;
			      						else 
			      							return genreGroupsIncome; })
						    	.enter()
						    	.append("g")
						      	.attr("id", function(d) { return d.name + " Group"; });
	
					      	
	genreLines.append("path")
		  .attr("id", function(d) { return d.name + " Line"; })
	      .attr("class", "line")
	      .attr("d", function(d) { return line(d.values); })
	      .on("mouseover", function(d) { 
	      	if(lineSelected == null) {
	      		highlightLine(this.parentNode);
	      	}
	      })
	      .on("mouseout", function(d) {
	      	if(lineSelected == null) { 
	      		unhighlightLines(); 
	      	}
	      })
	      .on("click", function(d) {
	      	if(lineSelected == null) {
	      		selectLine(this.parentNode,d.name);
	      	}
	      	else {
	      		lineSelected = null;
	      		unhighlightLines();
	      		unhighlightPoints();
	      	}
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
    		var thisLine = this;
			d3.select(this)
				.append("g")
				.attr("id", genreName + " Points")
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
					if(lineSelected == null) {
						highlightPoint(this);
						highlightLine(thisLine);
						displayLineTooltipDetails(d,genreName);
					}
					else if(lineSelected == thisLine) {
						displayLineTooltipDetails(d,genreName);
					}
				})
				.on("mouseout", function(d) {
					if(lineSelected == null) {
						unhighlightPoints();
						unhighlightLines();
					}
					removeTooltipDetails();
				})
				.on("click", function(d) {
					if(lineSelected == null){ 
						selectLine(thisLine,genreName); 
					}
					else {
						lineSelected = null;
						unhighlightPoints();
						unhighlightLines();
					}
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
			.text("U.S. Total Adjusted Domestic Income for Top 25 Movies per Year");
}

/**
 * Removes the line graph and bar chart.
 * 
 * @author Annette Almonte
 */
function removeLineAndBarGraphs() {
	d3.select("#lineChart")
		.select("rect")
		.remove();
	d3.select("#lineChart")
		.selectAll("g")
		.remove();
	d3.select("#lineChart")
		.select("text")
		.remove();	
}

/**
 * "Selects" the line that was clicked.
 * Highlights the line (even when mouse moves away)
 * and highlights all the points on that line.
 * 
 * @param o the path group object that was clicked
 * @param genreName the genre group name of the path/line that was clicked
 * @author Allison Chislett
 */
function selectLine(o, genreName) {	
	lineSelected = o;
	highlightLine(o);
	d3.select(o).selectAll(".point")
		.moveToFront()
		.each( function(d) { highlightPoint(this); });
}

/**
 * Highlights the line that's being hovered over.
 * 
 * @param o the path group object that is being hovered over
 * @author Allison Chislett
 */
function highlightLine(o) {
	d3.selectAll(".line")
		.transition()        
        .duration(100)
        .attr("opacity", 0.2);
	
	d3.select(o).select("path")
		.transition()        
        .duration(100)
        .attr("opacity", 1.0)
		.style("stroke-width",4);
		
	d3.select(o).moveToFront();			
}

/**
 * Returns all of the lines to their normal state when
 * the user is not hovering over any of them.
 * 
 * @author Allison Chislett
 */
function unhighlightLines() {
	d3.selectAll(".line")
		.transition()        
        .duration(200)
	    .attr("opacity", 1.0)
	    .style("stroke-width",2);
	    
}

/**
 * Highlights the point that's being hovered over.
 * 
 * @param o the circle object that is being hovered over
 * @author Allison Chislett
 */
function highlightPoint(o) {
	d3.select(o)
		.transition()        
        .duration(200)
		.attr("opacity", 1.0);

}

/**
 * Returns the point to its normal state when
 * the user is not hovering over it.
 * 
 * @author Allison Chislett
 */
function unhighlightPoints() {
	d3.selectAll(".point")
		.transition()        
        .duration(200)
		.attr("opacity", 0.0);

}


/**
 * Filter for genres. This is the function that gets called when a 
 * checkbox under the Genre category gets checked/unchecked. This 
 * function is hooked to the HTML.
 * 
 * @param {Object} value the input obtained from the checkbox when it's clicked
 * @author Annette Almonte 
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
 * @author Annette Almonte 
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
 * @author Annette Almonte 
 */
function selectDistributor(value) {
	filter(value, "distributor_filter");
}

/**
 * Checks/unchecks all of the filters.
 * 
 * @param {Object} value the input obtained from the checkbox when it's clicked
 * @author Annette Almonte 
 */
function selectAll(value) {
	var isChecked = document.getElementById(value).checked;
	var checkboxes = document.getElementsByClassName("filter");
	for (var i = 0; i < checkboxes.length; i++) {
		if (isChecked) {
			checkboxes[i].checked = true;
			d3.selectAll(".bubbleHalf").each(function(d) {
					d3.select(this).attr("visibility", "visible");
				});
		}
		else {
			checkboxes[i].checked = false;
			d3.selectAll(".bubbleHalf").each(function(d) {
					d3.select(this).attr("visibility", "hidden");
				});		
		}
	}	
}

/**
 * Filter for the elements that get checked/unchecked in the checkboxes.
 * 
 * @param {Object} value the input obtained from the checkbox when it's clicked
 * @param {Object} filterName the name of the column in the dataset D3 will 
 *                 use to see whether a bubble has the same category that is
 *                 being filtered 
 * @author Annette Almonte 
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
 * Iterates through all the categories that have been unchecked and updates
 * the filtered selection.
 * 
 * @param {Object} filterName the name of the filter based on its HTML "name" attribute
 * @param {Object} filteringFunction filter function that will be used depending on the 
 *                 kind of data that's being filtered (genre, rating, or distributor)
 * @author Annette Almonte 
 */
function updateFilter(filterName, filteringFunction) {
	var categories = document.getElementsByName(filterName);
	for (var i = 0; i < categories.length; i++) {
		if (document.getElementById(categories[i].value).checked == false) {
			filteringFunction(categories[i].value);
		}
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
 * 
 * @author Annette Almonte 
 */
function updateBubbleVisibility(visibilityAttribute, checkboxInput, filterType, category) {
	
	var visibilityStatus;
	
	d3.selectAll(".bubbleHalf").each(function(d) {
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

/*
 * returns the width in pixels of the bounding box of a string of text
 * assuming text style is same as for .tooltipText
 * 
 * credit: Andy Pruett
 */
function measureTextWidth(text) {
	
	$("#measureText").empty();
	return $("#measureText").text(text).outerWidth();
}
