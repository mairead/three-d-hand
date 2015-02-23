//INSTANTIATE THREE JS SCENE WITH TWO VIEWPORTS AND NORMAL TORUS IN MIDDLE
var THREE = require('../../node_modules/three/three.min.js');

exports.makeStage = function(viewport, view){

			var VIEW_ANGLE, ASPECT, NEAR, FAR;
			var stageProps = {};
			//create 3D canvas - guess this is the ThreeJs stage setup
			stageProps.container = document.querySelector(viewport);

			var width = window.innerWidth/2;
			var height = window.innerHeight/2;

			VIEW_ANGLE = 10;
			ASPECT = WIDTH / HEIGHT;
			NEAR = 1;
			FAR = 10000;

			// Setup scene
			stageProps.scene = new THREE.Scene();

			stageProps.renderer = new THREE.WebGLRenderer({antialias: true});

			stageProps.renderer.setSize(WIDTH, HEIGHT);
			stageProps.renderer.shadowMapEnabled = true;
			stageProps.renderer.shadowMapSoft = true;
			stageProps.renderer.shadowMapType = THREE.PCFShadowMap;
			stageProps.renderer.shadowMapAutoUpdate = true;

			stageProps.container.appendChild(stageProps.renderer.domElement);

			stageProps.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

			stageProps.camera.rotation.order = 'YZX';
			stageProps.camera.position.set(60, 10, 1);
			stageProps.camera.lookAt(stageProps.scene.position);
			stageProps.scene.add(stageProps.camera);

			stageProps.renderer.setClearColor( 0xffffff, 1);

			stageProps.light = new THREE.DirectionalLight(0xffffff);

			stageProps.light.position.set(0, 300, 0);
			stageProps.light.castShadow = true;
			stageProps.light.shadowCameraLeft = -60;
			stageProps.light.shadowCameraTop = -60;
			stageProps.light.shadowCameraRight = 60;
			stageProps.light.shadowCameraBottom = 60;
			stageProps.light.shadowCameraNear = 1;
			stageProps.light.shadowCameraFar = 1000;
			stageProps.light.shadowBias = -0.0001;
			stageProps.light.shadowMapWidth = light1.shadowMapHeight = 1024;
			stageProps.light.shadowDarkness = 0.7;

			stageProps.scene.add(stageProps.light);

			var size = 10;
			var step = 1;
			var gridHelper = new THREE.GridHelper( size, step );

			gridHelper.position = new THREE.Vector3( 5, 0, 0 );

			stageProps.scene..add( gridHelper );

			var geometry, material, torus;

			geometry = new THREE.TorusGeometry(2, 1, 12, 12);
			material = new THREE.MeshNormalMaterial( );
			torus = new THREE.Mesh( geometry, material);

			torus.position.set(2, 2, 0);
			torus.rotation.y += 90;

			stageProps.scene.add( torus );


			return stageProps;

}
