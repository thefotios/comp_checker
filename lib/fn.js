#!/usr/bin/env node

var _ = require('lodash');
var uuid = require('node-uuid');

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

  var uniq_vals = _.mapValues(hash_keep, function(vals){
    return _.uniq(vals);
  })

  return uniq_vals;
};

// Transform the hash's keys and values into UUIDs
var uuids = {};
var hashToUUIDs = function(hash){
  var oldKeys = _.keys(hash);

  var newKeys = _.map(oldKeys, getUUID);

  var newHash = _.zipObject(newKeys, _.values(hash));
  var uuidHash = _.mapValues(newHash, function(values){
    var newValues = _.map(values, getUUID);
    return newValues;
  });

  return {
    'edgeList': uuidHash,
    'nodes': uuids
  }
};

// Create orn reuse a uuid for the value
var getUUID = function(key){
  if(typeof(uuids[key]) === 'undefined'){
    uuids[key] = uuid.v4().replace(/-/g,'');
  }
  return uuids[key];
};

module.exports.Hash = createHash;
module.exports.hashToUUIDs = hashToUUIDs;
