var scene, camera, renderer, mesh;
var meshFloor, floorTexture;
var crate, crateTexture, crateNormalMap, crateBumpMap;

const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );

var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02 };
var USE_WIREFRAME = false;

function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
	
	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshPhongMaterial({color:0xff4444, wireframe:USE_WIREFRAME})
	);
	mesh.position.y += 1; // Move the mesh up 1 meter
	// The cube can have shadows cast onto it, and it can cast shadows
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	scene.add(mesh);
    
    var textureLoader = new THREE.TextureLoader();
    floorTexture = new textureLoader.load("floortexture/lantairumput.jpg")

	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(100,100, 100,100),
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
    crateTexture = textureLoader.load("crate0/crate0_diffuse.png");
	crateBumpMap = textureLoader.load("crate0/crate0_bump.png");
	crateNormalMap = textureLoader.load("crate0/crate0_normal.png");
	
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

	camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0,player.height,0));
	
	renderer = new THREE.WebGLRenderer();
    renderer.setSize(1280, 720);
    
    // Enable Shadows in the Renderer
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	document.body.appendChild(renderer.domElement);

	document.addEventListener( 'mousemove', onMouseMove, false );
	window.addEventListener( 'resize', onResize, false );

	animate();
}


function animate(){
	console.log("windowhalf x " + windowHalf.x + 
				"\n windowhalf y " + windowHalf.y +
				"\n mouse x " + mouse.x +
				"\n mouse y " + mouse.y);
	
	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;
	
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
	target.x = ( 1 - mouse.x ) * 0.002;
	target.y = ( 1 - mouse.y ) * 0.002;
	
	camera.rotation.x += 0.05 * ( target.y - camera.rotation.x );
	camera.rotation.y += 0.05 * ( target.x - camera.rotation.y );

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}
function onMouseMove( event ) {

	mouse.x = ( event.clientX - windowHalf.x );
	mouse.y = ( event.clientY - windowHalf.x );

}
function onResize( event ) {

	const width = window.innerWidth;
	const height = window.innerHeight;
  
  windowHalf.set( width / 2, height / 2 );
	
  camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize( width, height );
				
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;
