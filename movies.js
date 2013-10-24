// Contains the top 25 movies from 1983-2012 
var moviesDataset;

// Contains genre data for the top 25 movies from 1983-2012
var genreDataset;

// csv filenames 
var files = new Array("1983-2012_movies.csv", "1983-2012_genres.csv");

loadData(files[0]);

// Dimensions for all the components in our vis
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

/*
 * 
 */
