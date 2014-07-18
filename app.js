#!/usr/bin/env node

var async = require('async');
var path = require('path');
var _ = require('lodash');

var dot = require('./lib/dot');
var finder = require('./lib/finder');
var comps = require('./lib/comps');
var fn = require('./lib/fn');

var globPattern = '**/*.+(mhtml|mh|md)';
var dir = process.argv[2];

// Store all found files
var files;
// This shows all uniq file names and which directories they exist in
var uniqFiles = {};

var dumpResults = function(err, results){
  var hash = fn.Hash(files, results);
  //console.log(hash);
  values = fn.hashToUUIDs(hash);
  console.log(values);
  // dot.create(hash);
};

finder.find(dir, globPattern, function(found){
  // Store all file names relative to the current working directory
  files = _.map(found, function(a){
    var curFile = path.relative(dir, a);
    var base = path.basename(curFile);

    if(typeof(uniqFiles[base]) === 'undefined'){
      uniqFiles[base] = [];
    }
    uniqFiles[base].push(curFile);
    return curFile;
  });
  async.map(found, function(file, cb){
    comps.find(file, uniqFiles, cb);
  }, dumpResults);
});
