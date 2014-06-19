hiv-cluster
===========

prototype for internews' hiv@30 visualization

###Plan

###Data
Data comes from the processed Daily Nation articles from the past 30 years as assembled by the Internews-KE Team.
Docx files were extracted from PDFs and scans, analyzed in Overview and then renamed to sort by data. They were then organized into year and decade buckets, processed with Chambua, an ushahidi project to pull entities (people/places/institutions) from text and assemble them into an array for visualization
Each central node will expand out from the year to subnodes (people,)

###Demo/Test
Prototypes required a mapping of the exported chambua objects to a json array that would work with D3. Some initial tests with fake data attempted the node-edge collapsable layout that we hope to use for ultimate views of the entites related to HIV by year, and eventually decade buckets.

Here is a small map example:
![Small Node-Edge]()

Here is a larger one:
![Large Node-Edge]()
