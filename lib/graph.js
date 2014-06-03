#!/usr/bin/env node

var _ = require('lodash');
var path = require('path');
var sprintf = require('sprintf');

var create = function(hash, dir){
  startGraph();
  createClusters(hash, dir);
  dumpNodes(hash, dir);
  console.log('}');
};

var startGraph = function () {
  console.log('digraph G { rankdir = LR;' );
};

var dumpNodes = function(hash, dir){
  _.each(Object.keys(hash), function(key){
    var relative = path.relative(dir, key);
    var values = hash[key];
    _.each(values, function(val){
      createNodeEdge(relative, val, dir);
    });
  });
};

var createClusters = function(hash, dir){
  var pieces = _.groupBy(Object.keys(hash), function(key){
    return path.relative(dir, path.dirname(key));
  });
  _.each(Object.keys(pieces), function(key){
    var values = _.map(pieces[key], function(a){
      return path.relative(dir, a);
    });
    createCluster(key, values);
  });
};
var createCluster = function(name, nodes){
  var node_str = _.map(nodes, function(node){
    return sprintf('"%s"', node);
  });
  var str = sprintf('subgraph "cluster_%s" { node [style=filled]; label = "%s"; color=lightgrey; %s; }', name, name, node_str.join(';'));
  console.log(str);
};

var createNodeEdge = function( file, comp){
  console.log(sprintf('"%s" -> "%s";', file, comp));
};

module.exports.create = create;
