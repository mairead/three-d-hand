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

