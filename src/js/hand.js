//set id for fingers once and assign bones
var fingers1 = [
  {id: 0, pointable: {}}, //middle
  {id: 0, pointable: {}}, //ring
  {id: 0, pointable: {}}, //index
  {id: 0, pointable: {}}, //little
  {id: 0, pointable: {}} //thumb
];
var fingersAssigned = false; //flag to determine if all fingers have been detected and assigned an ID

var hand1;

//Instantiate new Mesh object by loading Blender JSON export
var loader1 = new THREE.JSONLoader();

//load Hand model with ThreeJS Loader
loader1.load('javascripts/riggedhand.js', function (geometry, materials) {
  var material;

  hand1 = new THREE.SkinnedMesh(
    geometry,
    new THREE.MeshFaceMaterial(materials)
  );

  material = hand1.material.materials;

  for (var i = 0; i < materials.length; i++) {
    var mat = materials[i];

    mat.skinning = true;
  }

  //add bones from Hand into fingers array

  //middle
  fingers1[0].mainBone = hand1.bones[9];
  fingers1[0].phalanges = [hand1.bones[10], hand1.bones[11]];

  //ring
  fingers1[1].mainBone = hand1.bones[5];
  fingers1[1].phalanges = [hand1.bones[6], hand1.bones[7]];

  //index
  fingers1[2].mainBone = hand1.bones[13];
  fingers1[2].phalanges = [hand1.bones[14], hand1.bones[15]];

  //little
  fingers1[3].mainBone = hand1.bones[17];
  fingers1[3].phalanges = [hand1.bones[18], hand1.bones[19]];

  //thumb
  fingers1[4].mainBone = hand1.bones[2];
  fingers1[4].phalanges = [hand1.bones[3]];

  scene1.add(hand1);

  render();


  // Init Leap 
  Leap.loop(function (frame) {
    animate(frame, hand1); // pass frame and hand model
  });
});