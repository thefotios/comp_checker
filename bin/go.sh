#!/usr/bin/env bash

base="foo"
dot='foo.dot'
step=1

# Create the initial json of all the data
outfile="${base}.${step}.json"
node app.js $1 | python -m json.tool > $outfile
infile=$outfile

# First pass
((step++))
outfile="${base}.${step}.json"
cat $infile | perl bin/gen_file_tree.pl | python -m json.tool > $outfile
infile=$outfile

# Filter
((step++))
outfile="${base}.${step}.json"
node make_graph.js $infile $2 | python -m json.tool > $outfile
infile=$outfile

# Rerun
((step++))
outfile="${base}.${step}.json"
cat $infile | perl bin/gen_file_tree.pl | python -m json.tool > $outfile;
infile=$outfile

node make_graph.js $infile > $dot;
bin/make_graph.sh $dot $3;
