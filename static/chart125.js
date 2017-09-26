function draw_chart(pos_per,n_per,neg_per)
{
// Create data array of values to visualize
var dataArray = [pos_per, n_per, neg_per];

// Create variable for the SVG
var svg = d3.select("#p").append("svg")
          .attr("height","290px")
          .attr("width","500px")
          .attr("id","s");

// Select, append to SVG, and add attributes to rectangles for bar chart
svg.selectAll("rect")
    .data(dataArray)
    .enter().append("rect")
          .attr("class", function (d, i) {return "bar"+ i.toString()})
          .attr("height", function(d, i) {return (d * 2)})
          .attr("width","100")
          .attr("x", function(d, i) {return (i * 130) + 60})
          .attr("y", function(d, i) {return 400 - (d * 2) - 140 });

// Select, append to SVG, and add attributes to text
svg.selectAll("text")
    .data(dataArray)
    .enter().append("text")
    .text(function(d) {return d.toString() + "%"})
           .attr("class", "text")
           .attr("x", function(d, i) {return (i * 130) + 85})
           .attr("y", function(d, i) {return 415 - (d * 2) - 167 });
}
           