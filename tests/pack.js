// (function() {
//   'use strict'
var w = 650,
    h = 565,
    r = 500,
    x = d3.scale.linear().range([0, r]),
    y = d3.scale.linear().range([0, r]),
    node,
    root;

var clusters = ['people', 'places', 'organizations']

var pack = d3.layout.pack()
    .size([r, r])
    .padding(1)
    .value(function(d) {
        return d.children ? d.children.length : 1
        return Math.random() * 100;
        return d.size;
    });

function objectFindByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}

// var SELECT_NODE_BY = 'places'; //you can use places|people|organizations
pack.children(function(d) {
    if (!d.children) {
        // console.warn(d);
        return d
    }
    // if (d.children.length === 3 && d.name.indexOf('txt') !== -1) {
    //     var c = objectFindByKey(d.children, 'name', SELECT_NODE_BY);
    //     return c.children;
    // }
    return d.children;
});

var vis = d3.select("body").insert("svg:svg", "h2")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

d3.json("data/tree_structure-1991.json", function(data) {
// d3.json("data/test.json", function(data) {
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
            return d.x;
        })
        .attr("cy", function(d) {
            return d.y;
        })
        .attr("r", function(d) {
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

    vis.selectAll("text")
        .data(nodes)
        .enter().append("svg:text")
        .attr("class", function(d) {
            return d.children ? "parent" : "child";
        })
        .attr("x", function(d) {
            return d.x;
        })
        .attr("y", function(d) {
            return d.y;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("opacity", function(d) {
            return d.r > 20 ? 1 : 0;
        })
        .text(labelNode)

    d3.select(window).on("click", function() {
        zoom(root);
    });
});

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
    var k = r / d.r / 2;
    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);

    var t = vis.transition()
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
        .each("end", function(d, i) {
            updateCounter--;
            if (updateCounter == 0) {
                adjustLabels(k);
            }
        });

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
// });