import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
scene.add(directionalLight);


//const pointLight = new THREE.PointLight(0xffffff, 30, 0);
//pointLight.position.set(-3, 3, -3);
//scene.add(pointLight);
//
//const sphereSize = 1;
//const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
//scene.add( pointLightHelper );

const controls = new OrbitControls( camera, renderer.domElement );
//const size = 10;
//const divisions = 10;
//const gridHelper = new THREE.GridHelper(size, divisions);
//scene.add(gridHelper);

// three loader
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = () =>
{
    console.log('loading started');
}
loadingManager.onLoad = () =>
{
    console.log('loading finished');
}
loadingManager.onProgress = () =>
{
    console.log('loading progressing');
}
loadingManager.onError = () =>
{
    console.log('loading error');
}

const textureLoader = new THREE.TextureLoader(loadingManager);

const TilesCeramicTexture = textureLoader.load('/Wood_Herringbone_Tiles_004/Substance_Graph_BaseColor.jpg');
TilesCeramicTexture.repeat.set(4, 4);
TilesCeramicTexture.wrapS = THREE.RepeatWrapping;
TilesCeramicTexture.wrapT = THREE.RepeatWrapping;

TilesCeramicTexture.generateMipmaps = false;
TilesCeramicTexture.minFilter = THREE.NearestFilter;
TilesCeramicTexture.magFilter = THREE.NearestFilter;

const TilesCeramicTextureNormal = textureLoader.load('/Wood_Herringbone_Tiles_004/Substance_Graph_Normal.jpg');
const TilesCeramicTextureRoughness = textureLoader.load('/Wood_Herringbone_Tiles_004/Substance_Graph_Roughness.jpg');
const TilesCeramicTextureAOMap = textureLoader.load('/Wood_Herringbone_Tiles_004/Substance_Graph_AmbientOcclusion.jpg');
const TilesCeramicTextureHeight = textureLoader.load('/Wood_Herringbone_Tiles_004/Substance_Graph_Height.jpg');

const material = new THREE.MeshStandardMaterial({ 
    map: TilesCeramicTexture,
});

material.normalMap = TilesCeramicTextureNormal;
material.roughnessMap = TilesCeramicTextureRoughness;
material.aoMap = TilesCeramicTextureAOMap;
material.bumpMap = TilesCeramicTextureHeight;

const geometry = new THREE.PlaneGeometry(10, 10, 10, 10);

const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;

scene.add(plane);

const sphereGeometry = new THREE.SphereGeometry(0.5, 100, 100);
const sphere = new THREE.Mesh(sphereGeometry, material);
sphere.position.y = 0.5;
sphere.position.x = 1;
scene.add(sphere);

camera.position.set(1.5, 1, 0);
controls.update();

function animate() {
	requestAnimationFrame(animate);

	renderer.render(scene, camera);
}
animate();