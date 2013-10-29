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
var bubbleChartWidth = 1000;
var bubbleChartHeight = 300;
var lineChartWidth = 1000;
var lineChartHeight = 300;
var detailsWidth = 1000;
var detailsHeight = 200;
var filtersWidth = 200;
var filtersHeight = 800;

// Bubblechart variables /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var bubbleSvg;
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

// Indicates the graph's current mode (e.g., domestic income or inflation adjusted income)
var indexCurrYValue = 0;
var yValues = ["inflation_domestic_income", "domestic_income"];

var xScaleOffset = 50;
var yScaleOffset = 50;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Instead of having incomes display as millions (1,000,000), have them display as 100
var factor = 1000000.0;

// set up the svg layout 
function setupLayout(){
	

				

	/*var detailsSvg = svg.append("svg")
						//.attr("id", "details")
						.attr("x", "0")
						.attr("y", "bubbleChartHeight")
						.attr("width", detailsWidth)
						.attr("height", detailsHeight);
	var lineSvg = svg.append("svg")
						//.attr("id", "lineChart")
						.attr("x", "0")
						.attr("y", "bubbleChartHeight + detailsHeight")
						.attr("width", lineChartWidth)
						.attr("height", lineChartHeight);
	var filtersSvg = svg.append("svg")
						//.attr("id", "filters")
						.attr("x", "bubbleChartWidth")
						.attr("y", "0")
						.attr("width", filtersWidth)
						.attr("height", filtersHeight);*/
}
setupLayout();
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
            	moviesDataset = data;
            	generateBubbleGraph();
            	//generateSidePanel();
            }  
            else {
            	genresDataset = data;
            	//generateLineGraph();
            }
     
    		
        }
    });	
}

/*
 * Generates the bubble chart. 
 */
function generateBubbleGraph(){
	svg = d3.select("body")
			.append("svg")
			.attr("class", "bubbleChart")
			.attr("width", svgWidth)
			.attr("height", svgHeight);
				
	bubbleSvg = svg.append("svg")
					//.attr("id", "bubbleChart")
					.attr("x", "0")
					.attr("y", "0")
					.attr("width", bubbleChartWidth)
					.attr("height", bubbleChartHeight);
	// Setup the scales
	var bubbleXScale = d3.time.scale()
        					.domain([new Date(currYear, startMonth, startDay), new Date(currYear, endMonth, endDay)])
        					.range([xScaleOffset, bubbleChartWidth - xScaleOffset]);


        			
    var bubbleYScale = d3.scale.linear()
    				//.domain([0, d3.max(moviesDataset, function(d) {
    					//return parseInt(d[yValues[indexCurrYValue]]);
    				//})])
    						.domain([d3.max(moviesDataset, function(d) { return parseInt(d[yValues[indexCurrYValue]]) / factor;}),
    				 		0])
    						.range([yScaleOffset, bubbleChartHeight]);
	var bubbleXAxis = d3.svg.axis()
						.scale(bubbleXScale)
						.orient("bottom")
						.tickFormat(d3.time.format("%b"));
				
	var bubbleYAxis = d3.svg.axis()
						.scale(bubbleYScale)
						.orient("left")
						.ticks(6);
					
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + bubbleChartHeight + ")")
		.call(bubbleXAxis)
		.append("text")
		.attr("x", bubbleChartWidth / 2 - 50)
		.attr("y", 35)
		.text("Movie Release Date");
	
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + yScaleOffset + ", 0)")
		.call(bubbleYAxis)
		.append("text")
		.attr("transform","rotate(-90)")
		.attr("x", -bubbleChartHeight + determineCurrentLabel().length / 2)
        .attr("y", -40)
        .text(determineCurrentLabel());	
        
	var bubbles = svg.selectAll("circles")
						.data(moviesDataset)
						.enter()
						.append("circle");	
	
	//bubbles.attr("cx", function(d, i))
}

/*
 * Determines the label for the y-axes based on what mode (adjusted income or
 * actual domestic income) the user is in.
 */      
function determineCurrentLabel() {
	if (indexCurrYValue == 0) {
		return " Adjusted Domestic Income (in millions USD)";
	}
	return "Domestic Income (in USD millions)";
}
