#!/usr/bin/env node

var async = require('async');
var path = require('path');
var _ = require('lodash');

var dot = require('./lib/dot');
var finder = require('./lib/finder');
var comps = require('./lib/comps');
var fn = require('./lib/fn');

var json = require(process.argv[2]);

dot.create(json);
