// Contains the top 25 movies from 1983-2012 
var moviesDataset;

// Contains genre data for the top 25 movies from 1983-2012
var genreDataset;

// csv filenames 
var files = new Array("1983-2012_movies.csv", "1983-2012_genre_groups_income_inflation.csv");

// Dimensions for all the components in our vis
var svg;
var svgWidth = 1000;
var svgHeight = 1400; //Changed for the bar graph. 
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

// array of 20 colors - will be indexed/accessed by genre name (e.g. color[Comedy])
var color = d3.scale.category20();

// Linechart Variables
// once data is imported, will map genre name to values (.year and .count)
var genres;

// Bubblechart variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var years = [1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1992, 1993, 1994, 1995, 1996,
             1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
             2012];
             
var genreColors = ["#D63E3F", "#C1E090", "#65B5F7", "#F5EA58", "#FAAC3E", "#bfe3e1", "#89739E", "#DE76A1",
                   "#454269", "#D8C0EB", "#FAC8E8", "#7CB360", "#BFBFBF", "#9E5D5D", "#E8C387"];
var currYear = years[years.length-1];

// Represent Jan and Dec, respectively
var startMonth = 11; 
var endMonth = 11;

// Represent first and last day of the month, respectively
var startDay = 15; 
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Instead of having incomes display as millions (1,000,000), have them display as 100
var factor = 1000000.0;

var currDistributor, currRating, currGenre, currTitle, currBudget, currIncome, currAdjustedIncome;

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
			
	bubbleSvg = svg.append("svg")
						//.attr("id", "bubbleChart")
						.attr("x", "0")
						.attr("y", "0")
						.attr("width", chartWidth)
						.attr("height", chartHeight)
						.attr("overflow","visible");
	detailsSvg = svg.append("svg")
						//.attr("id", "details")
						.attr("x", "0")
						.attr("y", chartHeight)
						.attr("width", detailsWidth)
						.attr("height", detailsHeight)
						.attr("overflow","visible");
	lineSvg = svg.append("svg")
						//.attr("id", "lineChart")
						.attr("x", "0")
						.attr("y", (chartHeight + detailsHeight))
						.attr("width", chartWidth)
						.attr("height", chartHeight)
						.attr("overflow","visible");
	barSvg = svg.append("svg")
                                                //.attr("id", "barChart")
                                                .attr("x", "0")
                                                .attr("y", (chartHeight+detailsHeight+290))
                                                .attr("width", chartWidth)
                                                .attr("height", chartHeight)
                                                .attr("overflow","visible");
	
}

loadData(files[0]);
loadData(files[1]);


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
            	generateBarGraph();
            	
            }  
            else {
            	genresDataset = data;
            	// adapted example from http://bl.ocks.org/mbostock/3884955
	            color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));
	            
	            genres = color.domain().map(function(name) {
							    return {
							      name: name,
							      values: data.map(function(d) {
							        return { year: d.year, count: +d[name]};
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
}


/*
 * Displays the data pertaining to a movie when a user
 * hovers over a bubble.
 */
function displayDetails() {
	detailsSvg.append("svg:text")
    			.attr("x", 20)
				.attr("y", 40)
        		.attr("text-anchor", "start")
        		.text(currDistributor)
        		
    detailsSvg.append("svg:text")
        	   	.attr("x", 20)
        	   	.attr("y", 80)
        	   	.attr("text-anchor", "start")
        	   	.text(currRating);
        	   	
    detailsSvg.append("svg:text")
        	   	.attr("x", 20)
        	   	.attr("y", 120)
        	   	.attr("text-anchor", "start")
        	   	.text(currGenre);
        	   	
    detailsSvg.append("svg:text")
    			.attr("class", "movieTitle")
        	   	.attr("x", detailsWidth / 2)
        	   	.attr("y", 80)
        	   	.attr("text-anchor", "middle")
        	   	.text(currTitle); 

    detailsSvg.append("svg:text")
        	   	.attr("x", detailsWidth - 20)
        	   	.attr("y", 40)
        	   	.attr("text-anchor", "end")
        	   	.text(currBudget);

    detailsSvg.append("svg:text")
        	   	.attr("x", detailsWidth - 20)
        	   	.attr("y", 80)
        	   	.attr("text-anchor", "end")
        	   	.text(currIncome);

    detailsSvg.append("svg:text")
        	   	.attr("x", detailsWidth - 20)
        	   	.attr("y", 120)
        	   	.attr("text-anchor", "end")
        	   	.text(currAdjustedIncome);        	   	
        	   	       	        	   	       	
}

/*
 * Removes the data displayed in the DoD area.
 */
function removeDetails() {
	detailsSvg.selectAll("text").remove();
}
/*
 * Generates the bubble chart. 
 */
function generateBubbleGraph(){
	/*
	svg = d3.select("body")
			.append("svg")
			.attr("class", "visualization")
			.attr("width", svgWidth)
			.attr("height", svgHeight);
				
	bubbleSvg = svg.append("svg")
					.attr("id", "bubbleChart")
					.attr("x", "0")
					.attr("y", "0")
					.attr("width", chartWidth)
					.attr("height", totalChartHeight);
	*/
	// Setup the scales
	var bubbleXScale = d3.time.scale()
							.domain([new Date(currYear - 1, 11, 15), new Date(currYear, endMonth, endDay)])
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
		.attr("y", axisLabelMargin)
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
  
    var circles = bubbleSvg.append("g")
    					.selectAll("circle")
    					.data(genreColors)
    					.enter()
    					.append("circle");   
    					
    	circles.attr("cx", function(d, i) {
				return i * 25 +100; 
			})
			.attr("cy", 10)
			.attr("r", radius)
			.attr("fill", function (d, i) {
				return genreColors[i];
			});  
			
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
					return bubbleYScale(d[yValues[indexCurrYValue]] / factor); //bubbleYScale(d.inflation_domestic_income / factor);
				}
				return hiddenCoordinate;
			})
			.attr("r", radius)
			.attr("fill", function (d) {
				return genreColors[parseInt(d.genre1_index)];
			})
			.attr("stroke", function (d) {
				if (d.genre2_index != "") {
					return genreColors[parseInt(d.genre2_index)];//color(d.genre2);
				}
				return genreColors[parseInt(d.genre1_index)];
			})
			.on("mouseover", function(d) { 
            	d3.select(this.parentNode)
                	.selectAll("circle")
                    .attr("opacity", 0.5);
                d3.select(this).moveToFront()
                	.attr("opacity", 1.0);
               	currDistributor = "Distributor: " + d.distributor;
               	currRating = "Rating: " + d.rating;
               	currGenre = "Genre: " + d.genre;
               	currTitle = d.title;
               	currBudget = "Production Budget: $" + d.production_budget;
               	currIncome = "Domestic Income: $" + d.domestic_income;
               	currAdjustedIncome = "Adjusted Income: $" + d.inflation_domestic_income;
               	displayDetails();
            })
            .on("mouseout", function(d) { 
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
               	removeDetails();
            })
			.attr("stroke-width", stroke)
			.attr("opacity", function (d) {
				if (d.production_year != currYear){
					return 0.0;
				}
				return 1.0;
			});
}

/*
 * Determines the label for the y-axes based on what mode (adjusted income or
 * actual domestic income) the user is in.
 * 
 * @author Annette Almonte
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
function generateBarGraph(){
	var valueLabelWidth = 40; // space reserved for value labels (right)
	var barHeight = 20; // height of one bar
	var barLabelWidth = 100; // space reserved for bar labels
	var barLabelPadding = 5; // padding between bar and bar labels (left)
	var gridLabelHeight = 18; // space reserved for gridline labels
	var gridChartOffset = 3; // space between start of grid and first bar
	var maxBarWidth = 420; // width of the bar with the max value

	// data aggregation
	var aggregatedData = d3.nest()
	  .key(function(d) { return d['production_year']; })
	  .rollup(function(d) {
		return {
		  'value': d3.sum(d, function(e) { return parseFloat(e['inflation_domestic_income']); })
		};
	  })
	  .entries(moviesDataset);
		
	// accessor functions 
	var barLabel = function(d) { return d.key; };
	var barValue = function(d) { return d.values.value; };
	 
	// scales
	var yScale = d3.scale.ordinal()
						.domain(d3.range(0, aggregatedData.length))
						.rangeBands([0, aggregatedData.length * barHeight]);
	var y = function(d, i) { return yScale(i); };
	var yText = function(d, i) { return y(d, i) + yScale.rangeBand() / 2; };
	var x = d3.scale.linear()
				.domain([0, d3.max(aggregatedData, barValue)])
				.range([0, maxBarWidth]);
	// svg container element
	barSvg.append("svg")
	  .attr('width', maxBarWidth + barLabelWidth + valueLabelWidth)
	  .attr('height', gridLabelHeight + gridChartOffset + aggregatedData.length * barHeight);
	// grid line labels
	var gridContainer = barSvg.append('g')
	  .attr('transform', 'translate(' + barLabelWidth + ',' + gridLabelHeight + ')'); 
	// vertical grid lines
	gridContainer.selectAll("line").data(x.ticks(10)).enter().append("line")
	  .attr("x1", x)
	  .attr("x2", x)
	  .attr("y1", 0)
	  .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
	  .style("stroke", "#ccc");
	// bar labels
	var labelsContainer = barSvg.append('g')
	  .attr('transform', 'translate(' + (barLabelWidth - barLabelPadding) + ',' + (gridLabelHeight + gridChartOffset) + ')'); 
	labelsContainer.selectAll('text').data(aggregatedData).enter().append('text')
	  .attr('y', yText)
	  .attr('stroke', 'none')
	  .attr('fill', 'black')
	  .attr("dy", ".35em") // vertical-align: middle
	  .attr('text-anchor', 'end')
	  .text(barLabel);
	// bars
	var barsContainer = barSvg.append('g')
	  .attr('transform', 'translate(' + barLabelWidth + ',' + (gridLabelHeight + gridChartOffset) + ')'); 
	barsContainer.selectAll("rect").data(aggregatedData).enter().append("rect")
	  .attr('y', y)
	  .attr('height', yScale.rangeBand())
	  .attr('width', function(d) { return x(barValue(d)); })
	  .attr('stroke', 'white')
	  .attr('fill', 'steelblue');
	// bar value labels
	barsContainer.selectAll("text").data(aggregatedData).enter().append("text")
	  .attr("x", function(d) { return x(barValue(d)); })
	  .attr("y", yText)
	  .attr("dx", 3) // padding-left
	  .attr("dy", ".35em") // vertical-align: middle
	  .attr("text-anchor", "start") // text-align: right
	  .attr("fill", "black")
	  .attr("stroke", "none")
	  .text(function(d) { return d3.round(barValue(d), 2); });
	// start line
	barsContainer.append("line")
	  .attr("y1", -gridChartOffset)
	  .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
	  .style("stroke", "#000");
	
}
// A function which allows a complete sorting of the bar graph from lowest to highest with the changes of the labels on the x,y axis.
// var timeOut = setTimeout(function(){filter()}, 200);

// function filter() {
    // clearTimeout(timeOut);

    // var x0 = x.domain(data.sort(this.checked
        // ? function(a, b) { return b.values.value - a.values.value; }
        // : function(a, b) { return d3.ascending(a.key, b.key); })
        // .map(function(d) { return d.key; }))
        // .copy();

    // var transition = svg.transition().duration(750),
        // delay = function(d, i) { return i * 50; };

    // transition.selectAll(".bar")
        // .delay(delay)
        // .attr("x", function(d) { return x0(d.key); });

    // transition.select(".x.axis")
        // .call(xAxis)
      // .selectAll("g")
        // .delay(delay);
  // }
  
  
  

/*
 * generates the line graph to display genre data
 * @author Allison Chislett
 * @version Oct30_2013
 */
function generateLineGraph(){
	
	// setup axis scales
	var maxGenreCount = 15;
	var lineXScale = d3.scale.linear()
        					.domain([years[0],years[years.length-1]])
        					.range([scaleOffset, chartWidth - scaleOffset]);

    var lineYScale = d3.scale.linear()
    						.domain([maxGenreCount,0])
    						.range([scaleOffset, chartHeight - scaleOffset]);
    						
	var line = d3.svg.line()
				    //.interpolate("basis") // gives line smooth curves
				    .x(function(d) { return lineXScale(d.year); })
				    .y(function(d) { return lineYScale(d.count); });
    
    
	// draw axes
	var lineXAxis = d3.svg.axis()
						.scale(lineXScale)
						.orient("bottom")
						.ticks(30)
						.tickFormat(d3.format(".0f"));
				
	var lineYAxis = d3.svg.axis()
						.scale(lineYScale)
						.orient("left")
						.ticks(8);
				
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
			        .text("Number of Movies in Top 25");
			        
			        
	// draw lines
	var genreLines = lineSvg.selectAll(".genreLine")
					      	.data(genres)
					    	.enter()
					    	.append("g")
					      	.attr("class", "genreLine");
						      	
	genreLines.append("path")
		  .attr("id", function(d) { return d.name.concat("Line"); })
	      .attr("class", "line")
	      .attr("d", function(d) { return line(d.values); })
	      .on("mouseover", function(d) { 
	      	highlightLine(d3.select(this)); 
	      })
	      .on("mouseout", function(d) { 
	      	unhighlightLine(d3.select(this)); 
	      })
	      .style("stroke", function(d) { return color(d.name); })
	      .style("stroke-width", 2)
	      .style("fill","none")
	      .append("title")
          .text(function(d) { return d.name;});
     
    // create dots on data points (one per genre per year) 
    // these will appear on a line when the data point on the line is hovered over

    var genreNames = d3.keys(genresDataset[0]).filter(function(key) { return key !== "year"; });
    
    //var genrePoints = lineSvg.append("g")
    //						.attr("class", "genrePoints");
 
	for (var n in genreNames) {
		var genreName = genreNames[n];
		var idName = genreName.concat("Point");
	    var genrePoints = lineSvg.append("g")
	    			.attr("id", idName.concat("s"))
	    			.attr("class", "genrePoint");
		
		genrePoints.selectAll("circle")
			      	.data(genresDataset)
			    	.enter()
			    	.append("circle")
			    	.attr("id", function(d) { return d.year.toString().concat(idName); })
			      	.attr("class", "point")
			      	.attr("cx", function(d) { return lineXScale(d.year); })
					.attr("cy", function(d) { return lineYScale(d[genreName]); })
					.attr("r", 6)
					.on("mouseover", function(d) {
						highlightPoint(this); 
					})
					.on("mouseout", function(d) { 
						unhighlightPoint(this); 
					})
					.on("click", function(d) { currYear = d.year; 
												updateBubbleGraph(); })
	 				.attr("opacity", 0.0)
	 				.style("stroke", function(d) { return color(genreName); })
	 				.style("stroke-width", 2)
					.style("fill", "white")
					.append("title")
					.text(function(d) { return d.year.concat("\n",genreName," : ",d[genreName]); });
		
		d3.selectAll(".genrePoint").moveToFront();
	}

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
			
	d3.selectAll(".genrePoint").moveToFront();
}

/*
 * Returns all of the lines to their normal state when
 * the user is not hovering over any of them.
 */
function unhighlightLine(o) {
	d3.selectAll(".line")
	    .attr("opacity", 1.0);
	    
	o.style("stroke-width",2);
		
	d3.selectAll(".genrePoint").moveToFront();
}

/*
 * Highlights the point that's being hovered over.
 */
function highlightPoint(o) {
	d3.select(o)
		.attr("opacity", 1.0);
	
	var p = "#";
	var lineId = p.concat(d3.select(o.parentNode).attr("id").replace("Points","Line"));
	var line = d3.select(lineId);
	highlightLine(line);
	      		
	d3.selectAll(".genrePoint").moveToFront();
}

/*
 * Returns the point to its normal state when
 * the user is not hovering over it.
 */
function unhighlightPoint(o) {
	d3.select(o)
		.attr("opacity", 0.0);
	
	var p = "#";
	var lineId = p.concat(d3.select(o.parentNode).attr("id").replace("Points","Line"));
	var line = d3.select(lineId);
	unhighlightLine(line);
	        
	d3.selectAll(".genrePoint").moveToFront();
}
