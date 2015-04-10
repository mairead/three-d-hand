'use strict';

//var outputDebugging = require('./outputDebugging.js');

require('es6-promise').polyfill();

var threeDStage = require('./threeDStage.js');
// var leapHandPlugin = require('./leapHandPlugin.js');
var orientationController = require('./DeviceOrientationController.js');
var stage = threeDStage.createStage();
var ctrl = orientationController.DeviceOrientationController;
// var connection;

//TODO ES6: Would destructuring help recuce the footprint of this 
//method call and keep it in 80 chars 
stage.orientationControls = new ctrl( stage.camera, stage.renderer.domElement );
stage.orientationControls.connect();

//Render loop runs stage updating and view to cardboard
// function render() {
// 	stage.orientationControls.update();
// 	//TODO ES6: Destructuring and aliasing in the parameters would
// 	// clean up the render objects and make them more readable
// 	stage.renderer.render( stage.scene, stage.camera );
//   requestAnimationFrame(render);
// }
// render();

//stage.effect.render( stage.scene, stage.camera );
//stage.renderer.render( stage.scene, stage.camera );

window.controller = new Leap.Controller({
  background: true,
  checkVersion: true
});
window.controller.use('networking', {
  peer: new Peer({key: 'vg930sy60kck57b9'})
});
window.controller.use('riggedHand', {
	stage: stage.camera,
	renderer: stage.renderer,
	scene: stage.scene,
	effect: stage.effect
});

new Peer('remoteApp', {key: 'vg930sy60kck57b9'}); 

// var peer = controller.plugins.networking.peer;
// //this wasn't getting triggered because no leap data appeared
// peer.on('connection', function(conn){
// 	conn.on('data', function(data){
// 		console.log(data)
// 		//outputDebugging.showLeapData(data.frameData);
// 	});
// });

