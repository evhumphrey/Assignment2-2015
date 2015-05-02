var margin = {top: 20, right: 20, bottom: 100, left: 40};
    width = 960 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;


var padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 12;
/*
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<img src=" +d.images.low_resolution.count">";
}); */

d3.json('/igselfphotosasync', function(error, data) {
  console.log(data);

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    console.log(d);
    return "<img src=" + data.users[d.index].images.thumbnail.url +">" + "<br># of Likes: <span style='color:pink'>"  + data.users[d.index].likes.count +"</span>";
});

  var image = data.users.map(function(item) {
        return item;
      });
/*
d3.json('/igMediaCount', function(d) {
      console.log("photos: " + d.photocount);
      return d.photocount;
});
*/

var n = data.photocount;

    m = 10; // number of distinct clusters

var color = d3.scale.category10()
    .domain(d3.range(m));

// The largest node for each cluster.
var clusters = new Array(m);
//r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,

var nodes = d3.range(n).map(function() {
  var i = Math.floor(Math.random() * m),
      r = 100 / data.photocount,
      d = {cluster: i, radius: r}
  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
  return d;
});

// Use the pack layout to initialize node positions.
d3.layout.pack()
    .sort(null)
    .size([width, height])
    .children(function(d) { return d.values; })
    .value(function(d) { return d.radius * d.radius; })
    .nodes({values: d3.nest()
      .key(function(d) { return d.cluster; })
      .entries(nodes)});

var force = d3.layout.force()
    .nodes(nodes)
    .size([width, height])
    .gravity(.02)
    .charge(0)
    .on("tick", tick)
    .start();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.call(tip);

var node = svg.selectAll("circle")
    .data(nodes)
  .enter().append("circle")
    .style("fill", function(d) { return color(d.cluster); })
    .call(force.drag)
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
   

node.transition()
    .duration(750)
    .delay(function(d, i) { return i * 5; })
    .attrTween("r", function(d) {
      var i = d3.interpolate(0, d.radius);
      return function(t) { return d.radius = i(t); };
    });

function tick(e) {
  node
      .each(cluster(10 * e.alpha * e.alpha))
      .each(collide(.5))
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

// Move d to be adjacent to the cluster node.
function cluster(alpha) {
  return function(d) {
    var cluster = clusters[d.cluster];
    if (cluster === d) return;
    var x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;
    if (l != r) {
      l = (l - r) / l * alpha;
      d.x -= x *= l;
      d.y -= y *= l;
      cluster.x += x;
      cluster.y += y;
    }
  };
}

// Resolves collisions between d and all other circles.
function collide(alpha) {
  var quadtree = d3.geom.quadtree(nodes);
  return function(d) {
    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}
});
/*
d3.json('/igselfphotosasync', function(error, data) {
  console.log(data.photocount);
})
/*
//get json object which contains media counts
d3.json('/igselfphotos', function(error, data) {


  //set domain of x to be all the usernames contained in the data
  scaleX.domain(data.users.map(function(d) { return d.username; }));
  //set domain of y to be from 0 to the maximum media count returned
  scaleY.domain([0, d3.max(data.users, function(d) { return d.counts.media; })]);

  //set up x axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")") //move x-axis to the bottom
    .call(xAxis)
    // .selectAll("text")  
    // .style("text-anchor", "end")
    // .attr("dx", "-.8em")
    // // .attr("dy", ".15em")
    // .attr("transform", function(d) {
    //   return "rotate(-20)" 
    // });

  //set up y axis
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Number of Photos");

  //set up bars in bar graph
  svg.selectAll(".bar")
    .data(data.users)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return scaleX(d.username); })
    .attr("width", scaleX.rangeBand())
    .attr("y", function(d) { return scaleY(d.counts.media); })
    .attr("height", function(d) { return height - scaleY(d.counts.media); })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);



  d3.select("#sort").on("change", change);
  /*
  var sortTimeout = setTimeout(function() {
    d3.select("#sort").property("checked", true).each(change);
  }, 2000);
  */
/*
  function change() {
    //clearTimeout(sortTimeout);

    // Copy-on-write since tweens are evaluated after a delay.
    var x0 = scaleX.domain(data.users.sort(this.checked
        ? function(a, b) { return b.counts.media - a.counts.media; }
        : function(a, b) { return d3.ascending(a.username, b.username); })
        .map(function(d) { return d.username; }))
        .copy();

    svg.selectAll(".bar")
        .sort(function(a, b) { return x0(a.username) - x0(b.username); });

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("x", function(d) { return x0(d.username); });

    transition.select(".x.axis")
        .call(xAxis)
      .selectAll("g")
        .delay(delay);
  }

}); */