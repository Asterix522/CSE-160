//Shaders
var VERTEX_SHADER = `
    precision mediump float;

    attribute vec3 a_Position;
    attribute vec3 a_Color;
    attribute vec2 a_UV;

    varying vec3 v_Color;
    varying vec2 v_UV;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;

    void main() {
        v_Color = a_Color;
        v_UV = a_UV;
        gl_Position = u_projectionMatrix * u_viewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
    }
`;

var FRAGMENT_SHADER = `
    precision mediump float;

    varying vec3 v_Color;
    varying vec2 v_UV;

    uniform sampler2D u_Sampler;      //For cube texture (grass_block.png)
    uniform sampler2D u_GroundSampler; //For ground texture (block.jpg)
    uniform int u_UseGroundTexture;    //1 for ground, 0 for cube

    void main() {
        if (u_UseGroundTexture == 1) {
            //Use ground texture
            vec4 texColor = texture2D(u_GroundSampler, v_UV);
            gl_FragColor = texColor;
        } else {
            //Use cube texture (with fallback to color if UV is zero)
            if (v_UV.x > 0.0 || v_UV.y > 0.0) {
                vec4 texColor = texture2D(u_Sampler, v_UV);
                gl_FragColor = texColor;
            } else {
                gl_FragColor = vec4(v_Color, 1.0);
            }
        }
    }
`;

//global variables
let shapes = [];
let camera = null;
let world = null;
let gl = null;
let texture = null;
let rats = [];
let ratDestroyed = [];
let seconds = 0;
let lastTimestamp = 0;
let keys = {};
let mouseLocked = false;

//audio variables
let squeakSound;
let audioEnabled = false;
let lastSqueakTime = 0;
let squeakCooldown = 500;

//performance optimization variables
let frameCount = 0;
let lastFpsLog = 0;
let camPos = [0, 0, 0]; 
let ratEncounterCount = 0;

function showRatMessage() {
    const messageArea = document.getElementById('message-area');
    const scoreDisplay = document.getElementById('score');
    
    //Increment counter
    ratEncounterCount++;
    
    //Show message
    messageArea.textContent = '"EUGH"';
    
    //Update score
    scoreDisplay.textContent = `R to respawn! kill count: ${ratEncounterCount}`;
    
    //Clear message after animation
    setTimeout(() => {
        messageArea.textContent = '';
    }, 2000);
}

function loadTextures() {
    //Load cube texture (grass_block.png)
    cubeTexture = gl.createTexture();
    let cubeImg = new Image();
    cubeImg.src = "textures/grass_block.png";
    
    cubeImg.onload = function() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cubeImg);

        let u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
        gl.uniform1i(u_Sampler, 0);
        
        //Check if both textures are loaded
        checkAllTexturesLoaded();
    };
    
    //Load ground texture (block.jpg)
    groundTexture = gl.createTexture();
    let groundImg = new Image();
    groundImg.src = "textures/block.jpg";
    
    groundImg.onload = function() {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, groundTexture);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); //Allow repeating for ground
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, groundImg);

        let u_GroundSampler = gl.getUniformLocation(gl.program, "u_GroundSampler");
        gl.uniform1i(u_GroundSampler, 1);
        
        //Check if both textures are loaded
        checkAllTexturesLoaded();
    };
    
    //Handle errors
    cubeImg.onerror = () => console.error("Failed to load grass_block.png");
    groundImg.onerror = () => console.error("Failed to load block.jpg");
}

let texturesLoaded = 0;
function checkAllTexturesLoaded() {
    texturesLoaded++;
    if (texturesLoaded >= 2) {
        requestAnimationFrame(animate);
    }
}


//Enable audio
document.addEventListener('click', function enableOnFirstClick() {
    if (!audioEnabled) {
        squeakSound = new Audio('assets/eugh.wav');
        squeakSound.volume = 0.3;
        audioEnabled = true;
    }
    document.removeEventListener('click', enableOnFirstClick);
}, { once: true });

function playSqueak() {
    if (!audioEnabled || !squeakSound) return;
    
    let now = Date.now();
    if (now - lastSqueakTime < squeakCooldown) return;
    
    squeakSound.currentTime = 0;
    squeakSound.play().catch(e => {});
    lastSqueakTime = now;
}


function createRats() {
    rats = [];
    ratDestroyed = [];
    
    //Reduced to 3 rats instead of 5 for better performance
    let ratPositions = [
        [3, -.8, 0],
        [4, -.8, -6],
        [-4, -.8, -4]
    ];
    
    ratPositions.forEach((pos, index) => {
        let rat = new Rat();
        rat.translate(pos[0], pos[1], pos[2]);
        rat.scale(0.5, 0.5, 0.5);
        rat.rotateY(Math.random() * 180);
        rat.addToScene(shapes);
        rats.push(rat);
        ratDestroyed.push(false);
    });
}

function destroyRat(ratIndex) {
    if (!rats[ratIndex] || ratDestroyed[ratIndex]) return;
    
    let rat = rats[ratIndex];
    let ratPos = rat.getPosition();
    
    //Create blood effect
    let blood = new ColoredCube([1, 0, 0]);
    blood.scale(0.5, 0.02, 0.5);
    blood.translate(ratPos[0], ratPos[1] - 1.7, ratPos[2]);
    shapes.push(blood);
    
    //Remove all rat parts efficiently (combined into one loop)
    let allParts = [
        ...(rat.bodyParts || []),
        ...(rat.headParts || []),
        ...(rat.faceParts || []),
        ...(rat.earParts || []),
        ...(rat.legParts || []),
        ...(rat.tailParts || [])
    ];
    
    allParts.forEach(part => {
        let index = shapes.indexOf(part);
        if (index > -1) shapes.splice(index, 1);
    });
    
    ratDestroyed[ratIndex] = true;
    showRatMessage();
    console.log(`Rabbit ${ratIndex + 1} destroyed! (${rats.filter(r => !ratDestroyed[rats.indexOf(r)]).length} remaining)`);
}

function respawnAllRats() {
    for (let i = 0; i < rats.length; i++) {
        if (rats[i] && ratDestroyed[i]) {
            let pos = [
                Math.random() * 10 - 5,
                0,
                Math.random() * 10 - 5
            ];
            rats[i].translate(0 + pos[0], 0, 0 +pos[2]);
            rats[i].rotateY(Math.random() * 180);
            rats[i].addToScene(shapes);
        }
    }
    ratDestroyed = new Array(rats.length).fill(false);
}


function animate(timestamp) {
    //FPS counter (optional - comment out for production)
    frameCount++;
    if (timestamp - lastFpsLog > 1000) {
        //console.log(`FPS: ${frameCount}`);
        frameCount = 0;
        lastFpsLog = timestamp;
    }
    
    let deltaTime = Math.min(timestamp - lastTimestamp, 100);
    lastTimestamp = timestamp;
    seconds += deltaTime / 1000;
    
    if (deltaTime > 0) {
        for (let i = 0; i < Math.floor(deltaTime / 16); i++) {
            camera.updatePhysics();
        }
    }
    
    updateMovement();

    //Update camera position cache
    if (camera) {
        let pos = camera.getPositionArray();
        camPos[0] = pos[0];
        camPos[1] = pos[1];
        camPos[2] = pos[2];
    }
    
    if (camera && rats.length > 0) {
        visibleRats = [];
        
        for (let i = 0; i < rats.length; i++) {
            if (!rats[i] || ratDestroyed[i]) continue;
            
            let ratPos = rats[i].getPosition();
            let dx = camPos[0] - ratPos[0];
            let dz = camPos[2] - ratPos[2];
            let distSq = dx*dx + dz*dz;
            
            //Only process rabbits within 25 units
            if (distSq < 625) {
                visibleRats.push(i);
                
                if (distSq < 300 || frameCount % 2 === 0) {
                    rats[i].updateAnimation(seconds);
                    rats[i].applyAnimations();
                }
                
                //Collision detection
                if (distSq < 0.64) { //0.8^2 = 0.64
                    let dy = Math.abs(camPos[1] - ratPos[1]);
                    if (dy < 1.5) {
                        playSqueak();
                        destroyRat(i);
                    }
                }
            }
        }
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (camera) {
        let u_viewMatrix = gl.getUniformLocation(gl.program, "u_viewMatrix");
        gl.uniformMatrix4fv(u_viewMatrix, false, camera.viewMatrix.elements);

        let u_projectionMatrix = gl.getUniformLocation(gl.program, "u_projectionMatrix");
        gl.uniformMatrix4fv(u_projectionMatrix, false, camera.projectionMatrix.elements);
    }

    //Draw all shapes
    for(let s of shapes){
        draw(s);
    }

    requestAnimationFrame(animate);
}


function draw(geometry) {
    //Skip drawing if object is too far away
    if (geometry.worldMatrix) {
        let pos = [
            geometry.worldMatrix.elements[12],
            geometry.worldMatrix.elements[13],
            geometry.worldMatrix.elements[14]
        ];
        
        let dx = pos[0] - camPos[0];
        let dz = pos[2] - camPos[2];
        let distSq = dx*dx + dz*dz;
        
        //Don't render objects beyond 30 units
        if (distSq > 900) return;
    }

    let finalMatrix = new Matrix4();
    if (geometry.worldMatrix) {
        finalMatrix = new Matrix4(geometry.worldMatrix);
    }
    
    finalMatrix.multiply(geometry.translationMatrix);
    finalMatrix.multiply(geometry.rotationMatrix);
    finalMatrix.multiply(geometry.scaleMatrix);

    let u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    gl.uniformMatrix4fv(u_ModelMatrix, false, finalMatrix.elements);

    //Set ground texture flag based on geometry type
    let u_UseGroundTexture = gl.getUniformLocation(gl.program, "u_UseGroundTexture");
    if (geometry instanceof square) {
        gl.uniform1i(u_UseGroundTexture, 1); //Use ground texture for square
    } else {
        gl.uniform1i(u_UseGroundTexture, 0); //Use cube texture for everything else
    }

    gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, geometry.vertices.length/8);
}
function updateMovement() {
    if (!camera) return;
    if (keys[87]) camera.moveForward();
    if (keys[83]) camera.moveBackwards();
    if (keys[65]) camera.moveLeft();
    if (keys[68]) camera.moveRight();
    if (keys[81]) camera.panLeft();
    if (keys[69]) camera.panRight();
}

function onMouseMove(ev) {
    if (!mouseLocked || !camera) return;
    //Pass both movementX and movementY
    camera.mouseMove(ev.movementX || 0, ev.movementY || 0);
}

function requestPointerLock() {
    document.getElementById("webgl").requestPointerLock();
}

function onPointerLockChange() {
    mouseLocked = document.pointerLockElement === document.getElementById("webgl");
}

function handleKeyDown(ev) {
    if (ev.keyCode === 32) { //Space
        camera.jump();
        ev.preventDefault();
    }
    if (ev.keyCode === 82) { //R
        respawnAllRats();
        ev.preventDefault();
    }
    //Add up/down look keys 
    if (ev.keyCode === 73) { //I key - look up
        camera.lookUp();
        ev.preventDefault();
    }
    if (ev.keyCode === 75) { //K key - look down
        camera.lookDown();
        ev.preventDefault();
    }
    //Include new keys in the preventDefault list
    if ([87, 83, 65, 68, 81, 69, 73, 75, 32, 82].includes(ev.keyCode)) {
        ev.preventDefault();
    }
}

function keydown(ev) {
    keys[ev.keyCode] = true;
    handleKeyDown(ev);
}

function keyup(ev) {
    keys[ev.keyCode] = false;
}

function main() {
    let canvas = document.getElementById("webgl");

    gl = getWebGLContext(canvas);
    if(!gl) {
        console.log("Failed to get WebGL context.")
        return -1;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.5, 0.7, 1.0, 1.0);
    //gl.clearColor(146/255, 108/255, 77/255, 1.0); //Black background for better contrast with textures
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(!initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER)) {
        console.log("Failed to compile and load shaders.")
        return -1;
    }

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;

    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 8*FLOAT_SIZE, 0*FLOAT_SIZE);
    gl.enableVertexAttribArray(a_Position);

    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 8*FLOAT_SIZE, 3*FLOAT_SIZE);
    gl.enableVertexAttribArray(a_Color);

    let a_UV = gl.getAttribLocation(gl.program, "a_UV");
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 8*FLOAT_SIZE, 6*FLOAT_SIZE);
    gl.enableVertexAttribArray(a_UV);

    let ground = new square();
    ground.translate(0, -0.5, 0);
    ground.scale(12, 12, 12);
    ground.rotateX(90);
    shapes.push(ground);

    //create sky
    /*
    let sky = new ColoredCube([135, 206, 235].map(c => c/255));
    sky.scale(12, 0.02, 12);
    sky.translate(0, 3.5, 0);
    shapes.push(sky);
    */

    //Create rats
    createRats();

    //Create world
    world = new World();
    let roomSize = 8;
    
    for (let x = -roomSize; x <= roomSize; x+=1) {
        world.addWall(x, roomSize, Math.random() * 4);
        world.addWall(x, -roomSize, Math.random() * 4);
    }
    
    for (let z = -roomSize; z <= roomSize; z+=1) {
        world.addWall(-roomSize, z, Math.random() * 4);
        world.addWall(roomSize, z, Math.random() * 4);
    }
    
    world.addWall(0, 0, 2);
    world.addWall(2, 2, 1);
    world.addWall(-2, -2, 2);
    
    //console.log(`Created world with ${world.walls.length} walls`);

    //Create camera
    camera = new Camera(canvas.width/canvas.height, 0.1, 1000, world);

    //Set up event listeners
    document.onkeydown = keydown;
    document.onkeyup = keyup;
    
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", requestPointerLock);
    
    
canvas.addEventListener("mousedown", function(ev) {
    ev.preventDefault(); //Prevent default actions
    
    if (!camera) return;
        
    //Check which button was clicked
    //ev.button === 0 = left click
    //ev.button === 2 = right click
    if (ev.button === 0) { //Left click - place block in front (stack if block exists)
        let target = getGridSpaceInFront();
        
        if (target) {
            //Check if there's already a block at this X,Z position
            let highestY = getHighestBlockYAt(target.x, target.z);
            
            if (highestY !== null) {
                //There's a block here - stack on top
                target.y = highestY + 1; //Place one level higher  
            } 
            //Check if the specific space is occupied (shouldn't be if we calculated correctly)
            if (!world.isSpaceOccupied(target.x, target.y, target.z)) {
                world.addWall(target.x, target.z, 1, target.y);
                //console.log(`Block placed at (${target.x}, ${target.y}, ${target.z})`);
            } 
        }
        
    } else if (ev.button === 2) { //Right click - delete ENTIRE COLUMN at X,Z position
        let target = getGridSpaceInFront();
        
        if (target) {
            //console.log(`Right click - deleting ENTIRE COLUMN at grid (${target.x}, ?, ${target.z})`);
            
            let blocksDeleted = 0;
            
            //Loop backwards through walls array so we can remove multiple blocks safely
            for (let i = world.walls.length - 1; i >= 0; i--) {
                let wall = world.walls[i];
                let wallX = Math.round(wall.translationMatrix.elements[12]);
                let wallY = Math.round(wall.translationMatrix.elements[13]);
                let wallZ = Math.round(wall.translationMatrix.elements[14]);
                
                //Check if this block is at the target X,Z position (any Y)
                if (wallX === target.x && wallZ === target.z) {
                    
                    //Remove from shapes array
                    let shapeIndex = shapes.indexOf(wall);
                    if (shapeIndex > -1) {
                        shapes.splice(shapeIndex, 1);
                    }
                    
                    //Remove from world walls array
                    world.walls.splice(i, 1);
                    blocksDeleted++;
                    
                    //console.log(`   Deleted block at Y=${wallY}`);
                }
            }
            
            if (blocksDeleted > 0) {
                //console.log(`✅ Deleted entire column of ${blocksDeleted} block(s) at X=${target.x}, Z=${target.z}`);
            } else {
                console.log("No blocks found at that X,Z position");
            }
        }
    }
});

//Also prevent context menu from appearing on right-click
canvas.addEventListener("contextmenu", function(ev) {
    ev.preventDefault();
});
    
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("mozpointerlockchange", onPointerLockChange);
    document.addEventListener("webkitpointerlockchange", onPointerLockChange);

    //Load both textures
    loadTextures();
}

function getGridSpaceInFront() {
    if (!camera) return null;
    
    let pos = camera.getPositionArray();
    
    //Get camera direction (yaw only, ignore pitch for horizontal placement)
    let dirX = Math.sin(camera.yaw);
    let dirZ = Math.cos(camera.yaw);
    
    //Determine which direction has the strongest component
    let targetX = Math.round(pos[0]);
    let targetZ = Math.round(pos[2]);
    
    //Check which axis we're primarily facing
    if (Math.abs(dirX) > Math.abs(dirZ)) {
        //Facing mostly in X direction
        if (dirX > 0) {
            targetX = Math.floor(pos[0]) + 1; //Facing positive X
        } else {
            targetX = Math.ceil(pos[0]) - 1; //Facing negative X
        }
        targetZ = Math.round(pos[2]); //Keep Z aligned to grid
    } else {
        //Facing mostly in Z direction
        if (dirZ > 0) {
            targetZ = Math.floor(pos[2]) + 1; //Facing positive Z
        } else {
            targetZ = Math.ceil(pos[2]) - 1; //Facing negative Z
        }
        targetX = Math.round(pos[0]); //Keep X aligned to grid
    }
    
    //Y is at the player's feet level (rounded to nearest block height)
    let feetY = pos[1] - camera.playerHeight;
    let targetY = Math.round(feetY);
    
    return {
        x: targetX,
        y: targetY,
        z: targetZ
    };
}

//Helper function to find the highest Y at a given X,Z position
function getHighestBlockYAt(x, z) {
    let highestY = -Infinity;
    
    for (let wall of world.walls) {
        let wallX = Math.round(wall.translationMatrix.elements[12]);
        let wallY = Math.round(wall.translationMatrix.elements[13]);
        let wallZ = Math.round(wall.translationMatrix.elements[14]);
        
        if (wallX === x && wallZ === z) {
            if (wallY > highestY) {
                highestY = wallY;
            }
        }
    }
    
    return highestY === -Infinity ? null : highestY;
}
