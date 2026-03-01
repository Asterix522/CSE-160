//shaders
let VSHADER=`
      precision mediump float;
      attribute vec3 a_Position;
      attribute vec3 a_Normal;

      uniform mat4 u_ModelMatrix;
      uniform mat4 u_ViewMatrix;
      uniform mat4 u_ProjMatrix;
      uniform mat4 u_NormalMatrix;

      varying vec3 n;
      varying vec4 worldPos;

      void main() {
        worldPos = u_ModelMatrix * vec4(a_Position, 1.0);
        n = normalize(u_NormalMatrix * vec4(a_Normal, 0.0)).xyz;
        gl_Position = u_ProjMatrix * u_ViewMatrix * worldPos;
      }
  `;

let FSHADER=`
    precision mediump float;
    uniform vec3 u_Color;
    uniform vec3 u_ambientColor;
    uniform vec3 u_diffuseColor;
    uniform vec3 u_specularColor;

    uniform vec3 u_lightDirection;
    uniform vec3 u_lightLocation;      
    uniform vec3 u_lightLocation2;      
    uniform vec3 u_lightLocation3;      
    uniform vec3 u_lightColor1;         
    uniform vec3 u_lightColor2;  
    uniform vec3 u_lightColor3;         
    uniform vec3 u_spotDirection;       
    uniform float u_spotCutoff;          
    uniform float u_spotExponent;        
    uniform vec3 u_eyePosition;
    uniform float u_lightsOn;           

    varying vec3 n;
    varying vec4 worldPos;

    vec3 calcAmbient(){
        return u_ambientColor * u_Color;
    }

    vec3 calcDiffuse(vec3 l, vec3 n, vec3 lightColor, vec3 dColor){
        float nDotL = max(dot(l, n), 0.0);
        return lightColor * dColor * u_Color * nDotL;
    }

    vec3 calcSpecular(vec3 r, vec3 v, vec3 lightColor){
        float rDotV = max(dot(r,v), 0.0);
        float rDotVPowS = pow(rDotV, 32.0);
        return lightColor * u_specularColor * u_Color * rDotVPowS;
    }

    float calcSpotlightFactor(vec3 lightDir, vec3 spotDir, float cutoff, float exponent) {
        float spotDot = dot(-lightDir, spotDir);
        if (spotDot > cutoff) {
            return pow(spotDot, exponent);
        }
        return 0.0;
    }

    void main() {
        vec3 l1 = normalize(u_lightDirection);
        vec3 l2 = normalize(u_lightLocation - worldPos.xyz);
        vec3 l3 = normalize(u_lightLocation2 - worldPos.xyz);
        vec3 l4 = normalize(u_lightLocation3 - worldPos.xyz);

        vec3 v = normalize(u_eyePosition - worldPos.xyz); 

        vec3 r1 = reflect(l1, n);
        vec3 r2 = reflect(l2, n);
        vec3 r3 = reflect(l3, n);
        vec3 r4 = reflect(l4, n);

        vec3 ambient = calcAmbient();

        if (u_lightsOn < 0.5) {
            gl_FragColor = vec4(ambient, 1.0);
            return;
        }

        float spotFactor = calcSpotlightFactor(l4, normalize(u_spotDirection), u_spotCutoff, u_spotExponent);

        vec3 diffuse1 = calcDiffuse(l1, n, vec3(1.0, 1.0, 1.0), u_diffuseColor);
        vec3 specular1 = calcSpecular(r1, -v, vec3(1.0, 1.0, 1.0));

        vec3 diffuse2 = calcDiffuse(l2, n, u_lightColor1, u_diffuseColor);
        vec3 specular2 = calcSpecular(r2, -v, u_lightColor1);
        
        vec3 diffuse3 = calcDiffuse(l3, n, u_lightColor2, u_diffuseColor);
        vec3 specular3 = calcSpecular(r3, -v, u_lightColor2);
        
        vec3 diffuse4 = calcDiffuse(l4, n, u_lightColor3, u_diffuseColor) * spotFactor;
        vec3 specular4 = calcSpecular(r4, -v, u_lightColor3) * spotFactor;

        vec3 v_Color = ambient + (diffuse1 + diffuse2 + diffuse3 + diffuse4) + 
                               (specular1 + specular2 + specular3 + specular4);
        gl_FragColor = vec4(v_Color, 1.0);
    }
`;

let VSHADER_NORMALS = `
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;
    
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;
    
    varying vec3 v_Color;
    
    void main() {
        vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);
        v_Color = abs(a_Normal);
        gl_Position = u_ProjMatrix * u_ViewMatrix * worldPos;
        gl_PointSize = 5.0;
    }
`;

let FSHADER_NORMALS = `
    precision mediump float;
    varying vec3 v_Color;
    void main() {
        gl_FragColor = vec4(v_Color, 1.0);
    }
`;

//varis
let modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();
let models = [];
let lightDirection = new Vector3([1.0, 1.0, 1.0]);
let lightLocation = new Vector3([0.0, 0.5, 1.0]);      
let lightLocation2 = new Vector3([0, 0, -3]);     
let lightLocation3 = new Vector3([4, 0.1, -4.0]);
let spotDirection = new Vector3([0, 1, 0]);
let spotCutoff = 0.8;
let spotExponent = 8.0;

let u_ModelMatrix, u_ViewMatrix, u_ProjMatrix, u_NormalMatrix;
let u_Color, u_ambientColor, u_diffuseColor, u_specularColor;
let u_lightDirection, u_lightLocation, u_lightLocation2, u_lightLocation3;
let u_lightColor1, u_lightColor2, u_lightColor3;
let u_spotDirection, u_spotCutoff, u_spotExponent;
let u_eyePosition, u_lightsOn;

let animationTime = 0;
let rat, carrot, cat;
let pointLightSphere, orbitingLightSphere, spotlightSphere;
let vertexBuffer, normalBuffer, indexBuffer;

let lightXSlider, lightYSlider, lightZSlider;
let light1RSlider, light1GSlider, light1BSlider;
let lightsToggle, normalsToggle;
let lightsAreOn = true;  
let showNormals = false;
let normalsProgram;
let normalBuffers = {};

let keyState = { 'w': false, 'a': false, 's': false, 'd': false, ' ': false };

function generateNormalPoints(model) {
    let vertices = [];
    let colors = [];
    
    for (let i = 0; i < model.vertices.length; i += 3) {
        let x = model.vertices[i];
        let y = model.vertices[i + 1];
        let z = model.vertices[i + 2];
        
        let nx = model.normals[i];
        let ny = model.normals[i + 1];
        let nz = model.normals[i + 2];
        
        let len = Math.sqrt(nx*nx + ny*ny + nz*nz);
        if (len > 0) {
            nx /= len;
            ny /= len;
            nz /= len;
        }
        
        let scale = 0.3;
        vertices.push(x + nx * scale);
        vertices.push(y + ny * scale);
        vertices.push(z + nz * scale);
        
        colors.push(Math.abs(nx));
        colors.push(Math.abs(ny));
        colors.push(Math.abs(nz));
    }
    
    return { vertices, colors };
}

function initNormalBuffers(model) {
    let buffers = {
        vertexBuffer: gl.createBuffer(),
        colorBuffer: gl.createBuffer()
    };
    
    let normalPoints = generateNormalPoints(model);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalPoints.vertices), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalPoints.colors), gl.STATIC_DRAW);
    
    return buffers;
}

function drawNormals() {
    if (!showNormals) return;
    
    gl.useProgram(normalsProgram);
    
    let a_Position = gl.getAttribLocation(normalsProgram, "a_Position");
    let a_Normal = gl.getAttribLocation(normalsProgram, "a_Normal");
    let u_ModelMatrix = gl.getUniformLocation(normalsProgram, "u_ModelMatrix");
    let u_ViewMatrix = gl.getUniformLocation(normalsProgram, "u_ViewMatrix");
    let u_ProjMatrix = gl.getUniformLocation(normalsProgram, "u_ProjMatrix");
    
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, camera.projectionMatrix.elements);
    
    for (let i = 0; i < models.length; i++) {
        let model = models[i];
        
        if (model === pointLightSphere || model === orbitingLightSphere || model === spotlightSphere) continue;
        
        if (!normalBuffers[i]) {
            normalBuffers[i] = initNormalBuffers(model);
        }
        
        let modelMat = new Matrix4();
        modelMat.setTranslate(model.translate[0], model.translate[1], model.translate[2]);
        modelMat.rotate(model.rotate[0], 1, 0, 0);
        modelMat.rotate(model.rotate[1], 0, 1, 0);
        modelMat.rotate(model.rotate[2], 0, 0, 1);
        modelMat.scale(model.scale[0], model.scale[1], model.scale[2]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMat.elements);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[i].vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[i].colorBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);
        
        gl.drawArrays(gl.POINTS, 0, model.vertices.length / 3);
    }
    
    gl.useProgram(gl.program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let a_Position_main = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position_main, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position_main);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    let a_Normal_main = gl.getAttribLocation(gl.program, "a_Normal");
    gl.vertexAttribPointer(a_Normal_main, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal_main);
}

function drawModel(model) {
    modelMatrix.setIdentity();
    modelMatrix.translate(model.translate[0], model.translate[1], model.translate[2]);
    modelMatrix.rotate(model.rotate[0], 1, 0, 0);
    modelMatrix.rotate(model.rotate[1], 0, 1, 0);
    modelMatrix.rotate(model.rotate[2], 0, 0, 1);
    modelMatrix.scale(model.scale[0], model.scale[1], model.scale[2]);
    
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    
    gl.uniform3f(u_Color, model.color[0], model.color[1], model.color[2]);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indices, gl.STATIC_DRAW);
    
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
}

function initBuffer(attibuteName, n) {
    let shaderBuffer = gl.createBuffer();
    if(!shaderBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(gl.program, attibuteName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
}

function draw() {
    if (keyState.w) camera.moveForward();
    if (keyState.s) camera.moveBackwards();
    if (keyState.a) camera.moveLeft();
    if (keyState.d) camera.moveRight();
    if (keyState[' ']) camera.jump();

    camera.updatePhysics();

    animationTime += 0.05;
    if (rat) rat.updateAnimation(animationTime);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    //slider light
    let lightX = parseFloat(lightXSlider.value);
    let lightY = parseFloat(lightYSlider.value);
    let lightZ = parseFloat(lightZSlider.value);
    lightLocation = new Vector3([lightX, lightY, lightZ]);
    
    let light1R = parseFloat(light1RSlider.value);
    let light1G = parseFloat(light1GSlider.value);
    let light1B = parseFloat(light1BSlider.value);
    gl.uniform3f(u_lightColor1, light1R, light1G, light1B);
    
    if (lightsAreOn) {
        pointLightSphere.color = [light1R, light1G, light1B];
    }
    
    //orbiting light
    let orbitRadius = 1.5;
    let orbitSpeed = 0.2;
    let orbitHeight = 1.5;
    lightLocation2 = new Vector3([
        Math.cos(animationTime * orbitSpeed) * orbitRadius,
        orbitHeight,
        Math.sin(animationTime * orbitSpeed) * orbitRadius - 3
    ]);
    
    if (lightsAreOn) {
        let t = animationTime * 0.5;
        let r2 = 0.5 + 0.5 * Math.sin(t);
        let g2 = 0.5 + 0.5 * Math.sin(t + 2.0);
        let b2 = 0.5 + 0.5 * Math.sin(t + 4.0);
        
        gl.uniform3f(u_lightColor2, r2, g2, b2);
        orbitingLightSphere.color = [r2, g2, b2];
    }
    
    //spotlight
    lightLocation3 = new Vector3([4, 0.1, -4.0]);
    
    let targetPos = new Vector3([4, 3.0, -4.0]);
    spotDirection = new Vector3([
        targetPos.elements[0] - lightLocation3.elements[0],
        targetPos.elements[1] - lightLocation3.elements[1],
        targetPos.elements[2] - lightLocation3.elements[2]
    ]);
    spotDirection.normalize();
    
    gl.uniform3fv(u_lightLocation3, lightLocation3.elements);
    gl.uniform3fv(u_spotDirection, spotDirection.elements);
    gl.uniform3f(u_lightColor3, 1.0, 0.0, 1.0);
    
    if (lightsAreOn && spotlightSphere) {
        spotlightSphere.color = [1.0, 0.0, 1.0];
    }
    
    gl.uniform3fv(u_lightLocation, lightLocation.elements);
    gl.uniform3fv(u_lightLocation2, lightLocation2.elements);
    
    pointLightSphere.setTranslate(lightLocation.elements[0], lightLocation.elements[1], lightLocation.elements[2]);
    orbitingLightSphere.setTranslate(lightLocation2.elements[0], lightLocation2.elements[1], lightLocation2.elements[2]);
    spotlightSphere.setTranslate(lightLocation3.elements[0], lightLocation3.elements[1], lightLocation3.elements[2]);
    
    gl.uniform3fv(u_eyePosition, camera.eye.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, camera.projectionMatrix.elements);

    gl.useProgram(gl.program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    let a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);
    
    for(let m of models) {
        drawModel(m);
    }
    
    if (showNormals) {
        gl.disable(gl.DEPTH_TEST);
        drawNormals();
        gl.enable(gl.DEPTH_TEST);
    }

    requestAnimationFrame(draw);
}

function addModel(color, shapeType) {
    let model = null;
    switch (shapeType) {
        case "cube": model = new Cube(color); break;
        case "sphere": model = new Sphere(color); break;
    }
    if(model) models.push(model);
    return model;
}

function main() {
    canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl");
    if(!gl) {
        console.log("Failed to get webgl context");
        return -1;
    }

    lightXSlider = document.getElementById("lightX");
    lightYSlider = document.getElementById("lightY");
    lightZSlider = document.getElementById("lightZ");
    light1RSlider = document.getElementById("light1R");
    light1GSlider = document.getElementById("light1G");
    light1BSlider = document.getElementById("light1B");
    lightsToggle = document.getElementById("lightsToggle");
    normalsToggle = document.getElementById("normalsToggle");

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(!initShaders(gl, VSHADER, FSHADER)) {
        console.log("Failed to initialize shaders.");
        return -1;
    }

    normalsProgram = createProgram(gl, VSHADER_NORMALS, FSHADER_NORMALS);
    if (!normalsProgram) {
        console.log("Failed to initialize normals shader program.");
        return -1;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    u_Color = gl.getUniformLocation(gl.program, "u_Color");
    u_ambientColor = gl.getUniformLocation(gl.program, "u_ambientColor");
    u_diffuseColor = gl.getUniformLocation(gl.program, "u_diffuseColor");
    u_specularColor = gl.getUniformLocation(gl.program, "u_specularColor");
    u_lightDirection = gl.getUniformLocation(gl.program, "u_lightDirection");
    u_lightLocation = gl.getUniformLocation(gl.program, "u_lightLocation");
    u_lightLocation2 = gl.getUniformLocation(gl.program, "u_lightLocation2");
    u_lightLocation3 = gl.getUniformLocation(gl.program, "u_lightLocation3");
    u_lightColor1 = gl.getUniformLocation(gl.program, "u_lightColor1");
    u_lightColor2 = gl.getUniformLocation(gl.program, "u_lightColor2");
    u_lightColor3 = gl.getUniformLocation(gl.program, "u_lightColor3");
    u_spotDirection = gl.getUniformLocation(gl.program, "u_spotDirection");
    u_spotCutoff = gl.getUniformLocation(gl.program, "u_spotCutoff");
    u_spotExponent = gl.getUniformLocation(gl.program, "u_spotExponent");
    u_eyePosition = gl.getUniformLocation(gl.program, "u_eyePosition");
    u_lightsOn = gl.getUniformLocation(gl.program, "u_lightsOn");

    gl.uniform3f(u_ambientColor, 0.2, 0.2, 0.2);
    gl.uniform3f(u_diffuseColor, 0.8, 0.8, 0.8);
    gl.uniform3f(u_specularColor, 1.0, 1.0, 1.0);
    gl.uniform3fv(u_lightDirection, lightDirection.elements);
    gl.uniform1f(u_spotCutoff, spotCutoff);
    gl.uniform1f(u_spotExponent, spotExponent);
    gl.uniform1f(u_lightsOn, 1.0);

    lightsToggle.addEventListener("click", function() {
        lightsAreOn = !lightsAreOn;
        lightsToggle.textContent = lightsAreOn ? "LIGHTS: ON" : "LIGHTS: OFF";
        gl.uniform1f(u_lightsOn, lightsAreOn ? 1.0 : 0.0);
        
        if (!lightsAreOn) {
            pointLightSphere.color = [0.3, 0.3, 0.3];
            orbitingLightSphere.color = [0.3, 0.3, 0.3];
            if (spotlightSphere) spotlightSphere.color = [0.3, 0.3, 0.3];
        }
    });

    normalsToggle.addEventListener("click", function() {
        showNormals = !showNormals;
        normalsToggle.textContent = showNormals ? "NORMALS: ON" : "NORMALS: OFF";
    });

    //scene objects
    let sphere = addModel([1.0, 1.0, 1.0], "sphere");
    sphere.setTranslate(0.0, .2, -3);

    let spotlightTargetCube = addModel([1.0, 0.7, 0.7], "cube");
    spotlightTargetCube.setScale(0.8, 0.8, 0.8);
    spotlightTargetCube.setTranslate(4, 3, -4);

    let groundPlane = addModel([0.4, 0.7, 0.4], "cube");
    groundPlane.setScale(20.0, 0.1, 20.0); 
    groundPlane.setTranslate(0.0, -1, 0.0);

    //lights
    pointLightSphere = new Sphere([1.0, 0.8, 0.6]);
    pointLightSphere.setScale(0.1, 0.1, 0.1);
    pointLightSphere.setTranslate(lightLocation.elements[0], lightLocation.elements[1], lightLocation.elements[2]);
    models.push(pointLightSphere);
    
    orbitingLightSphere = new Sphere([0.4, 0.6, 1.0]);
    orbitingLightSphere.setScale(0.1, 0.1, 0.1);
    orbitingLightSphere.setTranslate(lightLocation2.elements[0], lightLocation2.elements[1], lightLocation2.elements[2]);
    models.push(orbitingLightSphere);
    
    spotlightSphere = new Sphere([1.0, 0.0, 1.0]);
    spotlightSphere.setScale(0.15, 0.15, 0.15);
    spotlightSphere.setTranslate(lightLocation3.elements[0], lightLocation3.elements[1], lightLocation3.elements[2]);
    models.push(spotlightSphere);

    //obj and rabbit
    rat = new Rat(); 
    rat.setPosition(0, -2.4, 1);
    rat.scale(0.4, 0.4, 0.4);
    rat.rotateY(Math.random() * 180);
    rat.addToScene(models); 

    loadOBJ('assets/carrot.obj', [1.0, 0.5, 0.0], function(model) {
        carrot = model;
        carrot.setTranslate(-1, -0.5, 1);
        carrot.setRotate(270, 1, 0, 0);
        carrot.setScale(.01, .01, .01);
        models.push(carrot);
    });

    loadOBJ('assets/cat.obj', [0.83, 0.83, 0.83], function(model) {
        cat = model;
        cat.setTranslate(2.2, -.9, 1);
        cat.setRotate(270, 0, 270, 0); 
        cat.setScale(.07, .07, .07);
        models.push(cat);
    });

    vertexBuffer = initBuffer("a_Position", 3);
    normalBuffer = initBuffer("a_Normal", 3);

    indexBuffer = gl.createBuffer();
    if(!indexBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    let world = {}; 
    camera = new Camera(canvas.width/canvas.height, 0.1, 1000, world);
    
    canvas.addEventListener("click", function() {
        canvas.requestPointerLock();
    });

    document.addEventListener("pointerlockchange", lockChange);
    document.addEventListener("mozpointerlockchange", lockChange);

    function lockChange() {
        if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
            document.addEventListener("mousemove", mouseMoveHandler);
        } else {
            document.removeEventListener("mousemove", mouseMoveHandler);
        }
    }

    function mouseMoveHandler(event) {
        camera.mouseMove(event.movementX, event.movementY);
    }

    draw();
}

// Keyboard controls
window.addEventListener("keydown", function(event) {
    switch (event.key) {
        case "w": case "W": keyState.w = true; event.preventDefault(); break;
        case "a": case "A": keyState.a = true; event.preventDefault(); break;
        case "s": case "S": keyState.s = true; event.preventDefault(); break;
        case "d": case "D": keyState.d = true; event.preventDefault(); break;
        case " ": keyState[' '] = true; event.preventDefault(); break;
    }
});

window.addEventListener("keyup", function(event) {
    switch (event.key) {
        case "w": case "W": keyState.w = false; event.preventDefault(); break;
        case "a": case "A": keyState.a = false; event.preventDefault(); break;
        case "s": case "S": keyState.s = false; event.preventDefault(); break;
        case "d": case "D": keyState.d = false; event.preventDefault(); break;
        case " ": keyState[' '] = false; event.preventDefault(); break;
    }
});