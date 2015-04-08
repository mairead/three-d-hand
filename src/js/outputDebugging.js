'use strict';

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

exports.showLeapData = function(frameData){
	$(".debugger").html("leapdata:" + frameData);
};

exports.showLeapSocketData = function(frameData){
	$(".debugger2").html("leap socket:" + frameData);
};

