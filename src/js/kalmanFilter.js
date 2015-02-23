'use strict';

exports.kalmanFilter = function(){

  var x_0 = $V([0,0,0]); //vector. Initial accelerometer values.
  //These are the base values when the device is held up straight

  //P prior knowledge of state
  var P_0 = $M([
                [1,0,0],
                [0,1,0],
                [0,0,1]
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

  var z_k = $V([0,0,0]); //Updated accelerometer values. Is this amount to correct in each pass? 
  //var z_k = $V([0,0,0]);
  var H_k = $M([
                [1,0,0],
                [0,1,0],
                [0,0,1]
              ]); //identity matrix. Describes relationship between model and observation
  var R_k = $M([
                [0.5,0,0],
                [0,0.5,0],
                [0,0,0.5]
              ]); //2x Scalar matrix. Describes noise from sensor. Set to 2 to begin
  var KO = new KalmanObservation(z_k,H_k,R_k);

  return {
    KO:KO,
    KM:KM
  };
};