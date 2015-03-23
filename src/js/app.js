'use strict';

require('es6-promise').polyfill();

var threeDStage = require('./threeDStage.js');
var leapHandPlugin = require('./leapHandPlugin.js');
// var orientationController = require('./DeviceOrientationController.js');
// var hand = require('./hand.js');
// var animateHand = require('./animateHand.js');

// var handLoader = hand.createHand();  //returns loader async object
// var handRig;
var stage = threeDStage.createStage();
var hands = leapHandPlugin.createHands(stage.scene, stage.renderer, stage.camera);
// var ctrl = orientationController.DeviceOrientationController;
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

// Render loop runs stage updating and view to cardboard
function render() {
	//stage.orientationControls.update();
	//TODO ES6: Destructuring and aliasing in the parameters would
	// clean up the render objects and make them more readable
  stage.effect.render( stage.scene, stage.camera );
  requestAnimationFrame(render);
}
render();

// //window.addEventListener( 'resize', onWindowResize, false );

//frame data from socket server piping in data from elsewhere. 
// connection = new WebSocket('ws://' + window.location.hostname + ':1337');
// connection.onmessage = function (message) { 
//   var frameData = JSON.parse(message.data);
//   animateHand.animate(frameData, handRig.handMesh, handRig.fingers); 
// };

