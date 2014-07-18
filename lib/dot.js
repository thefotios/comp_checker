#!/usr/bin/env node

var _ = require('lodash');
var path = require('path');
var sprintf = require('sprintf');

var create = function(data){
  startGraph();
  console.log(createClusters(data.tree, data.nodes, []));
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
  console.log('',
              'digraph G {',
                'ratio=compress',
                'remincross=true',
                'splines=curved',
                'ranksep=.2'
             );
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
var createClusters = function(hash, nodes, parents){
  var str = '';
  var data;

  var used_nodes = _.values(nodes);

  _.forIn(hash, function(val, key){
    if(key === '.'){
      var values = _.chain(val)
        .filter(function(x){
          return _.contains(used_nodes, x);
        })
        .map(function(x){
          return sprintf('"%s";', x);
        })
        .value();
        // TODO: Not sure if we can have an empty set of nodes here
      if(_.chain(values).compact().isEmpty().value()){
        console.warn("No nodes");
      }
      data = values.join("\n");
    }else{
      parents.push(key);
      data = createClusters(val, nodes, parents);
    }

    str += sprintf(
      '\nsubgraph "cluster_%s" { rank=same; node [style=bold]; label = "%s"; %s }',
      parents.join('_'),
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
