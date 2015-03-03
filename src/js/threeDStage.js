'use strict';

//TODO ES6: Add default param unless right hand specified to point left
exports.createStage = function(viewport, view){
	 
	//TODO ES6: convert to destructuring at bottom 
	var stageObjects = {}; 

	//TODO ES6: Declare vars as let further down where they are used
	var container, light, torus, geometry, material;
	var scene, camera, renderer, gridHelper ;

	var size = 10;
	var step = 1;
	
	var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;

	WIDTH = window.innerWidth/2;
	HEIGHT = window.innerHeight/2;
	VIEW_ANGLE = 45;//was 10
	ASPECT = WIDTH / HEIGHT;
	NEAR = 1;
	FAR = 10000;

	var viewAngle = (view === 'left') ? 1 : -1;

	container = document.querySelector(viewport);

	//rendering
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.shadowMapType = THREE.PCFShadowMap;
	renderer.shadowMapAutoUpdate = true;
	renderer.setClearColor( 0xffffff, 1);
	container.appendChild(renderer.domElement);

	//camera
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera.rotation.order = 'YZX';
	camera.position.set(30, 10, viewAngle); //was 60
	camera.lookAt(scene.position);
	scene.add(camera);

	//lighting
	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 300, 0);
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
	
	torus.position.set(100, 3, 0); 
	//torus.position.set(2, 2, 0); 
	//moved from (2,2,0) to position items behind camera. This is a hack 
	//combined with the alpha position to prevent the kalman filter breaking
	torus.rotation.y += 90;

	scene.add( torus );
	
	//TODO ES6: Return fully populated object here, instead of above, will save chars
	stageObjects = {
		renderer: renderer,
		scene: scene,
		camera: camera
	};

	return stageObjects;
};
