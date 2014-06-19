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

finder.find(dir, globPattern, function(files){
  async.map(files, function(file, cb){
    comps.find(file, cb);
  }, function(err, results){
    files = _.map(files, function(a){
      return path.relative(dir, a);
    });
    var hash = fn.Hash(files, results);

    dot.create(hash);
  });
});

