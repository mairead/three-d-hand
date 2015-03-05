'use strict';

var threeDStage = require('./threeDStage.js');
var orientationController = require('./DeviceOrientationController.js');
var hand = require('./hand.js');
var animateHand = require('./animateHand.js');
require('es6-promise').polyfill();

var handLoader = hand.createHand();  //returns loader async object
var handRig;
var stage = threeDStage.createStage('.viewport');
var ctrl = orientationController.DeviceOrientationController;

//TODO ES6: Would destructuring help recuce the footprint of this 
//method call and keep it in 80 chars 
stage.orientationControls = new ctrl( stage.camera, stage.renderer.domElement );
stage.orientationControls.connect();

//create promise implementation here to call hand loader
var loadHandRigging = new Promise(function(resolve){
  handLoader.handRigLoader.onLoadComplete = function(){
    resolve();
  };
});

//add hand to scene after promise is resolved
loadHandRigging.then(function() {
  handRig = hand.getHand();
  stage.scene.add(handRig.handMesh);  
  //Init Leap loop, runs the animation of the ThreeD hand from the Leap input
  Leap.loop(function (frame) {
    //animateHand.animate(frame, handRig.handMesh, handRig.fingers); 
    // pass frame and hand model
  });
}, function(err) {
  console.log(err); // Error: "It broke"
  console.log("hand rig not loaded in reject");
});


// Render loop runs stage updating and view to cardboard
function render() {
	stage.orientationControls.update();
	//TODO ES6: Destructuring and aliasing in the parameters would
	// clean up the render objects and make them more readable
  stage.effect.render( stage.scene, stage.camera );
  requestAnimationFrame(render);
}

render();

// define connection settings
var leap = new Leap.Controller({
  host: '0.0.0.0',
  port: 6437
});

// connect controller
leap.connect();

