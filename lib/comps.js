#!/usr/bin/env node

var Filequeue = require('filequeue');
var fq = new Filequeue(200);

var find = function(filename, cb) {
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

module.exports.find = find;
