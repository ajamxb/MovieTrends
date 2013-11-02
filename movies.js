// Contains the top 25 movies from 1983-2012 
var moviesDataset;

// Contains genre data for the top 25 movies from 1983-2012
var genreDataset;

// csv filenames 
var files = new Array("1983-2012_movies.csv", "1983-2012_genres.csv");

// Dimensions for all the components in our vis
var svg;
var svgWidth = 1200;
var svgHeight = 800;
var totalChartHeight = 300;
var chartWidth = 1000;
var chartHeight = 300;
var detailsWidth = 1000;
var detailsHeight = 200;
var filtersWidth = 200;
var filtersHeight = 800;

var hiddenCoordinate = -100;

// svg variables
var svg, bubbleSvg, detailsSvg, lineSvg, filtersSvg;

// array of 20 colors - will be indexed/accessed by genre name (e.g. color[Comedy])
var color = d3.scale.category20();

// Linechart Variables
// once data is imported, will map genre name to values (.year and .count)
var genres;

// Bubblechart variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var monthNames = ["Jan", "Feb", "Mar", "April", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var years = [1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1992, 1993, 1994, 1995, 1996,
             1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
             2012];
var currYear = years[years.length-1];

// Represent Jan and Dec, respectively
var startMonth = 0; 
var endMonth = 11;

// Represent first and last day of the month, respectively
var startDay = 1; 
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
	
	svg = d3.select("body")
				.append("svg:svg")
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
	filtersSvg = svg.append("svg")
						//.attr("id", "filters")
						.attr("x", chartWidth)
						.attr("y", "0")
						.attr("width", filtersWidth)
						.attr("height", filtersHeight)
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
            console.log(data);  //DEBUG: delete this later...     
            if (filename == files[0]) {
            	setupLayout();
            	moviesDataset = data;
            	generateBubbleGraph();
            	generateDetails();
            	
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
	filtersSvg.append("rect")
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", filtersWidth)
				.attr("height", filtersHeight)
				.attr("fill", "rgb(255,0,0)");
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
				.attr("fill", "rgb(0,0,255)");
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
							.domain([new Date(currYear, startMonth, startDay), new Date(currYear, endMonth, endDay)])
        					.range([scaleOffset, chartWidth - scaleOffset]);
        			
    var bubbleYScale = d3.scale.linear()
    						.domain([d3.min(moviesDataset, function(d) { return d[yValues[indexCurrYValue]] / factor;}),
    								d3.max(moviesDataset, function(d) { return d[yValues[indexCurrYValue]] / factor;})])
    						.range([chartHeight - scaleOffset, scaleOffset]);
    						
	var bubbleXAxis = d3.svg.axis()
						.scale(bubbleXScale)
						.orient("bottom")
						.tickFormat(d3.time.format("%b"));
				
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
				return color(d.genre1);
			})
			.on("mouseover", function(d) { 
            	d3.select(this.parentNode)
                	.selectAll("circle")
                    .attr("opacity", 0.5);
                d3.select(this).moveToFront()
                	.attr("opacity", 1.0);
            })
            .on("mouseout", function(d) { 
                d3.select(this.parentNode)
                	.selectAll("circle")
                    .attr("opacity", 1.0);
            })
			.attr("stroke", function (d) {
				if (d.genre2 != "") {
					return color(d.genre2);
				}
				return color(d.genre1);
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
	var genre = lineSvg.selectAll(".genre")
					      	.data(genres)
					    	.enter()
					    	.append("g")
					      	.attr("class", "genre");
						      	
	genre.append("path")
	      .attr("class", "line")
	      .attr("d", function(d) { return line(d.values); })
	      .on("mouseover", function(d) { 
	      	d3.selectAll(".line")
	      		.attr("opacity", 0.2)
	      	d3.select(this.parentNode).moveToFront() 
	      	highlight(this); 
	      })
	      .on("mouseout", function(d) { 
	      	unhighlight(this); 
	      })
	      .style("stroke", function(d) { return color(d.name); })
	      .style("stroke-width", 2)
	      .style("fill","none")
	      .append("title")
          .text(function(d) { return d.name;});
	

}


/*
 * Highlights the line that's being hovered over.
 */
function highlight(o) {
	d3.select(o)
	    .attr("opacity", 1.0)
		.style("stroke-width",4);
}

/*
 * Returns all of the lines to their normal state when
 * the user is not hovering over any of them.
 */
function unhighlight(o) {
	d3.selectAll(".line")
	    .attr("opacity", 1.0)
	d3.select(o)
		.style("stroke-width",2);
}

