import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js';


const colorapi = [
  {color: '#1563D6',name: 'Ice Blue'},
  {color: '#12124A',name: 'Purple'},
  {color: '#071263',name: 'Midnight'},
  {color: '#FF1F0F',name: 'Red'},
  {color: '#576856',name: 'Alpine Green'},
  {color: '#F1F2ED',name: 'Silver'},
  {color: '#FAE7CF',name: 'Gold'},
  {color: '#54524F',name: 'Graphite'},
  
]

function createcolors(array,appendto){
   array.forEach(function(el,i){
      console.log(el.color)
     const coloritem = document.createElement('div');
     coloritem.classList.add('color-item');
     coloritem.style.background = el.color;
     coloritem.title = el.name;
     appendto.appendChild(coloritem)
   })
}

createcolors(colorapi,document.querySelector('.colors-container'))

const scene = new THREE.Scene();
scene.background = new THREE.Color('white')
scene.fog = new THREE.Fog( 0xffffff, 0.015, 100 ); 

			const camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 0.1, 1000 );

			const renderer = new THREE.WebGLRenderer({
        antialias: true
      });
			renderer.setSize( window.innerWidth, window.innerHeight );
	    renderer.toneMapping = THREE.ACESFilmicToneMapping;
		  renderer.toneMappingExposure = 0.7;
			renderer.outputEncoding = THREE.sRGBEncoding;
			document.body.appendChild( renderer.domElement );

	window.addEventListener('resize', function()

	{

	renderer.setSize( window.innerWidth,  window.innerHeight );
	camera.aspect =  window.innerWidth /  window.innerHeight;
	camera.updateProjectionMatrix();
	} );


const geometry = new THREE.PlaneGeometry( 1000, 1000 );
const material = new THREE.MeshBasicMaterial( {color: 'white',side: THREE.DoubleSide,wireframe: false} );
const plane = new THREE.Mesh( geometry, material );
scene.add( plane );
plane.position.y = -4;
plane.rotation.x = Math.PI / 2

	const controls = new OrbitControls( camera, renderer.domElement );
controls.maxDistance = 8;
controls.minDistance = 2;
controls.enableDamping = true;
controls.dampingFactor = 0.035
controls.maxPolarAngle = Math.PI /1.7

const iphonematerials = [];

const loader = new GLTFLoader();
loader.load('https://assets.codepen.io/7014830/iphone.glb', (gltf) =>{
   const model = gltf.scene;
   scene.add(model);
  model.scale.set(1.5,1.5,1.5)
  

 
  model.traverse((child) =>{
   
    if(child.isMesh && child.material.name == 'Body'){
        iphonematerials.push(child.material)
     }   
    
     if(child.isMesh && child.material.name == 'Frame'){
       iphonematerials.push(child.material)
     }
    
     if(child.isMesh && child.material.name == 'Logo'){
       iphonematerials.push(child.material)
     }
    
     if(child.isMesh && child.material.name == 'Antenna'){
       iphonematerials.push(child.material)
     }
    
      if(child.isMesh && child.material.name == 'Frame2'){
       iphonematerials.push(child.material)
     }
     if(child.isMesh && child.material.name == 'Glass'){
       iphonematerials.push(child.material)
     }
    if(child.isMesh && child.material.name == 'Camera_Frame.001'){
      iphonematerials.push(child.material)
     }
     if(child.isMesh && child.material.name == 'Camera_Frame'){
      iphonematerials.push(child.material)
     }
  
    
  })
  
})

new RGBELoader().load('https://assets.codepen.io/7014830/studio.hdr',function(texture){
texture.mapping = THREE.EquirectangularReflectionMapping;

   scene.environment = texture;
})

window.addEventListener('dblclick', () =>{
   console.log(camera.position)
})

document.querySelectorAll('.color-item').forEach(function(el,i){
   document.querySelectorAll('.color-item')[i].addEventListener('click', (e) =>{
     iphonematerials.forEach(function(material,i){
  
material.color.set(new THREE.Color(e.target.style.background))

       anime({
         targets: camera.position,
         z: [camera.position.z,3.95],
         x: -2.62,
         delay: 10,
         duration: 500,
         easing: 'easeInOutCubic'
       })
       
       
     })
     
   })
})


			camera.position.z = 5;

function animate() {
				requestAnimationFrame( animate );
         
       controls.update();
        			
				renderer.render( scene, camera );
			};

			animate();