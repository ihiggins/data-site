
var socket = io();

socket.on('connect', function(){
  console.log('connected to server');
});

socket.on('disconnect', function(){
  console.log('disconnected from server');
});

$( ".submit" ).click(function() {
  socket.emit('makeRequest', $('.url').val());
});

socket.on('run' , function(data){
  console.log(data);
  alert('invalid url');
});

socket.on('getTags' , function(items){



  // console.log('getTags' , data);

    var xNames = Object.keys(items);
    var yValues = [];
    for (var key of xNames) {
      yValues.push(items[key]);
    }
    var ctx = document.getElementById("myChart").getContext("2d");
    var myChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: xNames,
        datasets: [
          {
            data: yValues,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)"
            ],
            borderColor: [
              "rgba(255,99,132,1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)"
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        cutoutPercentage: 60,
        elements: {
          arc: {
            borderWidth: 12
          }
        },
        legend: {
          display: false
        },
        animation: {
          onComplete: function(animation) {
            if (!window.segmentHovered) {
              var value = this.config.data.datasets[0].data.reduce(function(
                a,
                b
              ) {
                return a + b;
              },
              0);
              var label = "T O T A L";
            }
          }
        }
      }
    });









});

socket.on('getTree' , function(data){

  console.log('tree' , data);

// http://bl.ocks.org/emmasaunders/5a3ec2a4dd08e12d87b4d3959df7d897 tree
  function diagonal(s, d) {
    return `M ${s.y} ${s.x}
        C ${(s.y + d.y) / 2} ${s.x},
        ${(s.y + d.y) / 2} ${d.x},
        ${d.y} ${d.x}`;
  }
  var _colors = ["#14393c", "#FBB03B", "#C04848", "#6c2b51", "#cc2b5e", "#753a88", "#321e99", "#00223E",
  "#00A8C5", "#005d6e", "#47bf8f", "#800080", "#FD732F", "#E4832A"],_colormap = {};
  function color(d) {
    if(typeof _colormap[d.data.type] == "undefined") {
      _colormap[d.data.type] = _colors.shift() || "black";
    }
    return _colormap[d.data.type];
  }
  function drawChart(json, minHeight) {
    var width  = window.innerWidth - 10,
        height = window.innerHeight;

    if(minHeight && height < minHeight) {
      height = minHeight;
    }

    // Prepare the tooltip
    var tip = d3.select("body")
      .append("div")
      .attr("class", "tip");

    tip.show = function(d){
      var posX = d3.event.pageX,
          posY = d3.event.pageY - 20; // right: -10

      var html = "",
          type = d.data.type;

      if(type) {
        html += "<u>" + type[0].toUpperCase() + type.substr(1).replace(/_/g, ' ') + "</u> : ";
      }
      html += d.data.name;
      tip.html(html);

      // Tooltip to the left if it gets out of the window
      var tipBox = tip.node().getBoundingClientRect();
      if(posX + tipBox.width > window.innerWidth) {
        posX -= tipBox.width + 10;
      } else {
        posX += 10;
      }
      tip.attr('style', `visibility: visible; left: ${posX}px; top: ${posY}px`);
    };
    tip.hide = function(){
      tip.style("visibility", "hidden");
    }

    // Append SVG
    var svg = d3.select(".tree").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(80,0)");

      var root = d3.hierarchy(json),
          tree = d3.tree().size([height, width -width/5]);
      tree(root);

      var glinks = svg.append("g").attr("class", "links"),
          gnodes = svg.append("g").attr("class", "nodes");

      var links = glinks.selectAll("path")
          .data(root.descendants().slice(1))
          .enter()
          .append("path")
          .attr("d", (d) => {
            return diagonal(d.parent, d);
          });

      var nodes = gnodes.selectAll("g")
          .data(root.descendants())
          .enter()
          .append("g")
          .attr("transform", (d) => `translate(${d.y}, ${d.x})`);

      nodes.append("circle")
          .filter((d) => d.data.name.length > 0)
          .attr("r", 4)
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide);

      nodes.append("text")
          .filter((d) => d.data.name.length > 0)
          .attr("dx", (d) => d.children ? -8 : 8)
          //.attr("id",function(d,i){ return "txt"+i; })
          .attr("dy", 3)
          .attr("text-anchor", (d) => d.children ? "end" : "start")
          .attr("style", (d) => {
            var css = "";

            if(d.data.weight && d.data.weight == 1) {
              css += "font-weight: bold;";
            }
            if(d.data.type && d.data.name) {
              css += "fill: " + color(d) + ";";
            }
            return css;
          })
          .text((d) => d.data.name)
          .call((selection) => {
            selection.each(function(d) { d.bbox = this.getBBox() })
          });

    nodes.insert("rect", "text")
      .filter((d) => d.data.name.length > 0 && d.children)
      .attr("x", (d) => -(8 + d.bbox.width))
      .attr("y", (d) => 8 - d.bbox.height)
      .attr("width", (d) => d.bbox.width)
      .attr("height", (d) => d.bbox.height);
  }
  var trees = {
    name: "Data",
    children:data
  };
  drawChart(trees, 600);

});
