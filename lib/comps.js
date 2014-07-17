#!/usr/bin/env node

var Filequeue = require('filequeue');
var fq = new Filequeue(200);
var path = require('path');
var _ = require('lodash');

var find = function(filename, possibleComps, cb) {
  // Read the file
  fq.readFile(filename, 'utf8', function(err, data){
    if(err){
      // console.warn(err);
    }
    var comps = [];
    var badRegex = /^(MULTIPLE|UNDEF|SELF|PARENT|MISSING)/;
    parseComps(data, function(comp){
      relativeComp(filename, comp, possibleComps, function(comp){
        // For now, let's exclude these bad cases
        if( badRegex.exec(comp) === null ){
          comps.push(comp);
        }
      })
    });
    cb(null, comps);
  });
};

// This will find all single line comp statements
// TODO: Make it work with multiline statements too
// TODO: Ignore commented out lines
var re = /\$m\->comp\((.*?)\)/g;
var parseComps = function(lines, cb){
  // TODO: do this async
  while(matches = re.exec(lines)){
    var comp = matches[1].replace(/['"\s]/g,'').split(',');
    cb(comp[0]);
  }
};

var relativeComp = function(filename, comp, possibleComps, cb) {
  var basename = path.basename(comp);
  var specialCases = ['SELF', 'PARENT'];
  if(_.include(specialCases, comp)){
    // TODO: We might want to somehow create a PARENT node in this folder
  }else{
    var comps = possibleComps[basename];
    if(typeof(comps) === 'undefined'){
      // TODO: This means for whatever reason we can't find the comp
      comp = resolveUndefComp(filename, comp, possibleComps);
    }else if(comps.length === 1){
      comp = comps[0];
    }else{
      // TODO: This means search for the comp
      comp = "MULTIPLE: "+comp;
    }
  }
  cb(comp);
}

var resolveUndefComp = function(filename, comp, possibleComps) {
  var returnComp;
  var mg;
  var retry = false;

  // This regex should take care of SELF, PARENT, and calls with methods
  var targetMethodRegex = /^([\w\.\/]*)(?:=>|:)/;
  var methodRegex = /^\.\w+$/;
  var fileRegex = /^[\/\w]+\.\w+$/;

  // This is a method type call with a target
  if((mg = targetMethodRegex.exec(comp)) !== null){
    comp = mg[1];
    retry = true;
  }else if(methodRegex.exec(comp) !== null){
    returnComp = "SELF";
  }else if(fileRegex.exec(comp) !== null){
    returnComp = "MISSING: " + comp;
  }else{
    //console.warn(filename, '---"'+comp+'"---');
    returnComp = "UNDEF: " + comp;
  }

  // Retry finding relative comp now that we have a filename
  // TODO: Infinite loop possible
  if(retry === true){
    relativeComp(filename, comp, possibleComps, function(newComp){
      returnComp = newComp;
    })
  }

  return returnComp;
}

module.exports.find = find;
