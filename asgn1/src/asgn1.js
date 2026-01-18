//Vertex shader
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform float u_PointSize;
    uniform vec4 u_Color;
    varying vec4 v_Color;
    
    void main() {
        gl_Position = u_ModelMatrix * a_Position;
        gl_PointSize = u_PointSize;
        v_Color = u_Color;
    }
`;

//Fragment shader
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    
    void main() {
        gl_FragColor = v_Color;
    }
`;

//Global variables
var gl;
var canvas;
var currentShape = 'point';
var isDrawing = false;
var shapes = [];
var lastMousePos = {x: 0, y: 0};
var color = [1.0, 0.0, 0.0, 1.0];
var brushSize = 10.0;
var segments = 20;

//GLSL variable references
var a_Position;
var u_ModelMatrix;
var u_PointSize;
var u_Color;
var program;

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    setupEventListeners();
    renderAllShapes();
}

function setupWebGL() {
    canvas = document.getElementById('webgl');
    
    //Get WebGL context
    gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('Failed to get WebGL context');
        alert('WebGL not supported in this browser');
        return;
    }
    
    //Set clear color to white
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
}

function connectVariablesToGLSL() {
    //Initialize shaders
    if (!initShaders()) {
        console.log('Failed to initialize shaders');
        return;
    }
    
    program = gl.program;
    
    //Get attribute and uniform locations
    a_Position = gl.getAttribLocation(program, 'a_Position');
    u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
    u_PointSize = gl.getUniformLocation(program, 'u_PointSize');
    u_Color = gl.getUniformLocation(program, 'u_Color');
    
    //Enable the vertex attribute
    gl.enableVertexAttribArray(a_Position);
}

function initShaders() {
    //Create and compile vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, VSHADER_SOURCE);
    gl.compileShader(vertexShader);
    
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log('Vertex shader compile error:', gl.getShaderInfoLog(vertexShader));
        return false;
    }
    
    //Create and compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, FSHADER_SOURCE);
    gl.compileShader(fragmentShader);
    
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log('Fragment shader compile error:', gl.getShaderInfoLog(fragmentShader));
        return false;
    }
    
    //Create shader program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log('Program link error:', gl.getProgramInfoLog(shaderProgram));
        return false;
    }
    
    gl.useProgram(shaderProgram);
    gl.program = shaderProgram;
    
    return true;
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    //sliders
    document.getElementById('segments').addEventListener('input', function(e) {
        document.getElementById('segmentsValue').textContent = e.target.value;
    });
    
    document.getElementById('size').addEventListener('input', function(e) {
        document.getElementById('sizeValue').textContent = e.target.value;
    });
}

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var x = ((evt.clientX - rect.left) / canvas.width) * 2 - 1;
    var y = -(((evt.clientY - rect.top) / canvas.height) * 2 - 1);
    return {x: x, y: y};
}

function handleMouseDown(evt) {
    isDrawing = true;
    var pos = getMousePos(evt);
    lastMousePos = pos;
    handleClick(pos.x, pos.y);
}

function handleMouseMove(evt) {
    if (!isDrawing) return;
    
    var pos = getMousePos(evt);
    
    //Add shapes while dragging
    var dx = pos.x - lastMousePos.x;
    var dy = pos.y - lastMousePos.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0.03) {
        var steps = Math.max(1, Math.floor(distance / 0.03));
        for (var i = 1; i <= steps; i++) {
            var t = i / steps;
            var x = lastMousePos.x + dx * t;
            var y = lastMousePos.y + dy * t;
            handleClick(x, y);
        }
        lastMousePos = pos;
    }
}

function handleMouseUp() {
    isDrawing = false;
}

function handleClick(x, y) {
    addShape(x, y);
}

function setShape(shape) {
    currentShape = shape;
}

function clearCanvas() {
    shapes = [];
    renderAllShapes();
}

function addShape(x, y) {
    var vertices;
    var size = brushSize / 200; //scale
    
    switch(currentShape) {
        case 'point':
            vertices = [x, y, 0];
            shapes.push({type: 'point', vertices: vertices, color: color.slice(), size: brushSize});
            break;
            
        case 'circle':
            vertices = [];
            for (var i = 0; i < segments; i++) {
                var angle = (i / segments) * Math.PI * 2;
                vertices.push(x + Math.cos(angle) * size, y + Math.sin(angle) * size, 0);
            }
            shapes.push({type: 'circle', vertices: vertices, color: color.slice(), segments: segments});
            break;
            
        case 'triangle':
            vertices = [
                x, y + size, 0,           //top
                x - size, y - size, 0,    //bottom left
                x + size, y - size, 0     //bottom right
            ];
            shapes.push({type: 'triangle', vertices: vertices, color: color.slice()});
            break;
    }
    
    renderAllShapes();
}

function renderAllShapes() {
    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    //Create identity matrix
    var modelMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
    
    //Set model matrix uniform (same for all shapes)
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);
    
    //Draw all shapes
    shapes.forEach(function(shape) {
        drawShape(shape);
    });
}

function drawShape(shape) {
    //Create vertex buffer for this shape
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.vertices), gl.STATIC_DRAW);
    
    //Set position attribute
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    
    //Set uniforms specific to this shape
    gl.uniform1f(u_PointSize, shape.size || brushSize);
    gl.uniform4fv(u_Color, shape.color);
    
    //Draw based on shape type
    switch(shape.type) {
        case 'point':
            gl.drawArrays(gl.POINTS, 0, 1);
            break;
        case 'circle':
            gl.drawArrays(gl.LINE_LOOP, 0, shape.vertices.length / 3);
            break;
        case 'triangle':
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            break;
    }
    
    //Clean up buffer
    gl.deleteBuffer(vertexBuffer);
}

function drawRabbit() { //wayy too long to be this fugly
    //Switch to triangle mode
    setShape('triangle');
    
    //Clear existing canvas
    clearCanvas();
    
    //Save original color
    var originalColor = color.slice();

    //draw blue sky
    color = [0.5, 0.8, 1.0, 1.0]; //Light blue for sky
    var sky = [
        -1.0, 1.0, 0,
        1.0, 1.0, 0,
        -1.0, -0.3, 0
    ];
    shapes.push({type: 'triangle', vertices: sky, color: color.slice()});
    var sky2 = [
        1.0, 1.0, 0,
        1.0, -0.3, 0,
        -1.0, -0.3, 0
    ];
    shapes.push({type: 'triangle', vertices: sky2, color: color.slice()});

    //====== DRAW THE RABBIT'S BODY (main oval shape) ======
    color = [0.9, 0.9, 0.9, 1.0]; //Light grey for body
    
    //Center of body at (0, 0)
    
    //Top-left triangle
    var body1 = [
        -0.2, 0.0, 0,    //left-center
        -0.1, 0.15, 0,   //top-left
        0.0, 0.0, 0      //center
    ];
    shapes.push({type: 'triangle', vertices: body1, color: color.slice()});
    
    //Top-right triangle
    var body2 = [
        0.2, 0.0, 0,     //right-center
        0.0, 0.0, 0,     //center
        0.1, 0.15, 0     //top-right
    ];
    shapes.push({type: 'triangle', vertices: body2, color: color.slice()});
    
    //Bottom-left triangle
    var body3 = [
        -0.2, 0.0, 0,    //left-center
        0.0, 0.0, 0,     //center
        -0.1, -0.2, 0    //bottom-left
    ];
    shapes.push({type: 'triangle', vertices: body3, color: color.slice()});
    
    //Bottom-right triangle
    var body4 = [
        0.2, 0.0, 0,     //right-center
        0.1, -0.2, 0,    //bottom-right
        0.0, 0.0, 0      //center
    ];
    shapes.push({type: 'triangle', vertices: body4, color: color.slice()});

    //top-middle triangle
    var body5 = [
        -0.1, 0.15, 0,     //top-left
        0.1, 0.15, 0,    //top-right
        0.0, 0.0, 0      //center
    ];
    shapes.push({type: 'triangle', vertices: body5, color: color.slice()});

    //Bottom-middle triangle
    var body6 = [
        -0.1, -0.2, 0,     //right-center
        0.1, -0.2, 0,    //bottom-right
        0.0, 0.0, 0      //center
    ];
    shapes.push({type: 'triangle', vertices: body6, color: color.slice()});

    //draw rabbit head
    //Head (attached to right side of body)
    var head1 = [
        0.2, 0.0, 0,     //attachment to body
        0.35, 0.05, 0,   //top of snout
        0.35, -0.05, 0   //bottom of snout
    ];
    shapes.push({type: 'triangle', vertices: head1, color: color.slice()});
    
    //Second triangle to make head fuller
    var head2 = [
        0.2, 0.0, 0,
        0.35, -0.05, 0,
        0.25, -0.1, 0
    ];
    shapes.push({type: 'triangle', vertices: head2, color: color.slice()});
    
    //Third triangle for top of head
    var head3 = [
        0.2, 0.0, 0,
        0.25, 0.1, 0,
        0.35, 0.05, 0
    ];
    shapes.push({type: 'triangle', vertices: head3, color: color.slice()});
    
    //Right ear (on head)
    var earRight = [
        0.2, 0.0, 0,
        0.25, 0.1, 0,
        0.25, 0.4, 0  
    ];
    shapes.push({type: 'triangle', vertices: earRight, color: color.slice()});
    
    
    //Front left leg
    var legFrontLeft = [
        -0.1, -0.2, 0,  //top left
        -0.01, -0.2, 0,   //top right
        -0.05, -0.3, 0    //bottom middle
    ];
    shapes.push({type: 'triangle', vertices: legFrontLeft, color: color.slice()});
    
    //Back right leg
    var legBackRight = [
        0.01, -0.2, 0,  //top left
        0.1, -0.2, 0,   //top right
        0.05, -0.3, 0    //bottom middle
    ];
    shapes.push({type: 'triangle', vertices: legBackRight, color: color.slice()});
    
    //tail
    //draw white
    color = [1.0, 1.0, 1.0, 1.0]; //White for tail
    
    //Simple curly tail made of 3 triangles
    var tail1 = [
        -0.2, 0.0, 0,    //base on body
        -0.3, 0.05, 0,   //first curl
        -0.25, -0.05, 0  //bottom of curl
    ];
    shapes.push({type: 'triangle', vertices: tail1, color: color.slice()});
    
    var tail2 = [
        -0.3, 0.05, 0,
        -0.35, 0.0, 0,
        -0.25, -0.05, 0
    ];
    shapes.push({type: 'triangle', vertices: tail2, color: color.slice()});
    
    var tail3 = [
        -0.35, 0.0, 0,
        -0.3, -0.05, 0,
        -0.25, -0.05, 0
    ];
    shapes.push({type: 'triangle', vertices: tail3, color: color.slice()});
    
    //eyes
    color = [0.0, 0.0, 0.0, 1.0]; //Black for eyes
    
    var eyeLeft = [
        0.28, 0.02, 0,
        0.3, 0.05, 0,
        0.32, 0.02, 0
    ];
    shapes.push({type: 'triangle', vertices: eyeLeft, color: color.slice()});
    
    //nostril
    color = [0.8, 0.5, 0.6, 1.0]; //Dark pink for nostrils
    
    var nostrilLeft = [
        0.35, 0.0, 0,
        0.35, -0.02, 0,
        0.32, 0.0, 0
    ];
    shapes.push({type: 'triangle', vertices: nostrilLeft, color: color.slice()});

    
    //ground
    color = [0.5, 0.8, 0.3, 1.0]; //Green for grass
    
    var ground = [
        -1.0, -0.3, 0,
        1.0, -0.3, 0,
        -1.0, -1.0, 0
    ];
    shapes.push({type: 'triangle', vertices: ground, color: color.slice()});
    var ground2 = [
        1.0, -0.3, 0,
        1.0, -1.0, 0,
        -1.0, -1.0, 0
    ];
    shapes.push({type: 'triangle', vertices: ground2, color: color.slice()});
    
    //add some random grass
    color = [0.4, 0.7, 0.2, 1.0]; //Darker green for grass tufts
    
    for (var i = 0; i < 20; i++) {
        var x = Math.random() * 2 - 1;
        var y = -0.3 - Math.random() * 0.4;
        var tuft = [
            x, y, 0,
            x + 0.03, y, 0,
            x + 0.015, y + 0.05, 0
        ];
        shapes.push({type: 'triangle', vertices: tuft, color: color.slice()});
    }
    
    //abstract initials "AR"
    var letter_A = [
        .8, -0.8, 0,
        .75, -0.9, 0,
        .85, -0.9, 0
    ];
    shapes.push({type: 'triangle', vertices: letter_A, color: color.slice()});

    var letter_R = [
        .85, -0.8, 0,
        .85, -.85, 0,
        .93, -0.825, 0
    ];
    shapes.push({type: 'triangle', vertices: letter_R, color: color.slice()});
    var letter_RB = [
        .85, -0.85, 0,
        .85, -.9, 0,
        .87, -.9, 0
    ];
    shapes.push({type: 'triangle', vertices: letter_RB, color: color.slice()});
     var letter_RC = [
        .85, -0.85, 0,
        .9, -.9, 0,
        .93, -.9, 0
    ];
    shapes.push({type: 'triangle', vertices: letter_RC, color: color.slice()});
    

    color = originalColor;
    renderAllShapes();
}

//Update UI displays
document.addEventListener('DOMContentLoaded', function() {
    //Set initial values for displays
    document.getElementById('segmentsValue').textContent = segments;
    document.getElementById('sizeValue').textContent = brushSize;
});