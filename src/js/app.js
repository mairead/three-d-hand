'use strict';

var threeDStage = require('./threeDStage.js');
var orientationController = require('./DeviceOrientationController.js');
var ctrl = orientationController.DeviceOrientationController;

var stageLeft = threeDStage.createStage('.viewport-1', 'left');
var stageRight = threeDStage.createStage('.viewport-2', 'right');

//TODO ES6: Would destructuring help recuce the footprint of this 
//method call and keep it in 80 chars 
stageLeft.controls = new ctrl( stageLeft.camera, stageLeft.renderer.domElement );
stageLeft.controls.connect();

stageRight.controls = new ctrl( stageRight.camera, stageRight.renderer.domElement );
stageRight.controls.connect();

// Render loop
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

// define connection settings
var leap = new Leap.Controller({
  host: '0.0.0.0',
  port: 6437
});

// connect controller
leap.connect();







