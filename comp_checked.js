#!/usr/bin/env node

var fs = require('fs');
var async = require('async');
var glob = require('glob');
var path = require('path');
var sprintf = require('sprintf');
var Q = require('q');
var _ = require('lodash');

// Find all files matching the pattern
var findFiles = function( dir, pattern, cb){
  var options = {
    cwd: dir
  };
  // TODO: have glob expand file paths
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
  fs.readFile(filename, 'utf8', function(err, data){
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

var globPattern = '**/*.+(mhtml|mh|md)';
var dir = process.argv[2];

findFiles(dir, globPattern, function(files){
  async.map(files, function(file, cb){
    findComps(file, cb);
  }, function(err, results){
    var hash = createHash(files, results);

    createDot(hash, dir);
  });
});

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

var createDot = function(hash, dir){
  startGraph();
  createClusters(hash, dir);
  dumpNodes(hash, dir);
  console.log('}');
};

var startGraph = function () {
  console.log('digraph G { rankdir = LR;' );
};

var dumpNodes = function(hash, dir){
  _.each(Object.keys(hash), function(key){
    var relative = path.relative(dir, key);
    var values = hash[key];
    _.each(values, function(val){
      createNodeEdge(relative, val, dir);
    });
  });
};

var createClusters = function(hash, dir){
  var pieces = _.groupBy(Object.keys(hash), function(key){
    return path.relative(dir, path.dirname(key));
  });
  _.each(Object.keys(pieces), function(key){
    var values = _.map(pieces[key], function(a){
      return path.relative(dir, a);
    });
    createCluster(key, values);
  });
};
var createCluster = function(name, nodes){
  var node_str = _.map(nodes, function(node){
    return sprintf('"%s"', node);
  });
  var str = sprintf('subgraph "cluster_%s" { node [style=filled]; label = "%s"; color=lightgrey; %s; }', name, name, node_str.join(';'));
  console.log(str);
};

// TODO: Calculate file name realtive to dir
var createNodeEdge = function( file, comp){
  console.log(sprintf('"%s" -> "%s";', file, comp));
};
