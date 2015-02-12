(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// console.log('and');

exports.dummy = function(){
	return {'name': 'mairead'};
};
},{}],2:[function(require,module,exports){
'use strict';
var a = require('./a.js');

a = a;
// console.log('app');

exports.secondary = function(){
	var bundledName = a.dummy();
	return bundledName.name;
};
},{"./a.js":1}]},{},[2])