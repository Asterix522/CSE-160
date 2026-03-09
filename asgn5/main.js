import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 7, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = true;
controls.maxPolarAngle = Math.PI / 2;
controls.minDistance = 3;
controls.maxDistance = 50;
controls.target.set(0, 2, 0);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const skyboxLoader = new THREE.CubeTextureLoader();
const skyboxTexture = skyboxLoader.load([
    'skybox/skybox_px.jpg',
    'skybox/skybox_nx.jpg',
    'skybox/skybox_py.jpg',
    'skybox/skybox_ny.jpg',
    'skybox/skybox_pz.jpg',
    'skybox/skybox_nz.jpg',
]);
scene.background = skyboxTexture;

const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xfff5d1, 1.2);
directionalLight.position.set(10, 20, 5);
directionalLight.castShadow = true;
directionalLight.receiveShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
const d = 15;
directionalLight.shadow.camera.left = -d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = -d;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffaa00, 1, 15);
pointLight.position.set(0, 20, 0);
pointLight.castShadow = true;
scene.add(pointLight);

const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x3a5f0b, 0.8);
scene.add(hemisphereLight);

const groundGeometry = new THREE.CircleGeometry(20, 32);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x588519,
    roughness: 0.8,
    metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
scene.add(ground);


const textureLoader = new THREE.TextureLoader();

function loadTexture(path) {
    try {
        const texture = textureLoader.load(path);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        return texture;
    } catch (error) {
        console.warn(`Could not load texture ${path}`);
        return null;
    }
}

const cubeTextures = [
    { map: loadTexture('textures/test.jpg')}
];

function randomColor() {
    const hue = Math.random();
    return new THREE.Color().setHSL(hue, 0.7, 0.5);
}

const MIN_Y_POSITION = 10.5;
const animatedObjects = [];

function createShape(type, pos, color = null, scale = 1, castShadow = true) {
    let geometry, material, mesh;
    
    const finalColor = color || randomColor();
    const useTexture = type === 'cube' && cubeTextures[0].map; 
    
    if (useTexture) {
        material = new THREE.MeshStandardMaterial({ 
            map: cubeTextures[0].map,
            roughness: 0.6,
            metalness: 0.1
        });
    } else {
        material = new THREE.MeshStandardMaterial({ 
            color: finalColor,
            roughness: 0.4,
            metalness: 0.1
        });
    }
    
    switch(type) {
        case 'cube':
            geometry = new THREE.BoxGeometry(1, 1, 1);
            break;
        case 'sphere':
            geometry = new THREE.SphereGeometry(0.6, 32, 32);
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
            break;
        case 'cone':
            geometry = new THREE.ConeGeometry(0.6, 1, 32);
            break;
        case 'torus':
            geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 64);
            material = new THREE.MeshStandardMaterial({ color: finalColor, roughness: 0.3, metalness: 0.3 });
            break;
        case 'torusKnot':
            geometry = new THREE.TorusKnotGeometry(0.4, 0.15, 64, 8);
            material = new THREE.MeshStandardMaterial({ color: finalColor, roughness: 0.2, metalness: 0.4 });
            break;
        case 'octahedron':
            geometry = new THREE.OctahedronGeometry(0.6);
            break;
        case 'dodecahedron':
            geometry = new THREE.DodecahedronGeometry(0.5);
            break;
        case 'icosahedron':
            geometry = new THREE.IcosahedronGeometry(0.5);
            break;
    }
    
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.scale.set(scale, scale, scale);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    
    const originalPos = pos.clone();
    
    animatedObjects.push({
        mesh: mesh,
        rotSpeed: 0.005 + Math.random() * 0.03,
        rotAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        orbitRadius: 4 + Math.random() * 8,
        orbitSpeed: 0.1 + Math.random() * 0.3,
        orbitAngle: Math.random() * Math.PI * 2,
        bobSpeed: 0.3 + Math.random() * 0.8,
        bobHeight: 1.5 + Math.random() * 3.0,
        originalY: pos.y,
    });
    
    return mesh;
}

const shapeTypes = ['cube', 'sphere', 'cylinder', 'cone', 'torus', 'torusKnot', 'octahedron', 'dodecahedron', 'icosahedron'];
const colors = [
    0xff5733, 0x33ff57, 0x3357ff, 0xff33f1, 0xffd733, 
    0x33fff5, 0xf533ff, 0xff8c33, 0x8c33ff, 0x33ff8c
];

for (let i = 0; i < 30; i++) {
    let x, y, z;
    
    if (i < 24) {
        const angle = (i / 24) * Math.PI * 2;
        const radius = 6;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = 12.5 + Math.sin(i * 2) * 0.8;
    } else {
        x = (Math.random() - 0.5) * 8;
        z = (Math.random() - 0.5) * 8;
        y = 12.5 + Math.random() * 3;
    }
    
    const type = shapeTypes[i % shapeTypes.length];
    const color = colors[i % colors.length];
    const scale = 0.7 + Math.random() * 0.6;
    
    const shape = createShape(type, new THREE.Vector3(x, y, z), color, scale);
    scene.add(shape);
}

const customModelGroup = new THREE.Group();

const bodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 8);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x44aa88 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.y = 1;
body.castShadow = true;
body.receiveShadow = true;
customModelGroup.add(body);

const headGeo = new THREE.SphereGeometry(0.6, 32);
const headMat = new THREE.MeshStandardMaterial({ color: 0xffaa88 });
const head = new THREE.Mesh(headGeo, headMat);
head.position.y = 2;
head.castShadow = true;
head.receiveShadow = true;
customModelGroup.add(head);

const eyeGeo = new THREE.SphereGeometry(0.15, 16);
const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
eyeL.position.set(-0.2, 2.1, 0.5);
eyeL.castShadow = true;
customModelGroup.add(eyeL);

const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
eyeR.position.set(0.2, 2.1, 0.5);
eyeR.castShadow = true;
customModelGroup.add(eyeR);

const hatGeo = new THREE.ConeGeometry(0.5, 0.8, 8);
const hatMat = new THREE.MeshStandardMaterial({ color: 0xff5533 });
const hat = new THREE.Mesh(hatGeo, hatMat);
hat.position.set(0, 2.5, 0);
hat.castShadow = true;
customModelGroup.add(hat);

const hatBallGeo = new THREE.SphereGeometry(0.15, 8);
const hatBallMat = new THREE.MeshStandardMaterial({ color: 0xffdd44 });
const hatBall = new THREE.Mesh(hatBallGeo, hatBallMat);
hatBall.position.set(0, 3.0, 0);
hatBall.castShadow = true;
customModelGroup.add(hatBall);

const armGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 6);
const armMat = new THREE.MeshStandardMaterial({ color: 0x44aa88 });

const armL = new THREE.Mesh(armGeo, armMat);
armL.position.set(-0.9, 1.5, 0);
armL.rotation.z = 0.3;
armL.rotation.x = 0.2;
armL.castShadow = true;
customModelGroup.add(armL);

const armR = new THREE.Mesh(armGeo, armMat);
armR.position.set(0.9, 1.5, 0);
armR.rotation.z = -0.3;
armR.rotation.x = -0.2;
armR.castShadow = true;
customModelGroup.add(armR);

customModelGroup.position.set(-4.1, 4, 0);
customModelGroup.scale.set(0.9, 0.9, 0.9);
customModelGroup.rotation.y = 210 * Math.PI / 4;
scene.add(customModelGroup);

animatedObjects.push({
    mesh: customModelGroup,
    type: 'float',
    originalY: customModelGroup.position.y
});

const particleCount = 500;
const particlesGeo = new THREE.BufferGeometry();
const particlesPos = new Float32Array(particleCount * 3);
const particlesColor = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    const r = 8 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta) * 0.5 + 12;
    const z = r * Math.cos(phi);
    
    particlesPos[i*3] = x;
    particlesPos[i*3+1] = y;
    particlesPos[i*3+2] = z;
    
    const color = new THREE.Color().setHSL(0.6 + Math.random()*0.3, 0.8, 0.6);
    particlesColor[i*3] = color.r;
    particlesColor[i*3+1] = color.g;
    particlesColor[i*3+2] = color.b;
}

particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlesPos, 3));
particlesGeo.setAttribute('color', new THREE.BufferAttribute(particlesColor, 3));

const particlesMat = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

function createTree(x, z) {
    const treeGroup = new THREE.Group();
    
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 2, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);
    
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
    
    const leaf1 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1, 8), leafMat);
    leaf1.position.y = 2.2;
    leaf1.castShadow = true;
    leaf1.receiveShadow = true;
    treeGroup.add(leaf1);
    
    const leaf2 = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.8, 8), leafMat);
    leaf2.position.y = 2.8;
    leaf2.castShadow = true;
    leaf2.receiveShadow = true;
    treeGroup.add(leaf2);
    
    const leaf3 = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 8), leafMat);
    leaf3.position.y = 3.3;
    leaf3.castShadow = true;
    leaf3.receiveShadow = true;
    treeGroup.add(leaf3);
    
    treeGroup.position.set(x, 0, z);
    treeGroup.scale.set(5, 5, 5);
    return treeGroup;
}

const treePositions = [
    [-7, -12], [15, 0], [-11, 9], [8, 12], [-15, 0], [9, -13]
];

treePositions.forEach(pos => {
    const tree = createTree(pos[0], pos[1]);
    scene.add(tree);
});

//candle
const candleGroup = new THREE.Group();
const candleBaseGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 16);
const candleBaseMat = new THREE.MeshStandardMaterial({ color: 0xffeedd, roughness: 0.3 });
const candleBase = new THREE.Mesh(candleBaseGeo, candleBaseMat);
candleBase.position.y = 0.6;
candleBase.castShadow = true;
candleBase.receiveShadow = true;
candleGroup.add(candleBase);

const wickGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 6);
const wickMat = new THREE.MeshStandardMaterial({ color: 0x332211 });
const wick = new THREE.Mesh(wickGeo, wickMat);
wick.position.y = 1.25;
wick.castShadow = true;
candleGroup.add(wick);

const flameGeo = new THREE.ConeGeometry(0.12, 0.25, 8);
const flameMat = new THREE.MeshStandardMaterial({ 
    color: 0xffaa33, 
    emissive: 0xff4400,
    transparent: true,
    opacity: 0.9
});
const flame = new THREE.Mesh(flameGeo, flameMat);
flame.position.y = 1.4;
flame.castShadow = true;
candleGroup.add(flame);

const candleLight = new THREE.PointLight(0xff6600, 2, 8);
candleLight.position.set(0, 1.3, 0);
candleLight.castShadow = true;
candleGroup.add(candleLight);

const glowGeo = new THREE.SphereGeometry(0.15, 8, 8);
const glowMat = new THREE.MeshBasicMaterial({ 
    color: 0xff5500, 
    transparent: true, 
    opacity: 0.3,
    blending: THREE.AdditiveBlending
});
const glow = new THREE.Mesh(glowGeo, glowMat);
glow.position.y = 1.4;
candleGroup.add(glow);

//smoke particles
const smokeGeo = new THREE.BufferGeometry();
const smokeCount = 30;
const smokePositions = new Float32Array(smokeCount * 3);
const smokeColors = new Float32Array(smokeCount * 3);

for (let i = 0; i < smokeCount; i++) {
    smokePositions[i*3] = 0;
    smokePositions[i*3+1] = 0;
    smokePositions[i*3+2] = 0;
    smokeColors[i*3] = 0.5;
    smokeColors[i*3+1] = 0.5;
    smokeColors[i*3+2] = 0.5;
}

smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
smokeGeo.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));

const smokeMat = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.NormalBlending,
    depthWrite: false
});

const smoke = new THREE.Points(smokeGeo, smokeMat);
smoke.visible = false;
candleGroup.add(smoke);

candleGroup.position.set(-1.9, 5, 0.5);
candleGroup.rotation.y = 0.5;
scene.add(candleGroup);

//candle state
let candleLit = true;
let blowoutTimer = 0;

animatedObjects.push({
    mesh: candleGroup,
    type: 'candle',
    flame: flame,
    light: candleLight,
    glow: glow,
    wick: wick,
    smoke: smoke,
    isLit: true
});

renderer.domElement.addEventListener('click', onClick, false);

function onClick(event) {
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const candleParts = [flame, candleBase, wick];
    const intersects = raycaster.intersectObjects(candleParts);
    
    if (intersects.length > 0 && candleLit) {
        blowOutCandle();
    }
}

function blowOutCandle() {
    candleLit = false;
    blowoutTimer = 0;
    
    flame.visible = false;
    glow.visible = false;
    candleLight.intensity = 0;
    
    const candleObj = animatedObjects.find(obj => obj.type === 'candle');
    if (candleObj) {
        candleObj.isLit = false;
        candleObj.smoke.visible = true;
    }
    
    wick.material.color.setHex(0x884422);
    wick.scale.set(1.2, 0.5, 1.2);
    
    setTimeout(() => {
        wick.scale.set(1, 1, 1);
    }, 200);
    
    window.dispatchEvent(new CustomEvent('candleStateChange', { detail: { isLit: false } }));
}

function relightCandle() {
    candleLit = true;
    
    flame.visible = true;
    glow.visible = true;
    candleLight.intensity = 2;
    
    const candleObj = animatedObjects.find(obj => obj.type === 'candle');
    if (candleObj) {
        candleObj.isLit = true;
        candleObj.smoke.visible = false;
    }
    
    wick.material.color.setHex(0x332211);
    
    window.dispatchEvent(new CustomEvent('candleStateChange', { detail: { isLit: true } }));
}

const loader = new GLTFLoader();

loader.load(
    './skybox1/sky.glb',
    function(gltf) {
        const model = gltf.scene;
        model.position.set(0, 10, 0);
        model.scale.set(50, 50, 50);
        model.rotation.y = -90 * Math.PI / 180;
        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        scene.add(model);
    },
    function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function(error) {
        console.error('Error loading GLB:', error);
    }
);

function loadTeaTable() {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(
        './public/TeaParty/uploads_files_4117529_teatable.mtl',
        function (materials) {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(
                './public/TeaParty/uploads_files_4117529_teatable.obj',
                function (object) {
                    object.position.set(0, 5.3, 0);
                    object.scale.set(0.4, 0.4, 0.4);
                    object.rotation.y = -0.5;
                    object.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    scene.add(object);
                },
                function (xhr) {
                    console.log('Tea table OBJ: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                },
                function (error) {
                    console.error('Error loading tea table OBJ:', error);
                }
            );
        },
        function (xhr) {
            console.log('Tea table MTL: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Error loading tea table MTL:', error);
        }
    );
}

function loadMonkey() {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(
        './public/bear/model.mtl',
        function (materials) {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(
                './public/bear/bear.obj',
                function (object) {
                    object.position.set(3, 4.6, 2.6);
                    object.scale.set(2.8, 2.8, 2.3);
                    object.rotation.y = 230 * (Math.PI / 180);
                    object.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    scene.add(object);
                },
                function (xhr) {
                    console.log('Monkey OBJ: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                },
                function (error) {
                    console.error('Error loading monkey OBJ:', error);
                }
            );
        },
        function (xhr) {
            console.log('Monkey MTL: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Error loading monkey MTL:', error);
        }
    );
}

loadMonkey();
loadTeaTable();

let clock = new THREE.Clock();

function animate() {
    const delta = clock.getDelta();
    const elapsedTime = performance.now() / 1000;
    
    animatedObjects.forEach(obj => {
        if (obj.type === 'float') {
            obj.mesh.position.y = obj.originalY + Math.sin(elapsedTime * 2) * 0.2;
        } 
        else if (obj.type === 'candle') {
            if (obj.isLit) {
                if (obj.flame) {
                    const flickerX = 1 + Math.sin(elapsedTime * 12) * 0.15 + Math.sin(elapsedTime * 20) * 0.1;
                    const flickerY = 1 + Math.sin(elapsedTime * 10) * 0.2 + Math.sin(elapsedTime * 18) * 0.1;
                    const flickerZ = 1 + Math.sin(elapsedTime * 12) * 0.15 + Math.sin(elapsedTime * 22) * 0.1;
                    
                    obj.flame.scale.set(flickerX, flickerY, flickerZ);
                    obj.flame.rotation.x = Math.sin(elapsedTime * 8) * 0.05;
                    obj.flame.rotation.z = Math.cos(elapsedTime * 9) * 0.05;
                }
                
                if (obj.light) {
                    const intensity = 2.0 + Math.sin(elapsedTime * 15) * 1.0 + Math.sin(elapsedTime * 25) * 0.5;
                    obj.light.intensity = intensity;
                    
                    const r = 1.0;
                    const g = 0.5 + Math.sin(elapsedTime * 10) * 0.1;
                    const b = 0.2 + Math.sin(elapsedTime * 12) * 0.1;
                    obj.light.color.setRGB(r, g, b);
                }
                
                if (obj.glow) {
                    obj.glow.scale.setScalar(1 + Math.sin(elapsedTime * 10) * 0.1);
                    obj.glow.material.opacity = 0.2 + Math.sin(elapsedTime * 8) * 0.1;
                }
            } else {
                if (obj.smoke && obj.smoke.visible) {
                    const positions = obj.smoke.geometry.attributes.position.array;
                    blowoutTimer += delta;
                    
                    for (let i = 0; i < positions.length; i += 3) {
                        if (positions[i+1] > 2.0) {
                            positions[i] = (Math.random() - 0.5) * 0.2;
                            positions[i+1] = 1.4;
                            positions[i+2] = (Math.random() - 0.5) * 0.2;
                        } else {
                            positions[i] += (Math.random() - 0.5) * 0.01;
                            positions[i+1] += 0.01 + Math.random() * 0.02;
                            positions[i+2] += (Math.random() - 0.5) * 0.01;
                        }
                    }
                    
                    obj.smoke.geometry.attributes.position.needsUpdate = true;
                    obj.smoke.material.opacity = 0.6 * Math.max(0, 1 - blowoutTimer / 10);
                }
            }
        }
        else {
            obj.mesh.rotateOnWorldAxis(obj.rotAxis, obj.rotSpeed * delta * 30);
            obj.orbitAngle += obj.orbitSpeed * delta;
            
            const orbitX = Math.cos(obj.orbitAngle) * obj.orbitRadius;
            const orbitZ = Math.sin(obj.orbitAngle) * obj.orbitRadius;
            const bobY = Math.sin(elapsedTime * obj.bobSpeed) * obj.bobHeight;
            
            obj.mesh.position.x = orbitX;
            obj.mesh.position.z = orbitZ;
            obj.mesh.position.y = Math.max(obj.originalY + bobY, MIN_Y_POSITION);
        }
    });
    
    if (directionalLight) {
        const dirIntensity = 0.6 + Math.sin(elapsedTime * 0.25) * 0.6;
        directionalLight.intensity = Math.max(0.05, dirIntensity);
        
        const r = 0.9 + Math.sin(elapsedTime * 0.25) * 0.3;
        const g = 0.8 + Math.sin(elapsedTime * 0.25) * 0.3;
        const b = 1.0 + Math.sin(elapsedTime * 0.25) * 0.2;
        directionalLight.color.setRGB(r, g, b);
    }
    
    if (hemisphereLight) {
        const hemiIntensity = 0.4 + Math.sin(elapsedTime * 0.25) * 0.2;
        hemisphereLight.intensity = Math.max(0.1, hemiIntensity);
    }
    
    const positions = particles.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.01;
        
        if (positions[i] > 20) {
            positions[i] = 10.5;
            positions[i-1] = (Math.random() - 0.5) * 16;
            positions[i+1] = (Math.random() - 0.5) * 16;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
        relightCandle();
    }
});