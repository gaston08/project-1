import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import GUI from 'lil-gui';

const hitSound = new Audio('/sounds/hit.mp3')

const gui = new GUI();
const obj = {
    createSphere,
}
gui.add(obj, 'createSphere').name('create sphere');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(1.5, 2, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
scene.add(directionalLight);

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

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


// physic world
// Setup our physics world
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
});

world.allowSleep = true;
world.broadphase = new CANNON.SAPBroadphase(world);

// Default material
const defaultMaterial = new CANNON.Material('default');
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
);
world.defaultContactMaterial = defaultContactMaterial;

// Create a static plane for the ground
const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC, // can also be achieved by setting the mass to 0
    shape: new CANNON.Plane(),
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);
// end

/**
 * create spheres
 */
const spheres = [];
const lapisLazuliMaterial = getMaterialFromTexture('lapis_lazuli');
const malachiteMaterial = getMaterialFromTexture('malachite');
const tigerEyeGemMaterial = getMaterialFromTexture('tiger_eye_gem');
const materials = [
    lapisLazuliMaterial,
    malachiteMaterial,
    tigerEyeGemMaterial,
]

function animate() {

    world.fixedStep();

    for (let sphere of spheres) {
        sphere.mesh.position.copy(sphere.body.position);
        sphere.mesh.quaternion.copy(sphere.body.quaternion);
    }

	requestAnimationFrame(animate);

	renderer.render(scene, camera);
}
animate();

function getMaterialFromTexture(textureName) {
    const texture = textureLoader.load(`/balls/${textureName}/basecolor.jpg`);
    texture.repeat.set(1, 1);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    texture.generateMipmaps = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    const textureNormal = textureLoader.load(`/balls/${textureName}/normal.jpg`);
    const textureRoughness = textureLoader.load(`/balls/${textureName}/roughness.jpg`);
    const textureAO = textureLoader.load(`/balls/${textureName}/ao.jpg`);
    const textureHeight = textureLoader.load(`/balls/${textureName}/height.png`);

    const material = new THREE.MeshStandardMaterial({ 
        map: texture,
    });

    material.normalMap = textureNormal;
    material.roughnessMap = textureRoughness;
    material.aoMap = textureAO;
    material.bumpMap = textureHeight;

    return material;
}

function createSphere() {
    let randomScale = getRandomArbitrary(0.1, 0.1);
    // random material
    const random = Math.floor(Math.random() * materials.length);

    const sphereGeometry = new THREE.SphereGeometry(randomScale, 100, 100);
    const mesh = new THREE.Mesh(sphereGeometry, materials[random]);
    
    const body = new CANNON.Body({
        mass: randomScale,
        shape: new CANNON.Sphere(randomScale),
        material: defaultMaterial,
        position: new CANNON.Vec3(
            getRandomArbitrary(-1, 1),
            2,
            getRandomArbitrary(-1, 1),
        )
    });
    body.allowSleep = true;

    body.addEventListener('collide', playSound);

    scene.add(mesh);
    world.addBody(body);

    spheres.push({
        mesh,
        body
    })
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function playSound(collision) {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal();

    let int = parseInt(impactStrength);
    let min = 0, max = 0;

    switch(int) {
        case 6:
            min = 0.8;
            max = 1;
            break;
        case 5:
            min = 0.6;
            max = 0.8;
            break;
        case 4:
            min = 0.4;
            max = 0.6;
            break;
        case 3:
            min = 0.2;
            max = 0.4;
            break;
        case 2:
            min = 0.1;
            max = 0.2;
            break;
        default:
            min = 0.01;
            max = 0.1;
    }

    let volume = getRandomArbitrary(min, max);
    hitSound.volume = volume;
    hitSound.currentTime = 0;
    hitSound.play();
}