#!/usr/bin/env node

var _ = require('lodash');
var path = require('path');
var sprintf = require('sprintf');

var create = function(hash){
  startGraph();
  createClusters(hash);
  dumpNodes(hash);
  console.log('}');
};

var startGraph = function () {
  console.log('digraph G { rankdir = LR;' );
};

var dumpNodes = function(hash){
  _.each(Object.keys(hash), function(key){
    var filename = path.basename(key);
    console.log(sprintf('"%s" [label = "%s"];', key, filename));
    var values = hash[key];
    _.each(values, function(val){
      createNodeEdge(key, val);
    });
  });
};

var createClusters = function(hash){
  var pieces = _.groupBy(Object.keys(hash), function(key){
    return path.dirname(key);
  });
  _.each(Object.keys(pieces), function(key){
    var values = pieces[key];
    var node_str = _.map(values, function(node){
      return sprintf('"%s"', node);
    });
    createCluster(key, node_str.join(';'));
  });
};

var createCluster = function(name, content){
  var str = sprintf('subgraph "cluster_%s" { node [style=filled]; label = "%s"; color=lightgrey; %s; }', name, name, content);
  console.log(str);
};

var createNodeEdge = function(file, comp){
  console.log(sprintf('"%s" -> "%s";', file, comp));
};

module.exports.create = create;
