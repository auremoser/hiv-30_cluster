(function() {
  'use strict'
    var w = 1024,
        h = 704,
        r = Math.min(w, h) * .5,
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]);

    var node, root, vis;

    var vis = d3.select("body").insert("svg:svg", "h2")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

        // w = 128,
        // h = 128;

    var yearsPacked = []

    var clusters = ['people', 'places', 'organizations']

    var pack = d3.layout.pack()
        .size([w, h])
        .padding(1)
        .value(function(d) {
            return d.children ? d.children.length : 1
        });

    var url = 'data/hiv-all.json'

    var body = d3.select('body')

    var progressBarScale = d3.scale.linear().range([0, 200])

    var loadProgress = body.append('div')
        .attr('id', 'load-progress')
        .style({
            width: '0px',
            height: '10px',
            background: '#00c'
        })

    var xhr = d3.json(url)
        .on("progress", function() {
            var pct = d3.event.loaded / d3.event.totalSize
            console.log("progress", d3.event, pct);
            loadProgress.style('width', progressBarScale(pct) + 'px')
        })
        .on("load", function(data) {
            var years = data.children
            // years = years.slice(0, 10)
            renderYears(years)
        })
        .on("error", function(error) { console.log("failure!", error); })
        .get();

    function renderYears(years) {
        // console.log('renderYears', years)
        var yearsLen = years.length

        // d3.select('body')
            // .selectAll('svg')
            vis.selectAll('circle')
            .data(years)
            .enter()
                .append('svg')
                .attr('id', function(d, i) { return 'chart-' + d.name })
                .attr("width", w)
                .attr("height", h)
                .each(renderChart);

    }

    function renderChart(data) {
        // console.log('renderChart', data)

        // var node, root;

        var year = data.name

        var subvis = d3.select("#chart-" + year)
        .append("g")

        node = root = data;

        var nodes = pack.nodes(root);

        yearsPacked.push(nodes)

        subvis.selectAll("circle")
            .data(nodes.filter(function(d) {
                // console.log(d)
                return d.depth < 3
            }))
            .enter()
                .append("circle")
                .attr("class", function(d) {
                    var tmp = d.children ? "parent" : "child"
                    if (clusters.indexOf(d.name) > -1) {
                        tmp += ' ' + d.name
                    }
                    if (1 === d.depth) {
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
                .on("click", function(d) {
                    return zoom(node === d ? root : d);
                });

        subvis.append("text")
            .text(data.name)
            .attr('dy', '1em')
            .style('stroke', '#fff')
            .style('stroke-width', 1.5)
            .style('stroke-opacity', 0.7)
            .style('fill', '#000')
            .style('fill-opacity', 0.3)
            .style('font-size', '55px')
            .style('font-weight', 'bold')

        d3.select(window).on("click", function() {
            zoom(root);
            // zoom(subvis, root);
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
        if(!d || typeof d.x === 'undefined') return console.error('ZOOM wacky d', d);

        console.log('=> ZOOM', d.x, (r / d.r / 2))

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
})();