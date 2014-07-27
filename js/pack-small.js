// (function() {
//   'use strict'
var w = 128,
    h = 128,
    r = Math.min(w, h) * .5,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([0, h]);

var years = [1981,1983,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2009,2010,2011,2012,2013];
// years = years.slice(0, 6)

var clusters = ['people', 'places', 'organizations']

var pack = d3.layout.pack()
    .size([w, h])
    .padding(1)
    .value(function(d) {
        return d.children ? d.children.length : 1
        return Math.random() * 100;
        return d.size;
    });

d3.select('body')
    .selectAll('svg')
    .data(years)
    .enter()
        .append('svg')
        .attr('id', function(d, i) { return 'chart-' + d })
        .attr("width", w)
        .attr("height", h)
        .each(function(d) {
            d3.json("data/hiv-" + d + ".json", renderChart)
        })

function renderChart(data) {
    var node, root;

    var year = data.children[0].name

    var vis = d3.select("#chart-" + year)
    .append("g")

    node = root = data;

    var nodes = pack.nodes(root);

    vis.selectAll("circle")
        .data(nodes)
        .enter().append("svg:circle")
        .attr("class", function(d) {
            var tmp = d.children ? "parent" : "child"
            if (clusters.indexOf(d.name) > -1) {
                tmp += ' ' + d.name
            }
            if (2 === d.depth) {
                tmp += ' document'
            }
            return tmp
        })
        .attr("cx", function(d) {
            if(!d) { console.error('renderChart wacky d'); return 0;}
            return d.x;
        })
        .attr("cy", function(d) {
            if(!d) { console.error('renderChart wacky d'); return 0;}
            return d.y;
        })
        .attr("r", function(d) {
            if(!d) { console.error('renderChart wacky d'); return 0;}
            return d.r;
        })
        // .style("fill", function(d, i) {
        //     switch(d.name) {
        //         case 'people': return '#c00';
        //         case 'places': return '#0c0';
        //         case 'organizations': return '#00c';
        //     }
        //     return '#eee'
        // })
        .on("click", function(d) {
            return zoom(node == d ? root : d);
        });

    vis.append("text")
        .text(data.children[0].name)
        .attr('dy', '1em')
        .style('stroke', '#fff')
        .style('stroke-width', 1.5)
        .style('stroke-opacity', 0.7)
        .style('fill', '#000')
        .style('fill-opacity', 0.3)
        .style('font-size', '55px')
        .style('font-weight', 'bold')


    // vis.selectAll("text")
    //     .data(nodes)
    //     .enter().append("svg:text")
    //     .attr("class", function(d) {
    //         return d.children ? "parent" : "child";
    //     })
    //     .attr("x", function(d) {
    //         return d.x;
    //     })
    //     .attr("y", function(d) {
    //         return d.y;
    //     })
    //     .attr("dy", ".35em")
    //     .attr("text-anchor", "middle")
    //     .style("opacity", function(d) {
    //         return d.r > 20 ? 1 : 0;
    //     })
    //     .text(labelNode)

    d3.select(window).on("click", function() {
        zoom(vis, root);
    });
}

function labelNode(d) {
    // console.log(d)
    switch(d.depth) {
        case 0:
        case 1:
        case 3: return '';
        case 2: return fileNameToDate(d.name);
        default: return d.name
    }
}

function fileNameToDate(f){
    // 91080707DN.txt
    // 1991  08 07
    // console.log(f)
    var y = f.slice(0,2)
    var m = f.slice(2,4)
    var d = f.slice(4,6)
    return [d, m, y].join('-')
};


function zoom(d, i) {
    if(!d) return console.error('ZOOM wacky d');
    var k = r / d.r / 2;
    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);

    var t = d.transition()
        .duration(d3.event.altKey ? 7500 : 750);

    t.selectAll("circle")
        .attr("cx", function(d) {
            return x(d.x);
        })
        .attr("cy", function(d) {
            return y(d.y);
        })
        .attr("r", function(d) {
            return k * d.r;
        });

    // updateCounter is a hacky way to determine when transition is finished
    var updateCounter = 0;

    t.selectAll("text")
        .style("opacity", 0)
        .attr("x", function(d) {
            return x(d.x);
        })
        .attr("y", function(d) {
            return y(d.y);
        })
        .each(function(d, i) {
            updateCounter++;
        })
        // .each("end", function(d, i) {
        //     updateCounter--;
        //     if (updateCounter == 0) {
        //         adjustLabels(k);
        //     }
        // });

    node = d;
    d3.event.stopPropagation();
}

function adjustLabels(k) {
    console.log('adjustLabels')
    vis.selectAll("text")
        .style("opacity", function(d) {
            return k * d.r > 20 ? 1 : 0;
        })
        .text(labelNode)
        // .text(function(d) {
        //     return d.name;
        // })
        .filter(function(d) {
            d.tw = this.getComputedTextLength();
            return (Math.PI * (k * d.r) / 2) < d.tw;
        })
        .each(function(d) {
            var proposedLabel = d.name;
            var proposedLabelArray = proposedLabel.split('');
            while ((d.tw > (Math.PI * (k * d.r) / 2) && proposedLabelArray.length)) {
                // pull out 3 chars at a time to speed things up (one at a time is too slow)
                proposedLabelArray.pop();
                proposedLabelArray.pop();
                proposedLabelArray.pop();
                if (proposedLabelArray.length === 0) {
                    proposedLabel = "";
                } else {
                    proposedLabel = proposedLabelArray.join('') + "..."; // manually truncate with ellipsis
                }
                d3.select(this).text(proposedLabel);
                d.tw = this.getComputedTextLength();
            }
        });
}
//TODO
// fix ln 149 error in console
// });