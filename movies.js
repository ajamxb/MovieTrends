// Contains the top 25 movies from 1983-2012 
var moviesDataset;

// Contains genre data for the top 25 movies from 1983-2012
var genreDataset;

// csv filenames 
var files = new Array("1983-2012_movies.csv", "1983-2012_genres.csv");

// dimensions


// svg 
var bubbleSvg = d3.select("body").append("svg")
					.attr("id", "bubbleChart")
					.attr("width", bubbleChartWidth)
					.attr("height", bubbleChartHeight);
var detailsSvg = d3.select("body").append("svg")
					.attr("id", "details")
					.attr("width", detailsWidth)
					.attr("height", detailsHeight);
var lineSvg = d3.select("body").append("svg")
					.attr("id", "lineChart")
					.attr("width", lineChartWidth)
					.attr("height", lineChartHeight);
var filtersSvg = d3.select("body").append("svg")
					.attr("id", "filters")
					.attr("width", filtersWidth)
					.attr("height", filtersHeight);

					


loadData(files[0]);

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
            moviesDataset = data;
            //generateTitle();
    		    //generateBubbleGraph();
    		    //generateLineGraph();
    		    //generateSidePanel();
        }
    });	
}
