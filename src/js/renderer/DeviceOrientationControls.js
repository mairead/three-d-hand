'use strict';
/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function ( object ) {
	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );

	this.enabled = true;
	var startFlag = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	var onDeviceOrientationChangeEvent = function ( event ) {

		scope.deviceOrientation = event;

	};

	var onScreenOrientationChangeEvent = function () {

		scope.screenOrientation = window.orientation || 0;

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function () {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function ( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler );                               // orient the device

			quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation

		};

	}();

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = true;

	};

	this.disconnect = function() {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};

	this.update = function () {

		if ( scope.enabled === false ){
			return;
		} 

		//$(".originals").html("ORI: alpha: " + scope.deviceOrientation.alpha.toFixed(6) + ",  beta " + scope.deviceOrientation.beta.toFixed(6) + ", gamma: " + scope.deviceOrientation.gamma.toFixed(6));

		var alpha  = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) : 0; // Z
		var beta   = scope.deviceOrientation.beta  ? THREE.Math.degToRad( scope.deviceOrientation.beta  ) : 0; // X'
		var gamma  = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
		var orient = scope.screenOrientation       ? THREE.Math.degToRad( scope.screenOrientation       ) : 0; // O

		//$(".accelerometer").html("RAD: alpha: " + alpha.toFixed(6) + ", beta: " + beta.toFixed(6) + ", gamma: " + gamma.toFixed(6) );

		//add low pass filter

		//set initial values under startFlag to match orientation at beginning
		if(startFlag){
			scope.smoothedAlpha = THREE.Math.degToRad( scope.deviceOrientation.alpha );
			scope.smoothedBeta = THREE.Math.degToRad( scope.deviceOrientation.beta );
			scope.smoothedGamma = THREE.Math.degToRad( scope.deviceOrientation.gamma );
			startFlag = false;
		}

		var smoothing = 25; // or whatever is desired

		scope.smoothedAlpha += (alpha - scope.smoothedAlpha) / smoothing;
		scope.smoothedBeta += (beta - scope.smoothedBeta) / smoothing;
		scope.smoothedGamma += (gamma - scope.smoothedGamma) / smoothing;

		alpha = scope.smoothedAlpha;
		beta = scope.smoothedBeta;
		gamma = scope.smoothedGamma;

		//$(".filter").html("FIL: alpha: " + alpha.toFixed(6) + ", beta: " + beta.toFixed(6) + ", gamma: " + gamma.toFixed(6) );
		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
	};
	this.connect();
};