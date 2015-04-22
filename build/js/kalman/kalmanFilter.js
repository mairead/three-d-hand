'use strict';

//Create start vals dynamically depending on the position of the device
var startFlag = true, 
    alpha = 0, 
    beta = 0, 
    gamma = 0;

window.addEventListener('deviceorientation', getDeviceRotation, false);

function getDeviceRotation(e){
  alpha = THREE.Math.degToRad(e.alpha);
  beta = THREE.Math.degToRad(e.beta);
  gamma = THREE.Math.degToRad(e.gamma);
  //console.log("start vals", alpha, beta, gamma);
}

//Need to force accelerometer to initialise before retrieving initial values
var KM, KO;

setTimeout(function(){



// //These are being set to 0
// function getNewAccelerometerVals(){
//   //why is this undefined to begin with?
//     // var alpha = e.alpha ? THREE.Math.degToRad(e.alpha) : 0;
//     // var beta = e.beta ? THREE.Math.degToRad(e.beta) : 0;
//     // var gamma = e.gamma ? THREE.Math.degToRad(e.gamma) : 0;

//   var vals = [alpha, beta, gamma];

//   return vals;
// }

console.log([alpha, beta, gamma]);
//var x_0 = $V([2.5,-0.01,-1.5]); //vector. Initial accelerometer values.
var x_0 = $V([alpha, beta, gamma]); //vector. Initial accelerometer values.
//These are the base values when the device is held up straight

//P prior knowledge of state
var P_0 = $M([
              [1.5,0,0],
              [0,0.01,0],
              [0,0,0.05]
            ]); //identity matrix. Initial covariance. Set to 1
var F_k = $M([
              [1,0,0], //has to be set to 1
              [0,1,0], //0 if interaction is unpredictable. Setting this to zero actually sets all to zero??
              [0,0,1]
            ]); //identity matrix. How change to model is applied. Set to 1 if smooth changes
var Q_k = $M([
              [4,0,0],
              [0,0.05,0],
              [0,0,1.5]
            ]); //empty matrix. Noise in system is zero

KM = new KalmanModel(x_0,P_0,F_k,Q_k);

console.log([alpha, beta, gamma]);
var z_k = $V([alpha, beta, gamma]);
// var z_k = $V(getNewAccelerometerVals());  

//var z_k = $V([1.75,-0.02,-0.9]); //Updated accelerometer values. Is this amount to correct in each pass? 
//var z_k = $V([0,0,0]);
var H_k = $M([
              [1,0,0],
              [0,1,0],
              [0,0,1]
            ]); //identity matrix. Describes relationship between model and observation
var R_k = $M([
              [0.1,0,0],
              [0,0.001,0],
              [0,0,0.005]
            ]); //2x Scalar matrix. Describes noise from sensor.
KO = new KalmanObservation(z_k,H_k,R_k);

},600);