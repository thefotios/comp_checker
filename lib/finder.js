#!/usr/bin/env node

var fs = require('fs');
var async = require('async');
var path = require('path');

// TODO: Make this cacheObj persist
var cacheObj = {};
var Glob = require('glob').Glob;

// TODO: Fix the cache stuff
module.exports = {
  find: function( dir, pattern, cb){
    var options = {
      cwd: dir,
    };
    // TODO: have glob expand file paths
    Glob(pattern, options, function(err, matches){
      async.map(matches, function(file, cb){
        var filename = path.resolve(dir, file);
        cb(err, filename);
      }, function(err, results){
        if(err){ throw err; }
        cb(results);
      });
    });
  }
};

