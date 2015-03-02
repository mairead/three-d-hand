'use strict';

var threeDStage = require('./threeDStage.js');
var orientationController = require('./DeviceOrientationController.js');
var hand = require('./hand.js');
var animateHand = require('./animateHand.js');
require('es6-promise').polyfill();

var handLoader = hand.createHand();  //returns loader async object
var handRig;

var stageLeft = threeDStage.createStage('.viewport-1', 'left');
var stageRight = threeDStage.createStage('.viewport-2', 'right');
var ctrl = orientationController.DeviceOrientationController;
//TODO ES6: Would destructuring help recuce the footprint of this 
//method call and keep it in 80 chars 
stageLeft.controls = new ctrl( stageLeft.camera, stageLeft.renderer.domElement );
stageLeft.controls.connect();

stageRight.controls = new ctrl( stageRight.camera, stageRight.renderer.domElement );
stageRight.controls.connect();

//create promise implementation here to call hand loader
var loadHandRigging = new Promise(function(resolve, reject){
  handLoader.handRigLoader.onLoadComplete = function(){
    resolve();
  };
});

//add hand to scene after promise is resolved
loadHandRigging.then(function(result) {

  handRig = hand.getHand();
  handRig.handMesh.position = new THREE.Vector3( 5, 0, 0 );
  // handRig.handMesh.bones[0].rotation.set({x:0, y:0, z:0});

  console.log(handRig.handMesh.position)

  stageLeft.scene.add(handRig);
  stageRight.scene.add(handRig);

  // Init Leap loop, runs the animation of the ThreeD hand from the Leap input
  // Leap.loop(function (frame) {
  //   console.log("loop")
  //   animateHand.animate(frame, handRig.handMesh, handRig.fingers); // pass frame and hand model
  // });
}, function(err) {
  console.log(err); // Error: "It broke"
  console.log("hand rig not loaded in reject");
});


// Render loop runs stage updating and view to cardboard
function render() {
	stageLeft.controls.update();
	stageRight.controls.update();
	//TODO ES6: Destructuring and aliasing in the parameters would
	// clean up the render objects and make them more readable
	stageRight.renderer.render( stageRight.scene, stageRight.camera );
  stageLeft.renderer.render( stageLeft.scene, stageLeft.camera );
  
  requestAnimationFrame(render);
}

render();

// // define connection settings
// var leap = new Leap.Controller({
//   host: '0.0.0.0',
//   port: 6437
// });

// // connect controller
// leap.connect();





