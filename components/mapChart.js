
// declare the const  variables
const mapChart_margin = { top:0 , left:0, bottom:30,right:0}
const mapChart_h = 0.6 * window.innerHeight - (mapChart_margin.top + mapChart_margin.bottom);
const mapChart_w = 0.3 * window.innerWidth - (mapChart_margin.left + mapChart_margin.right);

var codes ={ "Belgium" : "BE", "Germany": "DE", "Estonia":"EE","Greece":"EL","Spain":"ES",
"France":"FR" ,"Italy":"IT","Luxembourg": "LU","Hungary":"HU","Netherlands":"NL",
"Austria":"AT","Poland":"PL","Romania":"RO", "Finland":"FI","United Kingdom":"UK",
"Norway": "NO","Serbia":"RS","Turkey" :"TR" };

var countries_names = Object.values(Object.keys(codes));
console.log("Countries : ", countries_names);

var mapChart = d3.select("#svgMap").append("g")
     .attr('height', mapChart_h + mapChart_margin.top + mapChart_margin.bottom)
     .attr('width', mapChart_w + mapChart_margin.left + mapChart_margin.right )
	 .attr("transform", "translate(" + mapChart_margin.left + ", " + mapChart_margin.top + ")");

// Label : Idiom legend
var readingtime_title = mapChart.append("text")
.attr("x", (width + 10* 2)/ 2  - 135)
.attr("y", 20)
.attr("font-size", "18px")
.style("text-anchor", "middle")
.style("fill", "#AAA")
.text("Average Time Spent Reading");

// Tooltip
var map_tip = d3.tip().attr('class', 'd3-tip3')
    .html(function(d,i,json,m_data) {
		// var country_code = d.data.Country;
					// get the country name
			var country_name = json.features[i].properties.NAME;
			// get the country code
			var country_code = json.features[i].properties.ISO2;
			var country_obj = m_data.filter(d=> d.Country == country_code);
			var time_reading =  country_obj.length == 0 ? "No Data" : country_obj[0].Minutes + " minutes" ;
            var text = "<strong style='color:red'>Country:</strong> <span style='color:white;text-transform:capitalize'>" + country_name + "  </span><br>";
            text += "<strong>Avg Time:</strong> " +  time_reading + "</span><br>";
         return text;
	});

// Color list
var perc_map_color_scale = d3.scaleOrdinal().range(["#ffffff","#fff7ec","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"]);
var countryList = [];
var projection = d3.geoMercator() //utiliser une projection standard pour aplatir les pôles, voir D3 projection plugin
						.center([ 30, 60 ]) //comment centrer la carte, longitude, latitude
						.translate([ mapChart_w/2 + 150 , mapChart_h/2.7 ]) // centrer l'image obtenue dans le svg
						.scale([ mapChart_w/1.35])// zoom, plus la valeur est petit plus le zoom est gros
					.rotate([0,0,-2.7]);

//Define path generator
var geo_path = d3.geoPath().projection(projection);
var data_time_spend_reading ;
//
mapChart.call(map_tip);
// Load reading habits data
d3.json("content/data/time_spend_reading.json").then(function(data){
   data_time_spend_reading = data;
	var perc = [...new Set(data.map(function(d,i){return parseInt(d.Minutes);}))].sort(function(a, b){return a-b});
	var my_color = [0];
	
	perc.forEach(function(d){ my_color.push(d)})
	my_color = my_color.sort(function(a, b){return a-b});
	// console.log("PercColorScale : ", my_color);
	// console.log("PercColor : ", perc);
	perc_map_color_scale.domain( my_color);
	
	   for(var i= 0 ; i < my_color.length ; i++){
		   console.log("K : ", my_color[i]);
		   
		
		if(i == 0 ){
			mapChart.append("text")
			.attr("x", 65)
			.attr("y", 330)
			.attr("font-size", "12px")
			.style("text-anchor", "middle")
			.style("fill", "#AAA")
			.text("Time (minutes)");
		}

		mapChart.append("rect")
		.attr("x", 10 + i*30  )
		.attr("y", 355  )
		.attr("fill", perc_map_color_scale(my_color[i]))
		.attr("width", 30)
		.attr("height", 10);
		// add percentage 
		mapChart.append("text")
			.attr("y" , 350)
			.attr("x" , 25 + i*30)
			.style("text-anchor", "middle")
			.style("fill", "#AAA")
			.text(my_color[i])
			.style("font-size", "12px");		
}

}).catch(function(err){
	console.log("Error in loading time_spend_reading json file : ", err)
})

//Load in GeoJSON data
d3.json("content/data/us-10m.v1.json").then( function(json) {


	//Bind data and create one path per GeoJSON feature
	mapChart.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", geo_path)
		.on("mouseover", function(d,i){

			this.style["fill"]="rgba(8, 81, 156, 0.2)";

			// map_tip.show(d,i,json);
			map_tip.show(d,i,json,data_time_spend_reading);
			map_tip.style("left", (d3.event.pageX - 50) + "px")
            .style("top", (d3.event.pageY - 60) + "px");
		})
		.on("mouseout", function(d, i){ 
			var name = json.features[i].properties.NAME;
			var index =  countries_names.indexOf(name);
            
			if(index == - 1){
				// console.log("CurrentName : ", name);
				this.style["fill"] = perc_map_color_scale(0);
			}else{
				var name = codes[name];
				var aux = data_time_spend_reading.filter(function(d,i){ return d.Country == name});
				this.style["fill"] = perc_map_color_scale(parseInt(aux[0].Minutes));
			}
			
			map_tip.hide(d,i,json); })
		.on("click", function(d, i){
			 console.log( "LinesCharts : ", infoVis);
			var name = json.features[i].properties.NAME;
			
			// get the country to ma
			var code = json.features[i].properties.ISO2;
			var index = countryList.indexOf(name);
			if(index > -1){
				this.style["stroke"] = "#AAA";
				countryList.splice(index, 1);
			} else {
				infoVis.update(name, 750);
				countryList.push(name);
				this.style["stroke"]="rgba(1, 1, 1, 0.2)";
			}

			})

		.attr("stroke", "#AAA")
		.attr("fill", function(d,i){

			var name = json.features[i].properties.NAME;
			var index =  countries_names.indexOf(name);
            
			if(index == - 1){
				// console.log("CurrentName : ", name);
				return perc_map_color_scale(0);
			}else{
				 var name = codes[name];
				 var aux = data_time_spend_reading.filter(function(d,i){ return d.Country == name});
				 return perc_map_color_scale(parseInt(aux[0].Minutes));
			    }

		  })

		;

}).catch( function(err){
	console.log(err);
}
);





