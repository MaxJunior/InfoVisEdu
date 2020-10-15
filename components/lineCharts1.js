const margin_lines = {top : 10 , right: 10 , bottom: 0 , left : 80 };
const height_lines = 0.3 * window.innerHeight - (margin_lines.top + margin_lines.bottom);
const width_lines = 0.49 * window.innerWidth - (margin_lines.left + margin_lines.right);

var list_selected_elements = [];

var color_scale = d3.scaleSequential(d3.interpolateYlOrRd);
var linesChart = d3.select("#svgLines").append("g")
    .attr('height', height_lines + margin_lines.top + margin_lines.bottom)
    .attr('width', width_lines + margin_lines.left + margin_lines.right );

    var tip_lines = d3.tip().attr('class', 'd3-tip2')
    .html(function(d) {
        var country_code = d.Country;
        var text = "<strong style='color:red'>Country:</strong> <span style='color:white;text-transform:capitalize'>" + countries_ext_name[country_code] + "</span><br>";
        text += "<strong>Percentage:</strong> <span>" +  d.Percentage + "%" + "</span><br>";
        text += "<strong>Year:</strong> <span>" +  d.Year  + "</span><br>";

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
      .attr("x", width_lines + margin_lines.left +  30)
      .attr("y", height_lines + margin_lines.top + 15)
      .style("fill", "#AAA")
      .text("Years");

    var countries_ext_name = {"BE": "Belgium","DE": "Germany","EE": "Estonia","EL": "Greece","ES": "Spain",
      "FR": "France" ,"IT": "Italy","LU": "Luxembourg","HU": "Hungary","NL": "Netherlands",
      "AT": "Austria","PL": "Poland","RO": "Romania","FI": "Finland","UK": "United Kingdom",
      "NO" : "Norway","RS": "Serbia","TR": "Turkey"  };
    var codes ={ "Belgium" : "BE", "Germany": "DE", "Estonia":"EE","Greece":"EL","Spain":"ES",
      "France":"FR" ,"Italy":"IT","Luxembourg": "LU","Hungary":"HU","Netherlands":"NL",
      "Austria":"AT","Poland":"PL","Romania":"RO", "Finland":"FI","United Kingdom":"UK",
      "Norway": "NO","Serbia":"RS","Turkey" :"TR"  };
      var current_dataset ;

      var infoVis,select;
    d3.json("content/data/early_leaver.json").then(function(data){

        var current_dataset = data;
      infoVis = new InitLineChart(current_dataset);
    //   update(d3.select("#countries").property("value"), 0);
      infoVis.update(d3.select("#countries").property("value"), 0);
      select = d3.select("#countries").on("change", function() { infoVis.update(this.value, 750)});

    }).catch(function(err){
     console.log(err);
 })

  function InitLineChart(data){
              this.data = data;
             
              this.paths = [];
              this.lines ;
              this.options = d3.select("#countries").selectAll("option")
                  .data(Object.values(countries_ext_name))
                  .enter().append("option")
                  .text(d => d);

              color_scale.domain([-17,17]);
              this.percentages_lines =  [...new Set(this.data.map(d=> d.Percentage))];

             linesChart.append("g")
             .attr("transform", "translate(0, " + (height_lines + margin_lines.top) +")")
             .attr("class", "x-axis");
             x_scale_years.domain(d3.extent(this.data, function(d){return d.Year;}).reverse());
             linesChart.selectAll(".x-axis").call(d3.axisBottom(x_scale_years).tickFormat(d3.format("")));

              linesChart.append("g")
              .attr("transform", "translate(" + margin_lines.left + ", " + margin_lines.top+")" )
              .attr("class", "y-axis");
              y_scale_perc.domain([0, d3.max(this.percentages_lines) + 10]);
              linesChart.selectAll(".y-axis")
                  .call(d3.axisLeft(y_scale_perc));



  }


InitLineChart.prototype.update = function (input, speed) {
    // console.log("Selected: ", codes[input]);
    var countryCode = codes[input];
    var paths=[];
    // console.log("IS  : list_selected_elements :",list_selected_elements);
    // check if is the initial setting (no country selected,add the 1st country)
    if(list_selected_elements.length == 0){
        // console.log(" Waba ta shi");
        list_selected_elements.push(countryCode);
    }
    // otherwise
    else{
        console.log("Current List of selected Elements : ", list_selected_elements);
        // if country is not already been selected in the last 3
        if(!list_selected_elements.includes(countryCode) ){
            // the list in is maximum capacity remove the first added element
            //     (wich given room to one more country)
            if(list_selected_elements.length == 3){

                list_selected_elements = list_selected_elements.slice(1,3);

            }
            list_selected_elements.push(countryCode);
            //  console.log("Current_List : ", list_selected_elements);
        }

    }
    // get the data of the selected countries
    current_dataset =  this.data.filter(elem => list_selected_elements.includes(elem.Country) == true);
    // get the percentage values in the
    percentages_lines =  [...new Set(current_dataset.map(d=> d.Percentage))];
    // get the y_scale percentage
    y_scale_perc.domain([0, d3.max(percentages_lines) +  10]);

    linesChart.selectAll(".y-axis").exit().remove();

    linesChart.selectAll(".y-axis").transition().duration(speed)
    .call(d3.axisLeft(y_scale_perc));
    this.paths = [];
    // console.log(" The current dataset : ",  current_dataset);
    list_selected_elements.forEach( function(d){
      var aux_array = [];
      var cur_country_dataset = current_dataset.filter(el => el.Country == d);
      // console.log(" The current element : ",d );
      cur_country_dataset.forEach(function(element){
      aux_array.push({x : x_scale_years(element.Year) , y: y_scale_perc(element.Percentage),
            'Country': element.Country, 'Percentage': element.Percentage, 'Year': element.Year})

    })
    console.log("Current Array : ", aux_array);
    paths.push(aux_array);
    console.log("Paths : ... ", this.paths);
    })
// }
   // console.log("Current paths : ",paths);

// dots
linesChart.selectAll(".dot").remove();

var dots =  linesChart.selectAll(".dot").data(current_dataset).attr("class","line");
dots.enter().append("circle") // Uses the enter().append() method
.on("mouseover", tip_lines.show)
.on("mouseout", tip_lines.hide)
.attr("class", "dot") // Assign a class for styling
.attr("cx",  function(d) { return x_scale_years(d.Year)} )
.attr("cy", function (d) { return y_scale_perc(d.Percentage) })
.attr("fill","#ffab00")
.attr("r", 4.5);



// remove any previously drawn lines
linesChart.selectAll(".line").remove();
 console.log("My paths : ", this.paths);
// draw new lines
 const lines = linesChart.selectAll(".line")
.data(paths)
    .attr("class", "line");

// enter and append these lines
 lines.enter().append("path")
     .transition().duration(speed*2)
     .attr("fill", "none")
     .attr("class", "line")
     .attr("d",d3.line().x(d => d.x).y(d => d.y))
     .attr("stroke", "#efefef");

// my_paths.exit().remove();
   paths=[];
// console.log(" My group of lines : ", linesChart.selectAll(".lines"));
}


