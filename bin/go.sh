#!/usr/bin/env bash

json='foo.json'
dot='foo.dot'
node app.js $1 | perl bin/gen_file_tree.pl > $json;
node make_graph.js $json > $dot;
bin/make_graph.sh $dot $2;
