'use strict';

exports.createHands = function(scene, renderer, camera){
	console.log('leap code goes in here');
	 var controller, cursor, initScene, riggedHand, stats;

	


	window.controller = controller = new Leap.Controller;
	  controller.use('handHold').use('transform', {
    position: new THREE.Vector3(1, 0, 0)
  }).use('handEntry').use('screenPosition').use('riggedHand', {
    parent: scene,
    renderer: renderer,
    scale: null,
    positionScale: null,
    helper: true,
    offset: new THREE.Vector3(0, 0, 0),
    renderFn: function() {
      renderer.render(scene, camera);
      // return controls.update();
    },
    materialOptions: {
      // wireframe: getParam('wireframe')
    },
    // dotsMode: getParam('dots'),
    stats: stats,
    camera: camera,
    boneLabels: function(boneMesh, leapHand) {
      if (boneMesh.name.indexOf('Finger_03') === 0) {
        return leapHand.pinchStrength;
      }
    },
    boneColors: function(boneMesh, leapHand) {
      if ((boneMesh.name.indexOf('Finger_0') === 0) || (boneMesh.name.indexOf('Finger_1') === 0)) {
        return {
          hue: 0.6,
          saturation: leapHand.pinchStrength
        };
      }
    },
    checkWebGL: true
  }).connect();

  // controller.on('frame', function(frame) {
  //   var hand, handMesh, screenPosition;
  //   if (hand = frame.hands[0]) {
  //     handMesh = frame.hands[0].data('riggedHand.mesh');
  //     screenPosition = handMesh.screenPosition(hand.fingers[1].tipPosition, camera);
  //     cursor.style.left = screenPosition.x;
  //     return cursor.style.bottom = screenPosition.y;
  //   }
  // });
};