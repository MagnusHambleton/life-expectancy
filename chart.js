//Simple d3.js barchart example to illustrate d3 selections

//other good related tutorials
//http://www.recursion.org/d3-for-mere-mortals/
//http://mbostock.github.com/d3/tutorial/bar-1.html


var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%d-%b-%y");

var x = d3.scaleTime()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var valueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

// var data1 = d3.tsv("data1.tsv", function(d) {
//     d.date = parseTime(d.date);
//     d.close = +d.close;
//     return d;
// })











d3.tsv("data.tsv", function(d) {
  d.date = parseTime(d.date);
  d.close = +d.close;
  return d;
}, function(error,firstdata){
    if (error) throw error;
    
    function move () 
    {
        //d3.selectAll('.line').transition().duration(500);
        d3.tsv("data1.tsv", function(d) {
            d.date = parseTime(d.date);
            d.close = +d.close;
            return d;
        }, function(data1){
            d3.selectAll('.line')
                .datum(data1).transition().duration(500)
                .attr('d',valueline)
        })

    }

    function move_back () 
    {
        d3.selectAll('.line')
            .datum(firstdata).transition().duration(500)
            .attr('d',valueline);
    }


  x.domain(d3.extent(firstdata, function(d) { return d.date; }));
  y.domain(d3.extent(firstdata, function(d) { return d.close; }));

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .style("text-anchor", "end")
      .text("Price ($)");

  g.append("path")
      .datum(firstdata)
      .attr("class", "line")
      .attr("d", valueline);
    
    d3.selectAll('.line')
        .style('fill','none')
        .attr('stroke','steelblue')


    //setup the svg
    var svg = d3.select("svg")

    //setup our ui
    d3.select("#data1")
        .on("click", function(d,i) {
            move()
        })   
    d3.select("#data2")
        .on("click", function(d,i) {
            move_back()
        })   

})


// })
// })
