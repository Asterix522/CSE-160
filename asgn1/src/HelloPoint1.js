// Vertex shader
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

// Fragment shader
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    
    void main() {
        gl_FragColor = v_Color;
    }
`;

// Global variables
var gl;
var canvas;
var currentShape = 'point';
var isDrawing = false;
var shapes = [];
var lastMousePos = {x: 0, y: 0};
var color = [1.0, 0.0, 0.0, 1.0];
var brushSize = 10.0;
var segments = 20;

function main() {
    canvas = document.getElementById('webgl');
    
    // Get WebGL context
    gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('Failed to get WebGL context');
        return;
    }
    
    // Initialize shaders
    if (!initShaders()) {
        console.log('Failed to initialize shaders');
        return;
    }
    
    // Set clear color to white
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial render
    render();
}

function initShaders() {
    // Create and compile vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, VSHADER_SOURCE);
    gl.compileShader(vertexShader);
    
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log('Vertex shader compile error:', gl.getShaderInfoLog(vertexShader));
        return false;
    }
    
    // Create and compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, FSHADER_SOURCE);
    gl.compileShader(fragmentShader);
    
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log('Fragment shader compile error:', gl.getShaderInfoLog(fragmentShader));
        return false;
    }
    
    // Create shader program
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
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    
    // Update slider displays
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

function onMouseDown(evt) {
    isDrawing = true;
    var pos = getMousePos(evt);
    lastMousePos = pos;
    addShape(pos.x, pos.y);
}

function onMouseMove(evt) {
    if (!isDrawing) return;
    
    var pos = getMousePos(evt);
    
    // Add shapes while dragging
    var dx = pos.x - lastMousePos.x;
    var dy = pos.y - lastMousePos.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0.03) {
        var steps = Math.max(1, Math.floor(distance / 0.03));
        for (var i = 1; i <= steps; i++) {
            var t = i / steps;
            var x = lastMousePos.x + dx * t;
            var y = lastMousePos.y + dy * t;
            addShape(x, y);
        }
        lastMousePos = pos;
    }
}

function onMouseUp() {
    isDrawing = false;
}

function setShape(shape) {
    currentShape = shape;
}

function clearCanvas() {
    shapes = [];
    render();
}

function addShape(x, y) {
    var vertices;
    var size = brushSize / 200; // Scale size for WebGL coordinates
    
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
                x, y + size, 0,           // top
                x - size, y - size, 0,    // bottom left
                x + size, y - size, 0     // bottom right
            ];
            shapes.push({type: 'triangle', vertices: vertices, color: color.slice()});
            break;
    }
    
    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var program = gl.program;
    
    // Get uniform locations
    var u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
    var u_PointSize = gl.getUniformLocation(program, 'u_PointSize');
    var u_Color = gl.getUniformLocation(program, 'u_Color');
    var a_Position = gl.getAttribLocation(program, 'a_Position');
    
    // Create identity matrix
    var modelMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
    
    // Draw all shapes
    shapes.forEach(function(shape) {
        // Create vertex buffer
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.vertices), gl.STATIC_DRAW);
        
        // Set position attribute
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        
        // Set uniforms
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);
        gl.uniform1f(u_PointSize, shape.size || brushSize);
        gl.uniform4fv(u_Color, shape.color);
        
        // Draw based on shape type
        if (shape.type === 'point') {
            gl.drawArrays(gl.POINTS, 0, 1);
        } else if (shape.type === 'circle') {
            gl.drawArrays(gl.LINE_LOOP, 0, shape.vertices.length / 3);
        } else if (shape.type === 'triangle') {
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        
        // Clean up
        gl.deleteBuffer(vertexBuffer);
    });
}

// Update UI displays
document.addEventListener('DOMContentLoaded', function() {
    // Set initial values for displays
    document.getElementById('segmentsValue').textContent = segments;
    document.getElementById('sizeValue').textContent = brushSize;
});