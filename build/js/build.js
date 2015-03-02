(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var kalman = require('./kalmanFilter.js');
var kalmanObjects = kalman.kalmanFilter();
var outputDebugging = require('./outputDebugging.js');

/**
 * -------
 * threeVR (https://github.com/richtr/threeVR)
 * -------
 *
 * W3C Device Orientation control (http://www.w3.org/TR/orientation-event/)
 *
 * Author: Rich Tibbett (http://github.com/richtr)
 * License: The MIT License
 *
**/

//Note: manual user drag (rotate) and pinch (zoom) override handling
//removed for ease of use

//Added Kalman filtering to smooth on mobile device

exports.DeviceOrientationController = function ( object, domElement ) {

	this.object = object;
	this.element = domElement || document;

	this.freeze = true;

	this.useQuaternions = true; // use quaternions for orientation calculation by default

	this.deviceOrientation = {}; //this is the event object or referencing alpha, beta, gamma
	this.screenOrientation = window.orientation || 0;

	var CONTROLLER_EVENT = {
		SCREEN_ORIENTATION: 'orientationchange',
		MANUAL_CONTROL:     'userinteraction', // userinteractionstart, userinteractionend
		ROTATE_CONTROL:     'rotate'         // rotatestart, rotateend
	};

	var fireEvent = function () {
		var eventData;

		return function ( name ) {
			eventData = arguments || {};

			eventData.type = name;
			eventData.target = this;

			this.dispatchEvent( eventData );
		}.bind( this );
	}.bind( this )();

	this.onDeviceOrientationChange = function ( event ) {
		this.deviceOrientation = event;
	}.bind( this );

	this.onScreenOrientationChange = function () {
		this.screenOrientation = window.orientation || 0;
		//outputDebugging.showOrientation(window.orientation);

		fireEvent( CONTROLLER_EVENT.SCREEN_ORIENTATION );
	}.bind( this );

	var createQuaternion = (function () {

		var finalQuaternion = new THREE.Quaternion();
		var deviceEuler = new THREE.Euler();
		var screenTransform = new THREE.Quaternion();
		var worldTransform = new THREE.Quaternion( - Math.sqrt(0.5), 0, 0, Math.sqrt(0.5) ); // - PI/2 around the x-axis
		var minusHalfAngle = 0;
 
		return function ( alpha, beta, gamma, screenOrientation ) {

			deviceEuler.set( beta, alpha, -gamma, 'YXZ' ); //don't know why Gamma is negative either. It disappears here
			finalQuaternion.setFromEuler( deviceEuler );
			minusHalfAngle = - screenOrientation / 2;
			screenTransform.set( 0, Math.sin( minusHalfAngle ), 0, Math.cos( minusHalfAngle ) );
			finalQuaternion.multiply( screenTransform );
			finalQuaternion.multiply( worldTransform ); 
			//World transform se ems to position it in front, instead of having to look at it upside down

			return finalQuaternion;
		};

	})();

	this.updateDeviceMove = (function () {

		var deviceQuat = new THREE.Quaternion();
		var alpha, beta, gamma, orient;

		return function () {

			//alpha hack forces the values into the middle of the 360 degrees of rotation to 
			//prevent the kalman filter skewing when it hits the 0-360 gap
			alpha = this.deviceOrientation.alpha;
			if(alpha > 270){
				alpha = alpha - 180;
			}else if (alpha < 90){
				alpha = alpha + 180;
			}

			alpha  = THREE.Math.degToRad( alpha || 0 ); // Z
			beta   = THREE.Math.degToRad( this.deviceOrientation.beta  || 0 ); // X'
			gamma  = THREE.Math.degToRad( this.deviceOrientation.gamma || 0 ); // Y''
			orient = THREE.Math.degToRad( this.screenOrientation       || 0 ); // O

			outputDebugging.showAccelerometer();

			// only process non-zero 3-axis data
			if ( alpha !== 0 && beta !== 0 && gamma !== 0) {

				kalmanObjects.KO.z_k = $V([alpha, beta, gamma]); 
	    	kalmanObjects.KM.update(kalmanObjects.KO);
	    	outputDebugging.kalmanOutput(kalmanObjects.KM.x_k.elements);
	    	
	    	//kalman filtered values to smooth interpolation from accelerometer
	    	alpha = kalmanObjects.KM.x_k.elements[0];
	    	beta = kalmanObjects.KM.x_k.elements[1];
	    	gamma = kalmanObjects.KM.x_k.elements[2];

	    	deviceQuat = createQuaternion( alpha, beta, gamma, orient );

				if ( this.freeze ) {
					return;
				}
				this.object.quaternion.copy( deviceQuat );
			}

		};

	})();

	this.update = function () {
		this.updateDeviceMove();
	};

	this.connect = function () {

		window.addEventListener( 'orientationchange', this.onScreenOrientationChange, false );
		window.addEventListener( 'deviceorientation', this.onDeviceOrientationChange, false );
		this.freeze = false;
	};

	this.disconnect = function () {
		this.freeze = true;
		window.removeEventListener( 'orientationchange', this.onScreenOrientationChange, false );
		window.removeEventListener( 'deviceorientation', this.onDeviceOrientationChange, false );
	};

	this.prototype = Object.create( THREE.EventDispatcher.prototype );

};


},{"./kalmanFilter.js":5,"./outputDebugging.js":7}],2:[function(require,module,exports){
'use strict';

var leapBox = require('./leapBox.js');

//animate is called after the Hand model has been loaded by ThreeJs
//This is recalled with each Leap frame receieved with the Leap.loop
//This contains all the positioning code for moving the Hand mesh around
exports.animate = function(frame, handMesh, fingers){
  var fingersAssigned = false; //flag to determine if all fingers have been detected and assigned an ID


  function rotationCtrl(dir){
      // make sure fingers won't go into weird position. T
      //I think this doctors the direction object for each rotation to prevent large shifts
        for (var i = 0, length = dir.length; i < length; i++) {
          if (dir[i] >= 0.8) {
            dir[i] = 0.8;
          }
          
        }
      return dir;
    }
        
    function rotateBones(finger){
      //treat direction value before applying rotation
      var fingerDir = rotationCtrl(finger.pointable.direction);

      //TODO: Need to add more fine tuning to Direction constraint to prevent them bending backwards but without limiting forward or side movement

      //var fingerDir = finger.pointable.direction;

      // apply rotation to the main bone
      finger.mainBone.rotation.set(0, -fingerDir[0], fingerDir[1]); 

      // apply rotation to phalanx bones
      for (var i = 0, length = finger.phalanges.length; i < length; i++) {
        var phalange = finger.phalanges[i];
        phalange.rotation.set(0, 0, fingerDir[1]);
      }
    }

  if (frame.hands.length > 0) {

    //set IDs at beginning for fingers
    if(!fingersAssigned){
      //if all 5 pointables are available
      if (frame.pointables.length === 5) {
        //assign the current ID to the fingers array
        for (var i = frame.pointables.length - 1; i >= 0; i--) {
          fingers[i].id = frame.pointables[i].id;
          //console.log("ASSIGNED ID: ", fingers[i].id)
        }
        fingersAssigned = true; //set flag to prevent IDs being reassigned
      }
    }

    //Setting palm position and rotation to position of hand mesh on screen
    var hand = frame.hands[0];

    var position = leapBox.leapToScene( frame , hand.palmPosition );//ensures hand appears within Leap Js interaction box
    handMesh.position = position; // apply position

    var rotation = {
      z: hand.pitch(),
      y: hand.yaw(),
      x: hand.roll()
    };

    //Rotate the main bone of the hand and palm around the hand rotation
    handMesh.bones[0].rotation.set(rotation.x, rotation.y, rotation.z); //pitch is in reverse. The user's position is in the negative z axis

    //For each finger in the hand set the rotation of the main finger bone, and the smaller phalanx bones

    for (var k = fingers.length - 1; k >= 0; k--) {
      //console.log("FINGER ID: ", fingers[i].id)

      fingers[k].fingerVisible = false;
    
      for (var j = frame.pointables.length - 1; j >= 0; j--) {
         //console.log("POINTABLE ID: ", frame.pointables[j].id)
         if (fingers[k].id === frame.pointables[j].id) {
          //console.log("FINGER FOUND");
          fingers[k].fingerVisible = true; //finger ID has been found and therefore the finger is visible
          //push current pointable item into fingers array
          fingers[k].pointable = frame.pointables[j];
          rotateBones(fingers[k]);
        }
      }
    }

    

      //Update finger rotation
      // for (var i = fingers.length - 1; i >= 0; i--) {
      //   rotateBones(fingers[i]);
      // };
    //}

  }
};
},{"./leapBox.js":6}],3:[function(require,module,exports){
'use strict';

var threeDStage = require('./threeDStage.js');
var orientationController = require('./DeviceOrientationController.js');
var hand = require('./hand.js');
var animateHand = require('./animateHand.js');

var ctrl = orientationController.DeviceOrientationController;
var handLeft = hand.createHand();
var handRight = hand.createHand();
var stageLeft = threeDStage.createStage('.viewport-1', 'left');
var stageRight = threeDStage.createStage('.viewport-2', 'right');

//TODO ES6: Would destructuring help recuce the footprint of this 
//method call and keep it in 80 chars 
stageLeft.controls = new ctrl( stageLeft.camera, stageLeft.renderer.domElement );
stageLeft.controls.connect();

stageRight.controls = new ctrl( stageRight.camera, stageRight.renderer.domElement );
stageRight.controls.connect();

stageLeft.scene.add(handLeft);
stageRight.scene.add(handRight);

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

// define connection settings
var leap = new Leap.Controller({
  host: '0.0.0.0',
  port: 6437
});

// connect controller
leap.connect();

// Init Leap loop, runs the animation of the ThreeD hand from the Leap input
Leap.loop(function (frame) {
  animateHand.animate(frame, handLeft.hand, handLeft.fingers); // pass frame and hand model
  animateHand.animate(frame, handRight.hand, handRight.fing);
});









},{"./DeviceOrientationController.js":1,"./animateHand.js":2,"./hand.js":4,"./threeDStage.js":8}],4:[function(require,module,exports){
'use strict';

exports.createHand2 = function(){}

exports.createHand = function(){ //set id for fingers once and assign bones
	
	var fingers = [
	  {id: 0, pointable: {}}, //middle
	  {id: 0, pointable: {}}, //ring
	  {id: 0, pointable: {}}, //index
	  {id: 0, pointable: {}}, //little
	  {id: 0, pointable: {}} //thumb
	];

	var hand;

	//Instantiate new Mesh object by loading Blender JSON export
	var loader = new THREE.JSONLoader();

	//load Hand model with ThreeJS Loader
	loader.load('js/rigging.json', function (geometry, materials) {
	  var material;

	  hand = new THREE.SkinnedMesh(
	    geometry,
	    new THREE.MeshFaceMaterial(materials)
	  );

	  material = hand.material.materials;

	  for (var i = 0; i < materials.length; i++) {
	    var mat = materials[i];

	    mat.skinning = true;
	  }

	  //add bones from Hand into fingers array

	  //middle
	  fingers[0].mainBone = hand.bones[9];
	  fingers[0].phalanges = [hand.bones[10], hand.bones[11]];

	  //ring
	  fingers[1].mainBone = hand.bones[5];
	  fingers[1].phalanges = [hand.bones[6], hand.bones[7]];

	  //index
	  fingers[2].mainBone = hand.bones[13];
	  fingers[2].phalanges = [hand.bones[14], hand.bones[15]];

	  //little
	  fingers[3].mainBone = hand.bones[17];
	  fingers[3].phalanges = [hand.bones[18], hand.bones[19]];

	  //thumb
	  fingers[4].mainBone = hand.bones[2];
	  fingers[4].phalanges = [hand.bones[3]];



	  //need a call back for this async event to return the finished hand rig
	});

	return {
		fingers: fingers,
		hand: hand
	};

};
},{}],5:[function(require,module,exports){
'use strict';

exports.kalmanFilter = function(){

  var x_0 = $V([0,3,1.5]); //vector. Initial accelerometer values.
  //These are the base values when the device is held up straight

  //P prior knowledge of state
  var P_0 = $M([
                [2,0,0],
                [0,2,0],
                [0,0,2]
              ]); //identity matrix. Initial covariance. Set to 1
  var F_k = $M([
                [1,0,0],
                [0,1,0], //0 if interaction is unpredictable
                [0,0,1]
              ]); //identity matrix. How change to model is applied. Set to 1 if smooth changes
  var Q_k = $M([
                [0,0,0],
                [0,0,0],
                [0,0,0]
              ]); //empty matrix. Noise in system is zero

  var KM = new KalmanModel(x_0,P_0,F_k,Q_k);

  var z_k = $V([0,3,1.5]); //Updated accelerometer values. Is this amount to correct in each pass? 
  //var z_k = $V([0,0,0]);
  var H_k = $M([
                [1,0,0],
                [0,1,0],
                [0,0,1]
              ]); //identity matrix. Describes relationship between model and observation
  var R_k = $M([
                [2,0,0],
                [0,2,0],
                [0,0,2]
              ]); //2x Scalar matrix. Describes noise from sensor. Set to 2 to begin
  var KO = new KalmanObservation(z_k,H_k,R_k);

  return {
    KO:KO,
    KM:KM
  };
};
},{}],6:[function(require,module,exports){
'use strict';

//Interaction Box conversion method to find central co-ordinates for interacting with stage. 
//Does it need third iteration for z co-ordinates? Is Z axis going to be positive or negative
exports.leapToScene = function(frame, leapPos){

  var iBox = frame.interactionBox;

  var left = iBox.center[0] - iBox.size[0]/2;
  var top = iBox.center[1] + iBox.size[1]/2;
  var back = iBox.center[2] + iBox.size[2]/2;

  var x = leapPos[2] - left;
  var y = leapPos[1] - top;
  var z = leapPos[0] - back;

  //why are x and z axis swapped round from the Hand position? This is weird.

  x /= iBox.size[0];
  y /= iBox.size[1];
  z /= iBox.size[2];

  // x *= width;
  // y *= height;
 //  z *= 500; //what is depth of interaction box as relates to screen size?


//this is fudging the interaction box positions to map to center of screen
//this is partly to do with the camera positioning. its not flat to stage.
  x *= 10;
  y *= 10;
  z *= 10;

  x += 10;
  y += 10;
  z += 10;

  return {x: x ,y: y ,z: -z};

  //z seems to be working in the x axis and vice versa? 
  //Why does z require the negative value here?
};
},{}],7:[function(require,module,exports){
"use strict";

exports.kalmanOutput = function(kalman){
	$(".kalman").html("KAL: beta: " +kalman[1].toFixed(6)+", alpha: " +kalman[0].toFixed(6) + ", gamma: " +kalman[2].toFixed(6));
};

exports.showFlip = function(prevAlpha, currAlpha, diff){
	$(".debugger").html("prev: " + prevAlpha + "  curr: " + currAlpha + "  diff: " + diff);
};

exports.showOrientation = function(orientation){
	$(".debugger").html("orientation:" + orientation);
};

exports.showAccelerometer = function(){
	// function getDeviceRotation(e){
	// //	$(".originals").html('ORIG beta: ' + e.beta.toFixed(6) + ", alpha: " + e.alpha.toFixed(6) + ", gamma: " + e.gamma.toFixed(6));
		
	// 	var alpha = THREE.Math.degToRad(e.alpha).toFixed(6); 
	// 	var beta = THREE.Math.degToRad(e.beta).toFixed(6);
	// 	var gamma = THREE.Math.degToRad(e.gamma).toFixed(6);
	
	// //	$(".accelerometer").html('RADI beta: ' + beta + ", alpha: " + alpha + ", gamma: " + gamma);
	// }

	// if (window.DeviceOrientationEvent) {
	//   window.addEventListener('deviceorientation', getDeviceRotation, false);
	// }else{
	//   $(".accelerometer").html("NOT SUPPORTED");
	// }
};



},{}],8:[function(require,module,exports){
'use strict';

//TODO ES6: Add default param unless right hand specified to point left
exports.createStage = function(viewport, view){
	 
	//TODO ES6: convert to destructuring at bottom 
	var stageObjects = {}; 

	//TODO ES6: Declare vars as let further down where they are used
	var container, light, torus, geometry, material;
	var scene, camera, renderer;

	var size = 10;
	var step = 1;
	
	var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;

	WIDTH = window.innerWidth/2;
	HEIGHT = window.innerHeight/2;
	VIEW_ANGLE = 10;
	ASPECT = WIDTH / HEIGHT;
	NEAR = 1;
	FAR = 10000;

	var viewAngle = (view === 'left') ? 1 : -1;

	container = document.querySelector(viewport);

	//TODO ES6: Remove object mapping and add at bottom it doesn't need to be here

	//rendering
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.shadowMapType = THREE.PCFShadowMap;
	renderer.shadowMapAutoUpdate = true;
	renderer.setClearColor( 0xffffff, 1);
	container.appendChild(renderer.domElement);

	//camera
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera.rotation.order = 'YZX';
	camera.position.set(60, 10, viewAngle);
	camera.lookAt(scene.position);
	scene.add(camera);

	//lighting
	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 300, 0);
	light.castShadow = true;
	light.shadowCameraLeft = -60;
	light.shadowCameraTop = -60;
	light.shadowCameraRight = 60;
	light.shadowCameraBottom = 60;
	light.shadowCameraNear = 1;
	light.shadowCameraFar = 1000;
	light.shadowBias = -0.0001;
	light.shadowMapWidth = light.shadowMapHeight = 1024;
	light.shadowDarkness = 0.7;
	scene.add(light);

	//grid helper
	var gridHelper = new THREE.GridHelper( size, step );	
	gridHelper.position = new THREE.Vector3( 5, 0, 0 );
	scene.add(gridHelper);
	
	//geometry
	geometry = new THREE.TorusGeometry(2, 1, 12, 12);
	material = new THREE.MeshNormalMaterial( );
	torus = new THREE.Mesh( geometry, material );
	
	torus.position.set(100, 3, 0); 
	//moved from (2,2,0) to position items behind camera. This is a hack 
	//combined with the alpha position to prevent the kalman filter breaking
	torus.rotation.y += 90;
	scene.add( torus );

	//TODO ES6: Return fully populated object here, instead of above, will save chars
	stageObjects = {
		renderer: renderer,
		scene: scene,
		camera: camera
	};

	return stageObjects;
};

},{}]},{},[3])