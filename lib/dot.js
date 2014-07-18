#!/usr/bin/env node

var _ = require('lodash');
var path = require('path');
var sprintf = require('sprintf');

String.prototype.repeat = function(count) {
  if (count < 1) return '';
  var result = '', pattern = this.valueOf();
  while (count > 1) {
    if (count & 1) result += pattern;
    count >>= 1, pattern += pattern;

  }
  return result + pattern;

};

var create = function(data){
  startGraph();
  console.log(createClusters(data.tree));
  console.log(createEdges(data.edgeList));
  console.log(dumpNodes2(data.nodes));
  console.log('}');
};

var dumpNodes2 = function(hash){
  var strs = [];
  _.forIn(hash, function(uuid, label){
    label = _.last(label.split('/'));
    var str = sprintf('"%s" [label = "%s"];', uuid, label);
    strs.push(str);
  });
  return strs.join("\n");
};

var startGraph = function () {
  console.log('digraph G { graph [ dpi = 100 ]; rankdir=LR; ' );
};

var createEdges = function(hash) {
  var lines = [];
  _.forIn(hash, function( values, key ){
    _.forEach(values, function(val){
      var str = sprintf('"%s" -> "%s";', key, val);
      lines.push(str);
    })
  })
  return lines.join("\n");
};

// TODO: Add indentation
var createClusters = function(hash, level){
  if(typeof(level) === 'undefined'){
    level = 0;
  }
  level++;
  var str = '';
  _.forIn(hash, function(val, key){
    if(key === '.'){
      var values = _.map(val, function(x){
        return indent(sprintf('"%s";', x), level);;
      })
      str += values.join("\n");
    }else{
      var data = createClusters(val, level);
        str += sprintf(
          '\n%s subgraph "cluster_%s" { node [style=filled]; label = "%s"; color=lightgrey; %s }',
          "\t".repeat(level),
          key,
          key,
          data
        );
    }
  });
  return str;
};

var indent = function(str, tabs){
  return sprintf("%s%s","\t".repeat(tabs),str);
};

/*
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

var createCluster = function(name, content){
  var str = sprintf('subgraph "cluster_%s" { node [style=filled]; label = "%s"; color=lightgrey; %s; }', name, name, content);
  console.log(str);
};

var createNodeEdge = function(file, comp){
  console.log(sprintf('"%s" -> "%s";', file, comp));
};
*/

module.exports.create = create;
