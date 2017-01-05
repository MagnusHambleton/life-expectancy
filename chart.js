
var svg = d3.select("svg"),
    margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//var parseTime = d3.timeParse("%d-%b-%y");

var x = d3.scaleLinear()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var valueline = d3.line()
    .x(function(d) { return x(d.Age); })
    .y(function(d) { return y(d.ext); });

var valueline2 = d3.line()
    .x(function(d) { return x(d.Age); })
    .y(function(d) { return y(d.circ); });

function update_numbers(num1,num2) {
    var format = d3.format(",d");
    d3.select('#average')
        .transition()
        .duration(500)
        .tween("text", function() {
            var that = d3.select(this),
                i = d3.interpolateNumber(that.text(), num1);
            return function(t) { that.text(format(i(t))); };
          })
    d3.select('#median')
        .transition()
        .duration(500)
        .tween("text", function() {
            var that = d3.select(this),
                i = d3.interpolateNumber(that.text(), num2);
            return function(t) { that.text(format(i(t))); };
          })
}

d3.csv("Agedata.csv", function(d) {
  d.age = +d.Age;
  d.ext = +d.ext;
  d.canc=+d.circ;
  return d;
}, function(error,firstdata){
    if (error) throw error;
    
    function move () 
    {
        // firstdata.forEach(function(d) {
        //     d.date = parseTime(d.date);
        //     d.close = +d.close-1;
        // });
        d3.selectAll('.line')
            .datum(firstdata).transition().duration(500)
            .attr('d',valueline2)
            // debugger

    }

    function move_back () 
    {
        d3.selectAll('.line')
            .datum(firstdata).transition().duration(500)
            .attr('d',valueline);
    }


  x.domain(d3.extent(firstdata, function(d) { return d.age; }));
  y.domain(d3.extent(firstdata, function(d) { return d.circ; }));

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    .append("text")
       .attr("fill", "#000")
       .attr("x", width)
    //   .attr("dx", width)
       .style("text-anchor", "end")
       .text("Age");

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .style("text-anchor", "end")
      .text("Probability of death (% per year)");

  g.append("path")
      .datum(firstdata)
      .attr("class", "line")
      .attr("d", valueline);
    
    d3.selectAll('.line')
        .style('fill','none')
        .attr('stroke','#000000')
        .attr('stroke-width',3)

    //setup the svg
    var svg = d3.select("svg")

    //setup our ui
    d3.select("#data1")
        .on("click", function(d,i) {
            move()
            update_numbers(72,65);
        })   
    d3.select("#data2")
        .on("click", function(d,i) {
            move_back()
            update_numbers(154,85);
        })   

})

var average=154;
var median=85
var bignumbersize = height/2+'px';

var svg=d3.select('.numbers')

svg.append('text')
    .attr("y", height/10)
    .attr("x", 0)
    .text('Average:')
    .attr("fill", "#000")
    .attr('font-size',height/10+'px');

svg.append('text')
    .attr('id','average')
    .attr("y", height/2)
    .attr("x", 0)
    .text(average)
    .attr("fill", "#000")
    .attr('font-size',bignumbersize);

svg.append('text')
    .attr("y", height*6/10)
    .attr("x", 0)
    .text('Median:')
    .attr("fill", "#000")
    .attr('font-size',height/10+'px');

svg.append('text')
    .attr('id','median')
    .attr("y", height)
    .attr("x", 0)
    .text(median)
    .attr("fill", "#000")
    .attr('font-size',bignumbersize);


var slidersvg = d3.select(".slider");

var xs = d3.scaleLinear()
    .domain([0, 180])
    .range([0, width])
    .clamp(true);

var slider = slidersvg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

slider.append('text')
    .attr('id','age')
    .attr("y", 0)
    .attr("x", 0)
    .attr("fill", "#000")
    .attr('font-size',bignumbersize);


slider.append("line")
    .attr("class", "track")
    .attr("x1", xs.range()[0])
    .attr("x2", xs.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() { update_age(Math.ceil(xs.invert(d3.event.x))); }));

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
  .data(xs.ticks(10))
  .enter().append("text")
    .attr("x", xs)
    .attr("text-anchor", "middle")
    .text(function(d) { return d; });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

var format = d3.format(",d");

slider.transition() // Gratuitous intro!
    .duration(750)
    .tween("text", function() {
      var i = d3.interpolate(0, 70);
      return function(t) { update_age(format(i(t))); };
    });

function update_age(h) {
    handle.attr("cx", xs(h));
    d3.select('#age')
    .text(h);
}

// })
// })
