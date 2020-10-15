const DISTANCE_MAX = 77.82;
const DISTANCE_MIN = 0.04;
const DIAMETER_MAX = 495;
const DIAMETER_MIN = 1.65;
const VELOCITY_MAX = 38.6;
const VELOCITY_MIN = 1;
const IMPACT_PROBABILITY_MAX = 0.96;
const IMPACT_PROBABILITY_MIN = 1.2e-9;
const HAZARD_SCALE_MAX = -1.4;
const HAZARD_SCALE_MIN = -11.4;
let AVERAGE_NEO = null;
let DATA = null;
activeFilters = ['dmg-1','dmg-2'];
styleActiveClass = 'nice-button-active';
const svg = d3.select("#svgId");

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

function activateFilterBtns() {
    var btns = $(".filterbtn");
    for(i = 0; i < btns.length;i++){
        var button  = $(btns[i]);
        if(activeFilters.includes(button.val())){
            button.addClass(styleActiveClass);  
        }
        else{
            button.removeClass(styleActiveClass);
        }
    }
}

function removeOtherFilters(currFilter){
    var str = currFilter.split("-")[0];
    for(i = activeFilters.length - 1; i >= 0;i--){
        if(activeFilters[i].split("-")[0] != str){
            activeFilters.splice(i,1);
        }
    }
    
}

function fileFromFilters(){
    activeFilters.sort();
    var file ="content/data/";
    if(activeFilters.length == 0){
        return file += 'neos.json';
    }
    var folder = activeFilters[0].split('-')[0]; + "/";
    file += folder + "/";
    for(i = 0; i < activeFilters.length;i++){
        file += activeFilters[i] + '&';
    }
    file = file.slice(0,-1);
    return (file + '.json');
}

$(document).ready(function(){
    activateFilterBtns();
    loadCharts(fileFromFilters());
    $(".nice-button").click(function(){
       var item = $(this);
       var filter = item.val();
       if(item.hasClass(styleActiveClass)){
           item.removeClass(styleActiveClass);
           activeFilters.splice(activeFilters.indexOf(filter),1);
           //remove filter
       }
       else{
           item.addClass(styleActiveClass);
           removeOtherFilters(filter);
           activeFilters.push(filter);
           //add filter
       }
       loadCharts(fileFromFilters(),true);
       activateFilterBtns();
       
    });
});


 
function loadCharts(data,update=false){
    if(update){
        svg.selectAll("*").remove();
    }
    d3.json("content/data/example.json", function(error, graph) {
    if (error) throw error;
    DATA = graph;
    let distanceSum = 0;
    let diameterSum = 0;
    let velocitySum = 0;
    let impactProbabilitySum = 0;
    let hazardScaleSum = 0;

    for( var i = 0; i < graph.length; i++ ){
        distanceSum += graph[i].distance;
        diameterSum += graph[i].diameter;
        velocitySum += graph[i].velocity;
        impactProbabilitySum += graph[i].impactProbability;
        hazardScaleSum += graph[i].hazardScale;
    }
    AVERAGE_NEO = {
        name: 'Average NEO',
        distance: distanceSum/graph.length,
        diameter: diameterSum/graph.length,
        velocity: velocitySum/graph.length,
        impactProbability: impactProbabilitySum/graph.length,
        hazardScale: hazardScaleSum/graph.length,
    }
    initOrbitalLayout();
    initRadarChart();
    });
}
 