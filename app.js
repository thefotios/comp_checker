#!/usr/bin/env node

var fs = require('fs');
var async = require('async');
var glob = require('glob');
var path = require('path');
var _ = require('lodash');

var Filequeue = require('filequeue');
var fq = new Filequeue(200);

var dot = require('./lib/dot');

// Find all files matching the pattern
var findFiles = function( dir, pattern, cb){
  var options = {
    cwd: dir
  };
  // TODO: have glob expand file paths
  // TODO: Why did I do this sync?
  var matches = glob.sync(pattern, options);

  async.map(matches, function(file, cb){
    var filename = path.resolve(dir, file);
    cb(null, filename);
  }, function(err, results){
    cb(results);
  });
};

var findComps = function(filename, cb) {
  // Read the file
  fq.readFile(filename, 'utf8', function(err, data){
    if(err){
      // console.warn(err);
    }
    var comps = [];
    parseComps(data, function(comp){
      comps.push(comp);
    });
    cb(null, comps);
  });
};

// This will find all single line comp statements
// TODO: Make it work with multiline statements too
var re = /\$m\->comp\((.*?)\)/g;
var parseComps = function(lines, cb){
  // TODO: do this async
  while(matches = re.exec(lines)){
    var comp = matches[1].replace(/['"\s]/g,'').split(',');
    cb(comp[0]);
  }
};

// This filters the hash and removes any empty values
// TODO: It's late, there's gotta be a better way
var createHash = function(keys, values) {
  var hash = _.zipObject(keys, values);
  var keep = _.reject(keys, function(key){
    return hash[key].length === 0;
  });
  var hash2 = _.map(keep, function(key){
    return hash[key];
  });
  var hash_keep = _.zipObject(keep, hash2);
  return hash_keep;
};

var globPattern = '**/*.+(mhtml|mh|md)';
var dir = process.argv[2];

findFiles(dir, globPattern, function(files){
  async.map(files, function(file, cb){
    findComps(file, cb);
  }, function(err, results){
    files = _.map(files, function(a){
      return path.relative(dir, a);
    });
    var hash = createHash(files, results);

    dot.create(hash);
  });
});

