##HIV-30 Cluster Visualization


prototype for internews' hiv@30 sentiment analysis visualization

###Proposal
We're trying to visualize the major entities involved in the conversation around HIV over the past 30 years in Kenya, based on text analysis of the Daily Nation AIDS coverage since the early 1980s.

To do this, we're assembling graphs of the major entities, and hopefully visualizing them in a way that is easily digestible, and meaninful, perhaps such that the node-edge map looks like a series of viruses that multiple as the conversation grows.

![virus image](https://raw.githubusercontent.com/auremoser/hiv-30_cluster/master/assets/virus.jpg)

See [here for more](http://forcollegeandcommunity.files.wordpress.com/2012/08/hiv-virus.jpg) images.

###Data
Data comes from the processed Daily Nation articles from the past 30 years as assembled by the Internews-KE Team.

Docx files were extracted from PDFs and scans, analyzed in Overview and then renamed to sort by data. They were then organized into year and decade buckets, processed with Chambua, an ushahidi project to pull entities (people/places/institutions) from text and assemble them into an array for visualization.

Each central node will expand out from the year to subnodes (people, places, institutions). The hierarchy will be AIDS > parent nodes (years) > children nodes(people, places, institutions).

###Demo/Test
Prototypes required a mapping of the exported chambua objects to a json array that would work with D3. Some initial tests with fake data attempted the node-edge collapsable layout that we hope to use for ultimate views of the entites related to HIV by year, and eventually decade buckets. Two tracks of viz type were attempted: collapsable node-edge, and zoomable circle-pack.

####Collapsable Node-Edge
Here is a small map example:
![Small Node-Edge](https://raw.githubusercontent.com/auremoser/hiv-30_cluster/master/assets/small-graph.jpg)

Here is a larger one:
![Large Node-Edge](https://raw.githubusercontent.com/auremoser/hiv-30_cluster/master/assets/large-graph.jpg)

Weights/Sizes of nodes are not adjusted in this case, but the idea is that the central node would be large, with appendage entities reflecting the glycoprotein receptors/docks, and agglutinating as the conversation grows.

![Color Palette](https://raw.githubusercontent.com/auremoser/hiv-30_cluster/master/assets/color_palette.jpg)

Here is an HIV cluster (of years?):
![HIV Cluster](https://raw.githubusercontent.com/auremoser/hiv-30_cluster/master/assets/virus-cluster.jpg)

Here's a diagram of the virus:
![Virus Diagram](https://raw.githubusercontent.com/auremoser/hiv-30_cluster/master/assets/diagram-virus.png)

####Zoomable Circle-Pack
Here is a demo example (1980s):
![Circle-Pack](https://raw.githubusercontent.com/auremoser/hiv-30_cluster/master/assets/1980s-pack.png)

![Color Palette](https://raw.githubusercontent.com/auremoser/hiv-30_cluster/master/assets/color_palette-2.png)

![HIV Cluster Orange](https://raw.githubusercontent.com/auremoser/hiv-30_cluster/master/assets/virus-banner.jpg)