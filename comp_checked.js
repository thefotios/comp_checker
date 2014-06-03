#!/usr/bin/env node

var fs = require('fs');
var async = require('async');
var glob = require('glob');
var path = require('path');
var sprintf = require('sprintf');

// Find all files matching the pattern
var findFiles = function( path, pattern, cb){
  var options = {
    cwd: path
  };
  // TODO: have glob expand file paths
  glob(pattern, options, function(err, matches){
    expandPaths(matches, path, cb);
  });
};

var expandPaths = function(matches, root, cb){
  async.each(matches, function(match){
    var filename = path.resolve(root, match);
    cb(filename, match);
  });
};

var findComps = function(filename, cb) {
  // Read the file
  fs.readFile(filename, 'utf8', function(err, data){
    if(err){
      console.warn(err);
    }
    parseComps(data, cb);
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

var globPattern = '**/*.+(mhtml|mh|md)';
var dir = process.argv[2];

findFiles(dir, globPattern, function(filename, relative){
  findComps(filename, function(comp){
    createNodeEdge(relative, comp);
  });
});

// TODO: Calculate file name realtive to dir
var createNodeEdge = function( file, comp ){
  console.log(sprintf('"%s" -> "%s";', file, comp));
};
