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
var findSameDir = function(nodes, edges, args, cb){
  _.forOwn(edges, function(dests, src){
    var src_node = nodes[src];
    var src_dir = partialDir(src_node, args.locality);
    _.each(dests, function(dest){
      var dest_node = nodes[dest];
      var dest_dir = partialDir(dest_node, args.locality);
      if(dest_dir === src_dir) {
        cb(src,dest);
      }
    })
  });
};

var partialDir = function(dir, num_parts){
  var parts = dir.split('/');
  var new_path = _.isUndefined(num_parts) ?
    _.initial(parts) :
    _.first(parts, num_parts);
  return new_path.join('/');
};

var cleanup = function(data, args, cb){
  var nodes = _.invert(data.nodes);
  var edges = data.edgeList;

  var emptyUUIDs = []

  // Delete any edges from the same directory
  findSameDir(nodes, edges, args, function(src, dest){
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
    // also want to make sure we're not removing nodes that are targets as well
    var is_target = _.contains(_.keys(edges), uuid);
    return empty && !is_target;;
  });

  data.nodes = good_nodes;
  cb(data);
};

var args = {
  locality: 3

};

cleanup(json, args, function(json){
  dot.create(json);
  })
return;
