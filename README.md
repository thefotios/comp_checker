comp_checker
============

## Purpose
Create a `dot` formatted digraph of comps in Mason code.

## To Generate Graph
1. Run `npm install`
1. To generate `dot` graph:

		node app.js ~/path/to/mason/folder > graph.dot

## To generate image file
You will need to have `dot` installed (usually comes with the `graphviz` package)

1. To create an image file. This will create a file of the same name with a ".png" extension.

		bin/make_graph.sh ~/path/to/graph.dot

### Alternative for finding comps

	git grep '$m->comp' -- '*.mhtml' '*.mh' '*.md'
