//Interaction Box conversion method to find central co-ordinates for interacting with stage. 
//Does it need third iteration for z co-ordinates? Is Z axis going to be positive or negative
function leapToScene(frame, leapPos){
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
}