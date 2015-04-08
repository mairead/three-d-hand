'use strict';

//var outputDebugging = require('./outputDebugging.js');

exports.createHands = function(scene, renderer, camera){
	 var controller, riggedHand;

	// window.controller = controller = new Leap.Controller;
	 //  controller.use('handHold').use('transform', {
  //   position: new THREE.Vector3(1, 0, 0)
  // }).use('handEntry').use('screenPosition').use('riggedHand', {
  //   parent: scene,
  //   renderer: renderer,
  //   scale: null,
  //   positionScale: null,
  //   helper: true,
  //   offset: new THREE.Vector3(0, 0, 0),
  //   renderFn: function() {
  //     renderer.render(scene, camera);
  //   },
  //   camera: camera,
  //   checkWebGL: true
  // }).connect();

// controller.connect();

// define connection settings
// var leap = new Leap.Controller({
//   host: '192.168.1.78',
//   port: 6437
// });

// // connect controller
// leap.connect();
// outputDebugging.showLeapSocketData("connected");

// Leap.loop(function (frame) {
//   outputDebugging.showLeapSocketData(frame);
// });


  // var leapConn = new WebSocket("ws://192.168.1.78:6437/v6.json");

  // leapConn.onmessage = function(event){
  //   var obj = JSON.parse(event.data);
  //   var str = JSON.stringify(obj, undefined, 2);
  //   if(obj.id){
  //       console.log("Frame data for " + obj.id);
  //   } else {
  //       console.log("message " + event.data);
  //   }

   
  // }

  // leapConn.onclose = function(event){
  //   console.log(event.code);
  // }
  // leapConn.onerror = function(error){
  //   console.log(error);
  // }


//   //frame data from socket server piping in data from elsewhere. 
// var connection = new WebSocket('ws://' + window.location.hostname + ':1338');

// connection.onmessage = function (message) { 

//   //won't let me inspect the object here??
//   //console.log("msg", message.data);
//   outputDebugging.showLeapData(message.data); 
//   // var hand, handMesh, screenPosition;
//   // if (hand = frame.hands[0]) {
//   //   console.log("hand", frame.hands[0]);
//   //   handMesh = frame.hands[0].data('riggedHand.mesh');
//   //   screenPosition = handMesh.screenPosition(hand.fingers[1].tipPosition, camera);

//   // }

// };


  //need to pipe in frame data here?

  // controller.on('frame', function(frame) {
  //   // console.log('called', frame)
  //   var hand, handMesh, screenPosition;
  //   if (hand = frame.hands[0]) {
  //     //console.log("hand", frame.hands[0]);
      
  //     // handMesh = frame.hands[0].data('riggedHand.mesh');
  //     // //console.log("mesh in frame controller", handMesh)
  //     // screenPosition = handMesh.screenPosition(hand.fingers[1].tipPosition, camera);
  //     // cursor.style.left = screenPosition.x;
  //     // return cursor.style.bottom = screenPosition.y;
  //   }
  // });
};