#!/usr/bin/env node

var async = require('async');
var path = require('path');
var _ = require('lodash');

var dot = require('./lib/dot');
var finder = require('./lib/finder');
var comps = require('./lib/comps');
var fn = require('./lib/fn');

var json = require(process.argv[2]);

var filter = process.argv[3];

// TODO: It's 1am, this is not optimal
if(typeof(filter) !== 'undefined'){
  var wanted_uuids = dot.filter(json, filter);

  // Only select the nodes we care about
  var nodes = _.invert(json.nodes);
  var new_data = _.invert(_.zipObject(wanted_uuids, _.at(nodes, wanted_uuids)));
  json.nodes = new_data;

  // Only select the edges we care about
  var edges = _.at(json.edgeList, wanted_uuids);
  json.edgeList = _.zipObject(wanted_uuids, edges);

  console.log(JSON.stringify(json));
}else{
  dot.create(json);
}
