//Simple d3.js barchart example to illustrate d3 selections

//other good related tutorials
//http://www.recursion.org/d3-for-mere-mortals/
//http://mbostock.github.com/d3/tutorial/bar-1.html

// var svg = d3.select("svg"),
//     margin = {top: 20, right: 20, bottom: 30, left: 50},
//     width = +svg.attr("width") - margin.left - margin.right,
//     height = +svg.attr("height") - margin.top - margin.bottom,
    

function move_circle () 
{
    d3.select('circle').transition().duration(500).attr("cx",500)
    d3.select('line').transition().duration(500)
        .attr("x1", 34)
        .attr("y1", 889)
        .attr("x2", 230)
        .attr("y2", 1)
        .attr("stroke-width", 4)
        .attr("stroke", "red");


}
function move_back () 
{
    d3.select('circle').transition().duration(500).attr("cx",50)
    d3.select('line').transition().duration(500)
        .attr("x1", 5)
        .attr("y1", 5)
        .attr("x2", 50)
        .attr("y2", 50)
        .attr("stroke-width", 2)
        .attr("stroke", "black");
}


function init()
{
    

    //setup the svg
    var svg = d3.select("svg")

    svg.append("circle")
        .attr('cx',50)
        .attr('cy',50)
        .attr('r',20)
        .style('fill','rgb(255,0,255)')

    svg.append("line")
        .attr("x1", 5)
        .attr("y1", 5)
        .attr("x2", 50)
        .attr("y2", 50)
        .attr("stroke-width", 2)
        .attr("stroke", "black");
    //setup our ui
    d3.select("#data1")
        .on("click", function(d,i) {
            move_circle()
        })   
    d3.select("#data2")
        .on("click", function(d,i) {
            move_back()
        })   
    // d3.select("#random")
    //     .on("click", function(d,i) {
    //         num = document.getElementById("num").value
    //         bars(random(num))
    //     })   


    //make the bars
}
