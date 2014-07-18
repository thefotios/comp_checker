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
  console.log(dumpNodes2(data.nodes));
  console.log(createClusters(data.tree));
  console.log(createEdges(data.edgeList));
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
  var data;

  _.forIn(hash, function(val, key){
    if(key === '.'){
      var values = _.map(val, function(x){
        return indent(sprintf('"%s";', x), level);;
      })
      data = values.join("\n");
    }else{
      data = createClusters(val, level);
    }

    str += sprintf(
      '\n%s subgraph "cluster_%s" { node [style=filled]; label = "%s"; color=lightgrey; %s }',
      "\t".repeat(level),
      key,
      key,
      data
    );
  });
  return str;
};

var indent = function(str, tabs){
  return sprintf("%s%s","\t".repeat(tabs),str);
};

var filter = function(data, filter) {
  var wantedTree = data.tree;
  var keys = filter.split('/');
  _.each(keys, function(key){
    wantedTree = wantedTree[key];
  })
  var uuids = collectKeys(wantedTree);
  var right_side = _.map(uuids, function(uuid){
    return data.edgeList[uuid];
  });
  right_side = _.uniq(_.compact(_.flatten(right_side)));
  var all_uuids = _.union(uuids, right_side);
  //var right_uniq = _.difference(right_side, uuids);
  //uuidsToName(data, all_uuids);
  return all_uuids;
};

var uuidsToName = function(data, uuids){
  _.each(uuids, function(uuid){
    var name = _.findKey(data.nodes, function(val){
      return val === uuid;
    });
    console.log(uuid, name);
  })
};

var collectKeys = function(hash){
  var uuids = [];
  _.forIn(hash, function(val, key){
    if(key === '.'){
      uuids.push(val);
    }else{
      uuids.push(collectKeys(val));
    }
  });
  return _.uniq(_.flatten(uuids));
}

module.exports.create = create;
module.exports.filter = filter
