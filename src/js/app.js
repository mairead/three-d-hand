'use strict';

var outputDebugging = require('./outputDebugging.js');

require('es6-promise').polyfill();

var threeDStage = require('./threeDStage.js');
var leapHandPlugin = require('./leapHandPlugin.js');
//var orientationController = require('./DeviceOrientationController.js');
// var hand = require('./hand.js');
// var animateHand = require('./animateHand.js');

// var handLoader = hand.createHand();  //returns loader async object
// var handRig;
var stage = threeDStage.createStage();

// console.log(stage)
// var gl = stage.renderer.getContext();
// var ext = gl.getExtension("OES_texture_float_linear");
// if(!ext) {
//   alert("extension does not exist");
// }

//var hands = leapHandPlugin.createHands();
//var ctrl = orientationController.DeviceOrientationController;
// var connection;

//TODO ES6: Would destructuring help recuce the footprint of this 
//method call and keep it in 80 chars 
// stage.orientationControls = new ctrl( stage.camera, stage.renderer.domElement );
// stage.orientationControls.connect();

//create promise implementation here to call hand loader
// var loadHandRigging = new Promise(function(resolve){
//   handLoader.handRigLoader.onLoadComplete = function(){
//     resolve();
//   };
// });

//add hand to scene after promise is resolved
// loadHandRigging.then(function() {
//   handRig = hand.getHand();
//   stage.scene.add(handRig.handMesh);  
  
// }, function(err) {
//   console.log(err, "hand rig not loaded in reject");
// });

// function onWindowResize() {

//   // windowHalfX = window.innerWidth / 2,
//   // windowHalfY = window.innerHeight / 2,

//   stage.camera.aspect = window.innerWidth / window.innerHeight;
//   stage.camera.updateProjectionMatrix();

//   stage.effect.setSize( window.innerWidth, window.innerHeight );

// }

//Render loop runs stage updating and view to cardboard
// function render() {
// 	//stage.orientationControls.update();
// 	//TODO ES6: Destructuring and aliasing in the parameters would
// 	// clean up the render objects and make them more readable
//   stage.effect.render( stage.scene, stage.camera );
//   requestAnimationFrame(render);
// }
// render();

//stage.renderer.render( stage.scene, stage.camera );

//This is calling THREE.js twice? 

window.controller = new Leap.Controller({
  background: true,
  checkVersion: false
});
controller.use('networking', {
  peer: new Peer({key: 'vg930sy60kck57b9'})
});
controller.use('riggedHand', {
	stage: stage.camera,
	renderer: stage.renderer,
	scene: stage.scene
	// scale: null,
 //  positionScale: null,
 //  helper: true,
 //  offset: new THREE.Vector3(0, 0, 0),
 //  checkWebGL: true
});

var RemoteApp = new Peer('remoteApp', {key: 'vg930sy60kck57b9'}); 

var peer = controller.plugins.networking.peer;

//this wasn't getting triggered because no leap data appeared!
peer.on('connection', function(conn){
	conn.on('data', function(data){
		//console.log(data)
		//outputDebugging.showLeapData(data.frameData);
	});
});

