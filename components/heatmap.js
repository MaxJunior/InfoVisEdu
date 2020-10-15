//svgHeatmap
var countries_ext_name = {"BE": "Belgium","DE": "Germany","EE": "Estonia","EL": "Greece","ES": "Spain",
"FR": "France" ,"IT": "Italy","LU": "Luxembourg","HU": "Hungary","NL": "Netherlands",
"AT": "Austria","PL": "Poland","RO": "Romania","FI": "Finland","UK": "United Kingdom",
"NO" : "Norway","RS": "Serbia","TR": "Turkey"  };


const initHeatMap = (data) => {
    const margin = {top : 10 , right: 10 , bottom: 30, left : 50 };
    const height = 0.4 * window.innerHeight - (margin.top + margin.bottom);
    const width = 0.3 * window.innerWidth - (margin.left + margin.right);

    var tip_heatmap = d3.tip().attr('class', 'd3-tip2')
    .html(function(el,target,country,perc,curr_year) {
        var text = "<strong style='color:red;font-size:14px'>Country:</strong> <span style='color:white;text-transform:capitalize;font-size:14px'>" + country + "</span><br>";
        text +=    "<strong style='font-size:14px'>Perc:</strong> <span  style='font-size:14px'>" +  (perc!= 0 ? perc + "%" : "No Data")  + "</span><br>";
        text +=    "<strong style='font-size:12px'>Year:</strong> <span  style='font-size:14px'>" +  curr_year   + "</span><br>";
        return text;
    });


    var heatmap_svg= d3.select("#svgHeatmap").append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top  +")")
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width  + margin.left + margin.right);


        var perc_color_scale = d3.scaleSequential(d3.interpolateYlGnBu);
        var perc_by_country = [];
        var perc_filtered = []
        // add tooltip to svg idiom
        heatmap_svg.call(tip_heatmap);

        countries = [...new Set(data.map(function(d){return d.Country;}))]
        years = [...new Set(data.map(function(d){return d.Year;}))]
        var perc_list = data.map(c =>  c.Percentage);
        var min_perc =  d3.min(perc_list);
        var max_perc = d3.max(perc_list);
        perc_color_scale.domain([Math.floor(min_perc), Math.ceil(max_perc)]);
        
        for(var i= 0 ; i < countries.length; i++){
            var current_country = countries[i];
            var elements = data.filter(function(d){ return d.Country == current_country; })
            perc_by_country.push(elements.reverse());
            if(i == 0){
                // console.log(perc_by_country[0]);
            }
        }
        perc_filtered = [...new Set(data.map(d => d.Percentage))].sort();
   
        

        // console.log("All : " , perc_by_country);
        // console.log("Perc_Filtered : ", perc_filtered);



        function getListIndex(x){
            return (x + 10)/ 26;
        }
        
        function getElementIndex(y){
            return (y - 90)/32; 
        }





        var y_scale = d3.scaleLinear().range([height - 10,30]);
        var countries_scale = d3.scaleBand().range([width -20,20]);


        // #2 load the data from external file
        var countries, years ;
        // var percentage_by_year = [];
        countries = [...new Set(data.map(function(d){return d.Country;}))]
        years = [...new Set(data.map(function(d){return d.Year;}))]

        var init_y = 90;
        // console.log(perc_by_country);
        for(var i= 0 ; i < 18; i++){

          // add Years in the beginning of each rows
          if( i == 0){
            heatmap_svg.append("text")
            .attr("y" , init_y + 16  )
            .attr("x" ,  i*26 - 32 )
            .style("text-anchor", "middle")
            .style("fill", "#AAA")
            .text( 2017)

            heatmap_svg.append("text")
            .attr("y" , init_y + 2*25  )
            .attr("x" ,  i*26 - 32 )
            .style("text-anchor", "middle")
            .style("fill", "#AAA")
            .text( 2016)

            heatmap_svg.append("text")
            .attr("y" , init_y + 3*28  )
            .attr("x" ,  i*26 -32 )
            .style("text-anchor", "middle")
            .style("fill", "#AAA")
            .text( 2015)
          }
            for (var j = 0 ; j < 3 ; j++){
                var el = perc_by_country[i][j];

                heatmap_svg.append("rect")
                // .data(perc_by_country[i][j])
                .attr("x", i*26 - 10)
                .attr("y", init_y + j*32 )
                .attr("fill", perc_color_scale(perc_by_country[i][j].Percentage))
                .attr("width", 25)
                .attr("height", 30)

                .on("mouseover",function(){
                    // console.log("This", this.attributes);
                    var current_x  = parseInt(this.attributes[0].value);
                    var current_y  = parseInt(this.attributes[1].value);
                    var i_index = getListIndex(current_x);
                    var j_index = getElementIndex(current_y);
                    var country_code = perc_by_country[i_index][j_index].Country;
                    var country_perc = perc_by_country[i_index][j_index].Percentage;
                    var curr_year =   perc_by_country[i_index][j_index].Year;
                    // countries_ext_name
                    // console.log("Country :" + country_code + ",Perc : " + country_perc + "Year : " + curr_year);
                    tip_heatmap.show(el,d3.select(this),countries_ext_name[country_code], country_perc,curr_year)})
                .on("mouseout", tip_heatmap.hide);
               // add Country distict in the columns
                if(j==0){
                    heatmap_svg.append("text")
                    .attr("y" , init_y + j*32 - 10 )
                    .attr("x" ,  i*26 + 2.5 )
                    .style("text-anchor", "middle")
                    .style("fill", "#AAA")
                    .text( perc_by_country[i][j].Country)
                }
            }
      }

      heatmap_svg.append("text")
    //   .attr("transform", "rotate(-90)")
      // .attr("class", "axisText")
      .attr("y", margin.top)
      .attr("x", (width +  margin.left + margin.right)/2  + 15)
      .attr("dy", "1em")
      .attr("font-size", "18px")
      .style("text-anchor", "middle")
      .style("fill", "#AAA")
      .text("Expenditure in Books and Newspapers");
      
      heatmap_svg.append("text")
      .attr("y", margin.top + 20)
      .attr("x", (width +  margin.left + margin.right)/2  + 25)
      .attr("dy", "1em")
      .attr("font-size", "12px")
      .style("text-anchor", "middle")
      .style("fill", "#AAA")
      .text("by percentage of Household Income");
         

    // add legends
    for(var i= 0 ; i < 12; i++){
                heatmap_svg.append("rect")
                .attr("x",  i*39 - 10  )
                .attr("y", init_y*2 + 35  )
                .attr("fill", perc_color_scale(perc_filtered[i]))
                .attr("width", 38)
                .attr("height", 10);

                // add percentage 
                heatmap_svg.append("text")
                    .attr("y" , init_y*2 + 25 )
                    .attr("x" ,   i*39 + 6.5 )
                    .style("text-anchor", "middle")
                    .style("fill", "#AAA")
                    .text(perc_filtered[i] + "%" )
                    .style("font-size", "12px")
                
    }

}

d3.json("content/data/book_expenditure.json").then(function(data){
    data.forEach(function(d){
        d.Percentage = +d.Percentage;
    })
    // console.log(data);

    initHeatMap(data);
 }).catch(function(err){
     console.log(err);
 })



