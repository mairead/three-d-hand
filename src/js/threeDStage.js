'use strict';

//TODO ES6: Add default param unless right hand specified to point left
exports.createStage = function(){
	 
	//TODO ES6: convert to destructuring at bottom 
	var stageObjects = {}; 

	//TODO ES6: Declare vars as let further down where they are used
	var container;// = document.querySelector(viewport); 
	var light; 
	var torus;
	var geometry; 
	var material;
	var scene = new THREE.Scene();
	var camera;
	var effect; 

	var gridHelper;
	var size = 10;
	var step = 1;

	container = document.createElement( 'div' );
	document.body.appendChild( container );
	
	//why is it only occupying half the screen? is this the aspect?
	var WIDTH = window.innerWidth; 
	var HEIGHT = window.innerHeight;

	var VIEW_ANGLE = 10; //was 10
	var ASPECT = WIDTH / HEIGHT; 
	var NEAR = 1;
	var FAR = 10000;

	var renderer = new THREE.WebGLRenderer({antialias:true}); 

	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.shadowMapType = THREE.PCFShadowMap;
	renderer.shadowMapAutoUpdate = true;
	renderer.setClearColor( 0xffffff, 1);
	container.appendChild(renderer.domElement);
	
	//effect = new THREE.StereoEffect( renderer );
	effect = renderer;
	
	effect.setSize(WIDTH, HEIGHT);
	//nb: can we change separation to calibrate for users
	effect.separation = 2.5 * 0.0254 / 2; //cardboard 2.5 inches

	//camera
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera.rotation.order = 'YZX';
	camera.position.set(60, 10, VIEW_ANGLE); //was 60, 10, VIEW_ANGLE
	camera.lookAt( scene.position );

	scene.add(camera);

	//lighting
	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 100, 0);
	light.castShadow = true;
	light.shadowCameraLeft = -60;
	light.shadowCameraTop = -60;
	light.shadowCameraRight = 60;
	light.shadowCameraBottom = 60;
	light.shadowCameraNear = 1;
	light.shadowCameraFar = 1000;
	light.shadowBias = -0.0001;
	light.shadowMapWidth = light.shadowMapHeight = 1024;
	light.shadowDarkness = 0.7;
	scene.add(light);

	//grid helper
	gridHelper = new THREE.GridHelper( size, step );	
	gridHelper.position = new THREE.Vector3( 5, -1, 0 );
	scene.add(gridHelper);
	
	//geometry
	geometry = new THREE.TorusGeometry(2, 1, 12, 12);
	material = new THREE.MeshNormalMaterial( );
	torus = new THREE.Mesh( geometry, material );
	
	//why is torus appearing to left of screen instead of middle?
	//torus.position.set(100, 3, 0); 
	torus.position.set(2, 2, 0); 
	//moved from (2,2,0) to position items behind camera. This is a hack 
	//combined with the alpha position to prevent the kalman filter breaking
	torus.rotation.y += 90;

	scene.add(torus);

	//TODO ES6: Return fully populated object here, instead of above, will save chars
	stageObjects = {
		effect: effect,
		renderer: renderer,
		scene: scene,
		camera: camera
	};

	return stageObjects;
};
