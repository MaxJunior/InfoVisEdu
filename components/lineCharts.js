//svgLineCharts
// svgLines

const margin_lines = {top : 10 , right: 10 , bottom: 0 , left : 80 };
const height_lines = 0.3 * window.innerHeight - (margin_lines.top + margin_lines.bottom);
const width_lines = 0.49 * window.innerWidth - (margin_lines.left + margin_lines.right);
    // const colors = ["steelblue", "darkorange", "lightblue"];
    // var edu_levels = ['Level1', 'Level2', 'Level3'];
    // var countries,years ; 


var color_scale = d3.scaleSequential(d3.interpolateYlOrRd);
 var linesChart = d3.select("#svgLines").append("g")
    //  .attr("transform", "translate(,-45)")
    .attr('height', height_lines + margin_lines.top + margin_lines.bottom)
    .attr('width', width_lines + margin_lines.left + margin_lines.right );
    //  .attr("transform", "translate(" + margin_lines.left + ", " + margin_lines.top + ")");

    var tip_lines = d3.tip().attr('class', 'd3-tip2')
    .html(function(d) {
        var country_code = d.Country;
        var text = "<strong style='color:red'>Country:</strong> <span style='color:white;text-transform:capitalize'>" + countries_ext_name[country_code] + "</span><br>";
        text += "<strong>Percentage:</strong> <span>" +  d.Percentage + "%" + "</span><br>";
        text += "<strong>Year:</strong> <span>" +  d.Year  + "</span><br>";

        // text += "<strong>Population:</strong> <span style='color:red'>" + d3.format(",.0f")(d.population) + "</span><br>";
        return text;
    });

    linesChart.call(tip_lines);
   //  Axis  
    var y_scale_perc = d3.scaleLinear().range([height_lines , margin_lines.top]);
    var x_scale_years = d3.scaleLinear().range([width_lines + margin_lines.left ,margin.left]);

    // Label : Idiom legend
    var earlyLeaver_title = linesChart.append("text")
     .attr("x", (width + margin_lines.left* 2)/ 2 )
     .attr("y", 20)
     .attr("font-size", "18px")
     .style("text-anchor", "middle")
     .style("fill", "#AAA")
     .text("Education Early Leaver ");
  

    /// Label  :  y axis
    var y_axis_legend = linesChart.append("text")
      .attr("x", - margin_lines.left/2 - 120 )
      .attr("y", height_lines - 140 )
      .attr("transform", "rotate(-90)")
      .style("fill", "#AAA")
      .text("Percentage (%) ");
   
   ///  Label :  x axis

   var x_axis_legend = linesChart.append("text")
      .attr("x", width_lines + margin_lines.left +  20)
      .attr("y", height_lines + margin_lines.top + 15)
      .style("fill", "#AAA")
      .text("Years");



    d3.json("content/data/early_leaver.json").then(function(data){
        var current_dataset = data;
        // console.log("Early_leaver : ", data);
        var years_lines   = [...new Set(data.map(d => d.Year))].reverse();
        var countries_lines = [...new Set(data.map(d => d.Country))];
        var countries_Indexes = countries_lines.map(i => countries_lines.indexOf(i));
        var countries_ext_name = {"BE": "Belgium","DE": "Germany","EE": "Estonia","EL": "Greece","ES": "Spain",
        "FR": "France" ,"IT": "Italy","LU": "Luxembourg","HU": "Hungary","NL": "Netherlands",
        "AT": "Austria","PL": "Poland","RO": "Romania","FI": "Finland","UK": "United Kingdom",
        "NO" : "Norway","RS": "Serbia","TR": "Turkey"  };
        var codes ={ "Belgium" : "BE", "Germany": "DE", "Estonia":"EE","Greece":"EL","Spain":"ES",
        "France":"FR" ,"Italy":"IT","Luxembourg": "LU","Hungary":"HU","Netherlands":"NL",
        "Austria":"AT","Poland":"PL","Romania":"RO", "Finland":"FI","United Kingdom":"UK",
        "Norway": "NO","Serbia":"RS","Turkey" :"TR"  };
        
        var options = d3.select("#countries").selectAll("option")
            .data(Object.values(countries_ext_name))
            .enter().append("option")
            .text(d => d);
    
        color_scale.domain([-17,17]);
        var percentages_lines =  [...new Set(data.map(d=> d.Percentage))];

        // console.log("First Color : ", color_scale(2));
        // console.log("Second Color : ", color_scale(3));


       linesChart.append("g")
       .attr("transform", "translate(0, " + (height_lines + margin_lines.top) +")")
       .attr("class", "x-axis");
       x_scale_years.domain(d3.extent(data, function(d){return d.Year;}).reverse());
       linesChart.selectAll(".x-axis").call(d3.axisBottom(x_scale_years).tickFormat(d3.format("")));
       
        linesChart.append("g")
        .attr("transform", "translate(" + margin_lines.left + ", " + margin_lines.top+")" )       
        .attr("class", "y-axis"); 
        y_scale_perc.domain([0, d3.max(percentages_lines) + 10]);
		linesChart.selectAll(".y-axis")
			.call(d3.axisLeft(y_scale_perc));

     // Create the paths
     var paths = [];
   
     countries_lines.forEach(function(d){ 
        var data_instances =  data.filter(elem => elem.Country == d);       
        var aux_array= [];
       
        data_instances.forEach(function(element){
            aux_array.push({'x' : x_scale_years(element.Year) , 'y': y_scale_perc(element.Percentage),
                            'Country': element.Country, 'Percentage': element.Percentage, 'Year': element.Year})       
        })
        
        paths.push(aux_array); 
    })
    // END create Paths
 
    // draw circles
    // 12. Appends a circle for each datapoint 
    linesChart.selectAll(".dot")
    .data(data)
    .enter().append("circle") // Uses the enter().append() method
    .on("mouseover", tip_lines.show)
    .on("mouseout", tip_lines.hide)
    .attr("class", "dot") // Assign a class for styling
    .attr("cx",  function(d) { return x_scale_years(d.Year)} )
    .attr("cy", function (d) { return y_scale_perc(d.Percentage) })
    .attr("fill","#ffab00")
    .attr("r", 4.5)
    
    // draw lines
    linesChart.append("g")
    .selectAll("path")
    .data(paths)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#efefef")
    // .attr("stroke", function(d){ return color_scale(countries_lines.indexOf(d[0].Country))})
    .attr("stroke-width", 1)
    .attr("d", d3.line().x(d => d.x).y(d => d.y))
      
     }

     ).catch(function(err){
     console.log(err);
 })