'use strict';

	var fingers = [
	  {id: 0, pointable: {}}, //middle
	  {id: 0, pointable: {}}, //ring
	  {id: 0, pointable: {}}, //index
	  {id: 0, pointable: {}}, //little
	  {id: 0, pointable: {}} //thumb
	];

	var hand;

exports.createHand = function(){ //set id for fingers once and assign bones
	
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

	});
	
	return {
		handRigLoader: loader
	};

};

exports.getHand = function(){
	return {
		handMesh: hand,
	  fingers: fingers
	};
};