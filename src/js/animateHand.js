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
  }
};