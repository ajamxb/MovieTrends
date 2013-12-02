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
	var barColor = "#d3d3d3";
	var barHighlightColor = "#b0b0b0";	   
	var colors= "#F0F0F0 ";
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
							return chartHeight - axisOffset - lineYValueScale(d.inflation_domestic_income);
						})
						.transition().delay(function (d,i){ return i * 300;})
						.attr("height", function(d) { return lineYScale(d.inflation_domestic_income); })
						.attr("y", function(d) { return chartHeight - lineYScale(d.inflation_domestic_income) - .5; })
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
								.attr("fill", colors);
								
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
						.tickFormat(function(d) { return incomeFormat(d / factor); });
			        
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
			        .text(determineCurrentLabel());
						
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
