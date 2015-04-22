'use strict';

//TODO ES6: Add default param unless right hand specified to point left
exports.createStage = function(){
	 
	//TODO ES6: convert to destructuring at bottom 
	var stageObjects = {}; 

	//TODO ES6: Declare vars as let further down where they are used
	var container;
	var light; 
	var torus;
	var geometry; 
	var material;
	var scene = new THREE.Scene();
	var camera;
	var effect; 

	var gridHelper;
	var size = 100;
	var step = 10;

	container = document.createElement( 'div' );
	document.body.appendChild( container );
	
	var WIDTH = window.innerWidth; 
	var HEIGHT = window.innerHeight;

	var VIEW_ANGLE = 10; //was 10
	var ASPECT = WIDTH / HEIGHT; 
	var NEAR = 1;
	var FAR = 10000;//was 10000

	var renderer = new THREE.WebGLRenderer({antialias:true}); 

	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.shadowMapType = THREE.PCFShadowMap;
	renderer.shadowMapAutoUpdate = true;
	renderer.setClearColor( 0xffffff, 1);
	container.appendChild(renderer.domElement);
	
	effect = new THREE.StereoEffect( renderer );
	
	effect.setSize(WIDTH, HEIGHT);
	//nb: can we change separation to calibrate for users
	effect.eyeSeparation = 2.5 * 0.0254 / 2; //cardboard 2.5 inches

	//camera
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera.rotation.order = 'YZX';
	camera.position.set(100, 10, VIEW_ANGLE); //was 60, 10, VIEW_ANGLE
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

	//geometry
	geometry = new THREE.TorusGeometry(20, 10, 120, 120);
	material = new THREE.MeshNormalMaterial( );
	torus = new THREE.Mesh( geometry, material );
	
	torus.position.set(100, 100, 0); 

	//combined with the alpha position to prevent the kalman filter breaking
	torus.rotation.y += 50;

	var sphereGeom = new THREE.SphereGeometry( 25, 25, 25 );
	var sphere = new THREE.Mesh( sphereGeom, material );
	sphere.position.set(-100, 100, 0)

	scene.add(torus);
	scene.add(sphere);

	var cubeGeometry = new THREE.BoxGeometry( 300, 300, 300, 5, 5, 5 );
	var material = new THREE.MeshBasicMaterial( {color: 0xEEEEEE, wireframe: true} );
	var cube = new THREE.Mesh( cubeGeometry, material );
	cube.position.set(0, 100, 0);
	scene.add( cube );

	//TODO ES6: Return fully populated object here, instead of above, will save chars
	stageObjects = {
		effect: effect,
		renderer: renderer,
		scene: scene,
		camera: camera
	};

	return stageObjects;
};
