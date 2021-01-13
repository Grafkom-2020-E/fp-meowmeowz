var scene, camera, renderer, mesh;
var meshFloor, floorTexture;
var crate, crateTexture, crateNormalMap, crateBumpMap;


var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02, canShoot:0 };
var USE_WIREFRAME = false;

var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
	box: new THREE.Mesh(
		new THREE.BoxGeometry(0.5,0.5,0.5),
		new THREE.MeshBasicMaterial({ color:0x4444ff })
	)
};

var loadingManager = null;
var RESOURCES_LOADED = false;
var frameCount = 0;

// Models index
var models = {
	target1: {
		obj:"assets/models/target bola/1/1.obj",
		mtl:"assets/models/target bola/1/1.mtl",
		mesh: null
	},
	target2 : {
		obj:"assets/models/target bola/2/2.obj",
		mtl:"assets/models/target bola/2/2.mtl",
		mesh: null
	},
	target3 : {
		obj:"assets/models/target bola/3/3.obj",
		mtl:"assets/models/target bola/3/3.mtl",
		mesh: null
	},
	pistol : {
		obj:"assets/models/pistol/pistol.obj",
		mtl:"assets/models/pistol/pistol.mtl",
		mesh: null
	},
	tembok : {
		obj:"assets/tembok/wall.obj",
		mtl:"assets/tembok/wall.mtl",
		mesh: null
	}
};

// Meshes index
var meshes = {};

//array bullet
var bullets = [];

function init(){
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000);
	clock = new THREE.Clock();

	
	loadingScreen.box.position.set(0,0,5);
	loadingScreen.camera.lookAt(loadingScreen.box.position);
	loadingScreen.scene.add(loadingScreen.box);

	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function(){
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
	};
    
    var textureLoader = new THREE.TextureLoader();
    floorTexture = new textureLoader.load("assets/floortexture/lantairumput.jpg")

	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(100,100, 150,150),
        new THREE.MeshPhongMaterial({color:0xffffff, map: floorTexture})
	);
	meshFloor.rotation.x -= Math.PI / 2; //90 derajat
    // scene.add(meshFloor);
    meshFloor.receiveShadow = true;
	scene.add(meshFloor);
    
    // LIGHTS
	ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);
	
	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(10,10,10);
	light.castShadow = true;
	//tidak menerangi yang lebih dekat dari 0.1 dan lebih dari 25 unit
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);
	
	// // Create mesh with these textures
	// crate = new THREE.Mesh(
	// 	new THREE.BoxGeometry(3,3,3),
	// Load models
	for( var _key in models ){
		(function(key){
			
			var mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function(materials){
				materials.preload();
				
				var objLoader = new THREE.OBJLoader(loadingManager);
				
				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function(mesh){
					
					mesh.traverse(function(node){
						if( node instanceof THREE.Mesh ){
							node.castShadow = true;
							node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;
					
				});
			});
			
		})(_key);
	}

	camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0,player.height,0));
	
	renderer = new THREE.WebGLRenderer();
    renderer.setSize(1280, 720);
    
    // Enable Shadows in the Renderer
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	// renderer.setClearColor( 0xffffff );

	document.body.appendChild(renderer.domElement);
	
	animate();
}

// Runs when all resources are loaded
function onResourcesLoaded(){
	
	// Clone models into meshes.
	meshes["target1"] = models.target1.mesh.clone();
	meshes["target2"] = models.target2.mesh.clone();
	meshes["target3"] = models.target3.mesh.clone();

	// atur posisi setiap mesh dan add
	meshes["target1"].position.set(15, 2, 15);
	scene.add(meshes["target1"]);
	meshes["target1"].scale.set(0.5, 0.5, 0.5);
	
	meshes["target2"].position.set(19, 2, 15);
	scene.add(meshes["target2"]);
	meshes["target2"].scale.set(0.5, 0.5, 0.5);
	
	meshes["target3"].position.set(23, 2, 13);
	scene.add(meshes["target3"]);
	meshes["target3"].scale.set(0.5, 0.5, 0.5);
		


	//Tembok
	meshes["tembok"] = models.tembok.mesh.clone();
	meshes["tembok"].position.set(-10, 0, 20);
	meshes["tembok"].scale.set(3,3,3);
	meshes["tembok"].rotation.y = Math.PI / 2;
	// meshes["tembok"].rotate.set(180);
	scene.add(meshes["tembok"]);

	//pistol
	meshes["pistol"] = models.pistol.mesh.clone();
	meshes["pistol"].position.set(-8, 0, 1);
	meshes["pistol"].scale.set(0.2, 0.2, 0.2);
	scene.add(meshes["pistol"]);
}


function animate(){
	frameCount++;
	if (frameCount % 100 == 0) {
		console.log(bullets.length + "     " + camera.position.x + ", " + camera.position.z + " scene " + scene.children.length);
	}
	
	// console.log(camera.position.x + ", " + camera.position.z);
	// // loading sampai ter render semua.
	if( RESOURCES_LOADED == false ){
		requestAnimationFrame(animate);
		
		loadingScreen.box.position.x -= 0.05;
		if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
		
		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}
	requestAnimationFrame(animate);
	var time = Date.now() * 0.0005;
	var delta = clock.getDelta();

	for(var index=0; index<bullets.length; index+=1){
		if( bullets[index] === undefined ) continue;
		if( bullets[index].alive == false ){
			bullets.splice(index,1);
			continue;
		}
		
		bullets[index].position.add(bullets[index].velocity);
	}
	
	// Keyboard move input
	if(keyboard[87]){ // W
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){ // D
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	
	// Keyboard turn inputs
	if(keyboard[37]){ // left arrow 
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[39]){ // right arrow 
		camera.rotation.y += player.turnSpeed;
	}
	//tembak
	if(keyboard[32] && player.canShoot <= 0){ // spacebar key
		// creates a bullet as a Mesh object
		var bullet = new THREE.Mesh(
			new THREE.SphereGeometry(0.5,8,8),
			new THREE.MeshBasicMaterial({color:0xffffff})
		);
		
		// peluru di ujung pistol
		bullet.position.set(
			meshes["pistol"].position.x -1,
			meshes["pistol"].position.y + 0.15,
			meshes["pistol"].position.z -0.3
		);
		
		// bullet speed
		bullet.velocity = new THREE.Vector3(
			-Math.sin(camera.rotation.y),
			0,
			Math.cos(camera.rotation.y)
		);
		
		// after 1000ms, set alive to false and remove from scene
		// setting alive to false flags our update code to remove
		// the bullet from the bullets array
		bullet.alive = true;
		setTimeout(function(){
			bullet.alive = false;
			scene.remove(bullet);
		}, 1000);
		
		// add to scene, array, and delay set @frame
		bullets.push(bullet);
		scene.add(bullet);
		player.canShoot = 100;
	}
	if(player.canShoot > 0) player.canShoot -= 1;

	//set posisi camera agar seakan di tangan user
	meshes["pistol"].position.set(
		camera.position.x - Math.sin(camera.rotation.y + Math.PI/6) * 0.75,
		camera.position.y - 0.5 + Math.sin(time*4 + camera.position.x + camera.position.z)*0.01,
		camera.position.z + Math.cos(camera.rotation.y + Math.PI/6) * 0.75
	);
	meshes["pistol"].rotation.set(
		camera.rotation.x,
		camera.rotation.y - Math.PI -1.5,
		camera.rotation.z
	);

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