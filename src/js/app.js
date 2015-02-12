'use strict';
var a = require('./a.js');

a = a;
// console.log('app');

exports.secondary = function(){
	var bundledName = a.dummy();
	return bundledName.name;
};