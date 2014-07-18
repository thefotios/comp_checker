#!/usr/bin/env node

var async = require('async');
var path = require('path');
var _ = require('lodash');

var dot = require('./lib/dot');
var finder = require('./lib/finder');
var comps = require('./lib/comps');
var fn = require('./lib/fn');

var json = require(process.argv[2]);

// TODO: I think there's some other cleaning that's happening elsewhere that can be moved here

// Find src and dest nodes in the same directory
var findSameDir = function(nodes, edges, cb){
  _.forOwn(edges, function(dests, src){
    var src_node = nodes[src];
    var src_dir = _.initial(src_node.split('/'));
    _.each(dests, function(dest){
      var dest_node = nodes[dest];
      var dest_dir = _.initial(dest_node.split('/'));
      if(src_dir.join('/') === dest_dir.join('/')){
        cb(src,dest);
      }
    })
  });
};

var cleanup = function(data, cb){
  var nodes = _.invert(data.nodes);
  var edges = data.edgeList;

  var emptyUUIDs = []

  // Delete any edges from the same directory
  findSameDir(nodes, edges, function(src, dest){
    var own_edges = edges[src];
    //console.warn(src,dest);
    edges[src] = _.without(own_edges, dest);

    // Remove nodes that no longer have any edges
    if(_.isEmpty(edges[src])){
      emptyUUIDs.push(src);
    }
  });

  var good_nodes = _.omit(data.nodes, function(uuid, name){
    var empty = _.contains(emptyUUIDs, uuid);
    var is_target = _.contains(_.keys(edges), uuid);
    return empty && !is_target;;
  });

  data.nodes = good_nodes;
  cb(data);
};

cleanup(json, function(json){
  dot.create(json);
})
return;
