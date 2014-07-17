#!/usr/bin/env node

var _ = require('lodash');

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

module.exports.Hash = createHash;
