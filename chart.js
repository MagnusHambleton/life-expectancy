
var svg = d3.select('#graph'),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var x = d3.scaleLinear()
        .rangeRound([0, width]);

var y = d3.scaleLog()
    .rangeRound([height, 0]);

var valuelinecheck = d3.line()
    .x(function(d) { return x(d.age); })
    .y(function(d) { return y(d.prob); });

var data_length=24;

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

// find closest num in array (used in finding closest matching age for slider)
function closest(array,num){
    var i=0;
    var minDiff=1000;
    var ans;
    for(i in array){
         var m=Math.abs(num-array[i]);
         if(m<minDiff){ 
                minDiff=m; 
                ans=array[i]; 
            }
      }
    return ans;
}

d3.csv("Agedata.csv", function(d) {
  d.age = +d.age;
  d.ext = +d.ext;
  d.circ=+d.circ;
  d.canc=+d.canc;
  return d;
}, function(error,firstdata){
    if (error) throw error;

    d3.selectAll('.checkbox').on('change',update);

    function update ()
    {

        var labels=d3.keys(firstdata[0]);

        // get which checkboxes are ticked
        var include_var ={};
        for(i=1; i<labels.length;i++){
            include_var[labels[i]]=d3.select('.'+labels[i]).property('checked');
        }

        var stop_ageing =d3.select(".ageing").property('checked');

        var age_stop_ageing = closest(firstdata.map(function(d) {return d.age;}),Math.ceil(x_slider.invert(handle.attr('cx'))));

        // add all the causes together and find the age
        var ydata=firstdata.map(function(d) { 
            var sums=0;
            for(i=1; i<labels.length-1;i++){
                sums=sums+d[labels[i]]*include_var[labels[i]];
            }
            return {age: d.age, prob: sums}; 
        });
        if(stop_ageing) {
            var past_age = false;
            for(i=1; i<data_length; i++) {
                if(ydata[i-1].age==age_stop_ageing){
                    past_age = true;
                }
                if(past_age) {
                    ydata[i].prob=ydata[i-1].prob;

                }
            }
        }
        d3.selectAll('.line')
            .datum(ydata).transition().duration(500)
            .attr('d',valuelinecheck);

        // x.domain(d3.extent(ydata, function(d) { return d.age; }));
        // y.domain(d3.extent(ydata, function(d) { return d.prob; }));

        // d3.select(".axis--x").call(d3.axisBottom(x));
        // d3.select(".axis--y").transition().duration(500).call(d3.axisLeft(y));

        d3.selectAll('.line')
            .datum(ydata).transition().duration(500)
            .attr('d',valuelinecheck);
        var [average_age,median_age]=calculate_ages(ydata);
        update_numbers(average_age,median_age)

    }

    function calculate_ages(s) 
    {
        var d=s
        for(i=data_length; i<1000; i++) {
            var new_age=d[i-1].age+2;
            var new_prob=Math.min(d[i-1].prob+(d[20].prob-d[19].prob)/(d[20].age-d[19].age)*(new_age-d[i-1].age),1)
            d[i]={age: new_age,prob:new_prob}
        }
        var people_alive=100;
        var people_dead=0;
        var life=0;
        var median_needed=true;
        for(i=0; i<1000; i++) {
            if(i==0) {
                people_dead=d[i].prob*people_alive;
            } else {
                people_dead=people_alive - people_alive*Math.pow((1-d[i].prob),(d[i].age-d[i-1].age));
            }
            life+=people_dead*d[i].age;
            people_alive=people_alive-people_dead;
            if(people_alive<50 && median_needed) {
                median_age=d[i-1].age+(d[i].age-d[i-1].age)*(people_alive+people_dead-50)/(people_dead);
                median_needed=false;
            }
        }
        var average_age=life/100;
        if(people_alive>50) {
            average_age=0;
            median_age=0;
        }
        return [average_age,median_age];
    }

    ///// SLIDER ///

    // to-do: work out why this fucking slider is not centering in the box
    var slidersvg = d3.select("#slider");

    var x_slider = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width])
        .clamp(true);

    var slider = slidersvg.append("g")
        .attr("class", "slider")
        .attr('text-anchor','center')
        .attr("transform", "translate(" + margin.left + "," + d3.select('#slider').attr('height')/2 + ")");

    slider.append('text')
        .attr('id','age')
        .attr("y", -20)
        .attr("x", width/2)
        .attr("fill", "#000")
        .attr('font-size',40);


    slider.append("line")
        .attr("class", "track")
        .attr("x1", x_slider.range()[0])
        .attr("x2", x_slider.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() { update_age(Math.ceil(x_slider.invert(d3.event.x))); }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
      .data(x_slider.ticks(10))
      .enter().append("text")
        .attr("x", x_slider)
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
          return function(t) {update_age(format(i(t))); };
        });

    function update_age(h) {
        handle.attr("cx", x_slider(h));
        d3.select('#age')
        .text(h);
        update();
    }

    // set up axes to start off with (same code as inside "update()"" function

    var labels=d3.keys(firstdata[0]);

    var include_var ={};
    for(i=1; i<labels.length;i++){
        include_var[labels[i]]=d3.select('.'+labels[i]).property('checked');
    }

    var tempdata=firstdata.map(function(d) { 
        var sums=0;
        for(i=1; i<labels.length-1;i++){
            sums=sums+d[labels[i]]*include_var[labels[i]];
        }
        return {age: d.age, prob: sums}; 
    });

    x.domain(d3.extent(tempdata, function(d) { return d.age; }));
    y.domain(d3.extent(tempdata, function(d) { return d.prob; }));

    d3.select(".axis--x").call(d3.axisBottom(x))
    d3.select(".axis--y").call(d3.axisLeft(y))

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    .append("text")
       .attr("fill", "#000")
       .attr("x", width)
       .attr('y',-5)
    //   .attr("dx", width)
       .style("text-anchor", "end")
       .text("Age");

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).tickFormat(d3.format('.2%')))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .style("text-anchor", "end")
      .text("Probability of death per year");




    // draws line
    g.append("path")
      .datum(tempdata)
      .attr("class", "line")
      .attr("d", valuelinecheck);
    update();

    d3.selectAll('.line')
        .style('fill','none')
        .attr('stroke','#000000')
        .attr('stroke-width',3)

    //setup the svg
    //var svg = d3.select("svg")

})

var average=154;
var median=85
var bignumbersize = height/2+'px';

var svg=d3.select('.numbers')

var bigweight=800;
var smallweight=600;

svg.append('text')
    .attr("y", height/10)
    .attr("x", 0)
    .text('Average:')
    .attr('font-size',height/10+'px')
    .attr('font-weight',smallweight);

svg.append('text')
    .attr('id','average')
    .attr("y", height/2)
    .attr("x", 0)
    .text(average)
    .attr('font-size',bignumbersize)
    .attr('font-weight',bigweight);

svg.append('text')
    .attr("y", height*6/10)
    .attr("x", 0)
    .text('Median:')
    .attr('font-size',height/10+'px')
    .attr('font-weight',smallweight);

svg.append('text')
    .attr('id','median')
    .attr("y", height)
    .attr("x", 0)
    .text(median)
    .attr('font-size',bignumbersize)
    .attr('font-weight',bigweight);




// })
// })
