var scene, camera, renderer, mesh;
var meshFloor, floorTexture;
var crate, crateTexture, crateNormalMap, crateBumpMap;


var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02 };
var USE_WIREFRAME = false;

// // Models index
// var models = {
// 	target1: {
// 		obj:"assets/models/4.obj",
// 		mtl:"assets/models/4.mtl",
// 		mesh: null
// 	},
// 	pistol: {
// 		obj:"assets/models/pistol.obj",
// 		mtl:"assets/models/pistol.mtl",
// 		mesh: null
// 	}
// };

// // Meshes index
// var meshes = {};

function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000);
	
	// mesh = new THREE.Mesh(
	// 	new THREE.BoxGeometry(1,1,1),
	// 	new THREE.MeshPhongMaterial({color:0xff4444, wireframe:USE_WIREFRAME})
	// );
	// mesh.position.y += 1; // Move the mesh up 1 meter
	// // The cube can have shadows cast onto it, and it can cast shadows
	// mesh.receiveShadow = true;
	// mesh.castShadow = true;
	// scene.add(mesh);
    
    var textureLoader = new THREE.TextureLoader();
    floorTexture = new textureLoader.load("assets/floortexture/lantairumput.jpg")

	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(50,100, 150,150),
        new THREE.MeshPhongMaterial({color:0xffffff, map: floorTexture})
        // new THREE.MeshBasicMaterial({color:0xffffff, map: floorTexture})
	);
	meshFloor.rotation.x -= Math.PI / 2; // Rotate the floor 90 degrees
    // scene.add(meshFloor);
    meshFloor.receiveShadow = true;
	scene.add(meshFloor);
    
    // LIGHTS
	ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);
	
	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3,6,-3);
	light.castShadow = true;
	// Will not light anything closer than 0.1 units or further than 25 units
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
    scene.add(light);
    
    // Load texture
    crateTexture = textureLoader.load("assets/crate0/crate0_diffuse.png");
	crateBumpMap = textureLoader.load("assets/crate0/crate0_bump.png");
	crateNormalMap = textureLoader.load("assets/crate0/crate0_normal.png");
	
	// Create mesh with these textures
	crate = new THREE.Mesh(
		new THREE.BoxGeometry(3,3,3),
		new THREE.MeshPhongMaterial({
			color:0xffffff,
			
			map:crateTexture,
			bumpMap:crateBumpMap,
			normalMap:crateNormalMap
		})
	);
	scene.add(crate);
	crate.position.set(10, 5, 3);
	crate.receiveShadow = true;
    crate.castShadow = true;


	// Wall loading!
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.load("assets/tembok/wall.mtl", function(materials){
		
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		
		objLoader.load("assets/tembok/wall.obj", function(mesh){
		
			mesh.traverse(function(node){
				if( node instanceof THREE.Mesh ){
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});
		
			scene.add(mesh);
			mesh.position.set(-5, 0, 4);
			// mesh.rotation.y = -Math.PI/4;
			mesh.scale.set(3,3,3);
			// mesh.rotation.set(0, 360, 0);
		});
		
	});

	// Model/material loading!
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.load("assets/models/4bil.mtl", function(materials){
		
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		
		objLoader.load("assets/models/4bil.obj", function(mesh){
		
			mesh.traverse(function(node){
				if( node instanceof THREE.Mesh ){
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});
		
			scene.add(mesh);
			mesh.position.set(-5, 4, 4);
			mesh.rotation.y = -Math.PI/4;
			mesh.rotation.set(0, 360, 0);
			mesh.scale.set(0.5,0.5,0.5);
		});
		
	});

	// Load models
	// REMEMBER: Loading in Javascript is asynchronous, so you need
	// to wrap the code in a function and pass it the index. If you
	// don't, then the index '_key' can change while the model is being
	// downloaded, and so the wrong model will be matched with the wrong
	// index key.
	// for( var _key in models ){
	// 	(function(key){
			
	// 		var mtlLoader = new THREE.MTLLoader();
	// 		mtlLoader.load(models[key].mtl, function(materials){
	// 			materials.preload();
				
	// 			var objLoader = new THREE.OBJLoader();
				
	// 			objLoader.setMaterials(materials);
	// 			objLoader.load(models[key].obj, function(mesh){
					
	// 				mesh.traverse(function(node){
	// 					if( node instanceof THREE.Mesh ){
	// 						node.castShadow = true;
	// 						node.receiveShadow = true;
	// 					}
	// 				});
	// 				models[key].mesh = mesh;
					
	// 			});
	// 		});
			
	// 	})(_key);
	// }

	camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0,player.height,0));
	
	renderer = new THREE.WebGLRenderer();
    renderer.setSize(1280, 720);
    
    // Enable Shadows in the Renderer
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	renderer.setClearColor( 0xffffff );

	document.body.appendChild(renderer.domElement);
	
	animate();
}

// // Runs when all resources are loaded
// function onResourcesLoaded(){
	
// 	// Clone models into meshes.
// 	meshes["target1"] = models.tent.mesh.clone();
// 	meshes["pistol"] = models.tent.mesh.clone();
	
// 	// Reposition individual meshes, then add meshes to scene
// 	meshes["target1"].position.set(-5, 0, 4);
// 	scene.add(meshes["target1"]);
	
// 	meshes["pistol"].position.set(-8, 0, 4);
// 	scene.add(meshes["pistol"]);
	
// }

function animate(){
	requestAnimationFrame(animate);
	
	// mesh.rotation.x += 0.01;
	// mesh.rotation.y += 0.02;
	
	// Keyboard movement inputs
	if(keyboard[87]){ // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A key
		// Redirect motion by 90 degrees
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){ // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	
	// Keyboard turn inputs
	if(keyboard[37]){ // left arrow key
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[39]){ // right arrow key
		camera.rotation.y += player.turnSpeed;
	}
	
	renderer.render(scene, camera);
}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;
