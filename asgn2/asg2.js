// Shaders

// Input: an array of points comes from javascript.
// In this example, think of this array as the variable a_Position;
// Q: Why a_Position is not an array?
// A: Because the GPU process every vertex in parallel
// The language that we use to write the shaders is called GLSL

// Output: sends "an array of points" to the rasterizer.
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }
`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`

//variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let angleX = 225;
let angleY = 0;
let globalRotateX = 0;
let globalRotateY = 0;
let giveCheese = false;
let animation = true;


let rightHaunch = 0;
let leftHaunch = 0;
let backFeet = 0;
let tailJoint = 0;
let rightArm = 0;
let rightPaw = 0;
let leftArm = 0;
let leftPaw = 0;
let bodyJoint = 0;
let headJoint = 0;
let earJoint = 0;
let noseJoint = 0;
let blink = 0;


function UI_Stuff(){
  document.getElementById("angleSlide").addEventListener("input", function(){globalRotateX = this.value;});
  document.getElementById("angleSlide2").addEventListener("input", function(){globalRotateY = this.value;});
  document.getElementById("rightHaunch").addEventListener("mousemove", function(){rightHaunch = this.value;});
  document.getElementById("backFeet").addEventListener("mousemove", function(){backFeet = this.value;});
  document.getElementById("leftHaunch").addEventListener("mousemove", function(){leftHaunch = this.value;});
  document.getElementById("tailJoint").addEventListener("mousemove", function(){tailJoint = this.value;});
  document.getElementById("rightArm").addEventListener("mousemove", function(){rightArm = this.value;});
  document.getElementById("rightPaw").addEventListener("mousemove", function(){rightPaw = this.value;});
  document.getElementById("leftArm").addEventListener("mousemove", function(){leftArm = this.value;});
  document.getElementById("leftPaw").addEventListener("mousemove", function(){leftPaw = this.value;});
  document.getElementById("bodyJoint").addEventListener("mousemove", function(){bodyJoint = this.value;});
  document.getElementById("HeadJoint").addEventListener("mousemove", function(){headJoint = this.value;});
  document.getElementById("noseJoint").addEventListener("mousemove", function(){noseJoint = this.value;});
  document.getElementById("earJoint").addEventListener("mousemove", function(){earJoint = this.value;});
  document.getElementById("animationOn").addEventListener("click", function(){animation = true;});
  document.getElementById("animationOff").addEventListener("click", function(){animation = false;});
  document.getElementById("giveCheese").addEventListener("click", function(){giveCheese = !giveCheese;});
}

function connectVariablesToGLSL() {
  // Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log("Failed to intialize shaders.");
		return;
	}

	// Get the storage location of a_Position
	a_Position = gl.getAttribLocation(gl.program, "a_Position");
	if (a_Position < 0) {
		console.log("Failed to get the storage location of a_Position");
		return;
	}

	// Get the storage location of u_FragColor
	u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
	if (!u_FragColor) {
		console.log("Failed to get the storage location of u_FragColor");
		return;
	}

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  let identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function main() {
  
	canvas = document.getElementById("webgl");
    gl = getWebGLContext(canvas, false)
	if (!gl) {
		console.log("Failed to get the rendering context for WebGL");
		return;
	}

    gl.enable(gl.DEPTH_TEST);
    connectVariablesToGLSL();
    UI_Stuff();

    canvas.onmousemove = function(ev) { 
    if (ev.buttons == 1) { 
    angleX += ev.movementX;
    angleY += ev.movementY; } };

    //canvas color
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    requestAnimationFrame(tick);
}

var startTime = performance.now()/1000;
var seconds = performance.now()/1000 - startTime;

function tick(){
    seconds = performance.now()/1000 - startTime;
    animate();
    renderAllShapes();
    requestAnimationFrame(tick);
}

function animate(){
  if(animation && !giveCheese){

    rightHaunch = (Math.max(-10*Math.sin(seconds), 0));
    
    leftHaunch = (Math.max(-10*Math.sin(seconds), 0));

    backFeet = (Math.min(-20*Math.sin(seconds), 40));

    blink = 0.1 * (0.5 + 0.5 * Math.sin(seconds));
    tailJoint = (Math.min(-30*Math.sin(seconds), 40));

    rightArm = (Math.max(40* -Math.sin(seconds), 0));
    rightPaw = (Math.max(90* -Math.sin(seconds), -40));
    leftArm = (Math.max(40* -Math.sin(seconds), 0));
    leftPaw = (Math.max(90* -Math.sin(seconds), -40));

    headJoint = (Math.max(30*Math.sin(seconds), 0));
    bodyJoint = (Math.min(-15*Math.sin(seconds), 0));

    noseJoint = (5*Math.sin(seconds*8));
    earJoint = (-5*Math.sin(seconds*6));
  }else if (animation && giveCheese){
    //wip
    rightHaunch = (Math.max(-10*Math.sin(seconds), 0));
  }
}

function renderAllShapes(){
  var ren = new Matrix4().rotate(angleX, 0, 1, 0).rotate(angleY, 1, 0, 0);
  ren.translate(-.25, 0.25, 0);
  ren.scale(0.6, 0.6, 0.6);
  ren.rotate(globalRotateX, 0, 1, 0);
  ren.rotate(globalRotateY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, ren.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  makeRat();
}

function makeRat(){
        //body
        let body = new Cube();
        body.color = [140, 135, 122, 1];
        body.matrix.setTranslate(0, 0, 0.0);
        body.matrix.rotate(bodyJoint, 0, 0, 1);
        placeholder_body = new Matrix4(body.matrix);
        body.matrix.rotate(10, 0, 0, 1);
        body.matrix.scale(.5, -1, 0.5);
        body.render();

        //head
        let head = new Cube();
        head.color = [140, 135, 122, 1];
        head.matrix = new Matrix4(placeholder_body);
        head.matrix.translate(-.2, 0, 0);
        head.matrix.rotate(headJoint, headJoint, 0, 1);
        placeholder_head = new Matrix4(head.matrix);
        head.matrix.scale(.5, .5, .5);
        head.render();

        //snout
        let snout = new Triangle();
        snout.color = [140, 135, 122, 1];
        snout.matrix = new Matrix4(placeholder_head);
        snout.matrix.translate(.18, 0.01, 0.1);
        snout.matrix.rotate(270, 0, 90, 1);
        snout.matrix.scale(.3, .2, .4);
        snout.render();

        //nose
        let nose = new Cube();
        nose.color = [0, 0, 0, 1];
        nose.matrix = new Matrix4(placeholder_head);
        nose.matrix.translate(-.24, .01, .22);
        nose.matrix.rotate(noseJoint, 0, 0, 1);
        nose.matrix.scale(.05, .05, .05);
        nose.render();

        //ears
        let ear1 = new Cube();
        ear1.color = [140, 135, 122, 1];
        ear1.matrix = new Matrix4(placeholder_head);
        ear1.matrix.translate(.25, .3, .3);
        ear1.matrix.rotate(earJoint, 0, 0, 1);
        tempEarMatrix = new Matrix4(ear1.matrix);
        ear1.matrix.scale(.05, .35, .35);
        ear1.render();
        //inner ear
        ear1.color = [255, 100, 100, 1];
        ear1.matrix = tempEarMatrix;
        ear1.matrix.translate(-.01, .03, .05);
        ear1.matrix.scale(.025, .25, .25);
        ear1.render();

        let ear2 = new Cube();
        ear2.color = [140, 135, 122, 1];
        ear2.matrix = new Matrix4(placeholder_head);
        ear2.matrix.translate(.3, .3, -.15);
        ear2.matrix.rotate(earJoint, 0, 0, 1);
        ear2.matrix.scale(-.05, .35, 0.35);
        ear2.render();
        //inner ear
        ear2.color = [255, 100, 100, 1];
        ear2.matrix = new Matrix4(placeholder_head);
        ear2.matrix.translate(.23, .33, -.1);
        ear2.matrix.rotate(earJoint, 0, 0, 1);
        ear2.matrix.scale(.025, .25, .25);
        ear2.render();
        //end ears
      
        //eyes
        let eye1 = new Cube();
        eye1.color = [0, 0, 0, 1];
        eye1.matrix = new Matrix4(placeholder_head);
        eye1.matrix.translate(-.05, .2, .05);
        eye1.matrix.scale(.1, 0.01+blink, .1);
        eye1.render();

        let eye2 = new Cube();
        eye2.color = [0, 0, 0, 1];
        eye2.matrix = new Matrix4(placeholder_head);
        eye2.matrix.translate(-.05, .2, .35);
        eye2.matrix.scale(.1, 0.01+blink, .1);
        eye2.render();
        //end eyes

        //legs
        //left haunch (leg)
        let haunch = new Cube();
        haunch.color = [140, 135, 122, 1];
        haunch.matrix = new Matrix4(placeholder_body);
        haunch.matrix.translate(.5, -.6, .0);
        haunch.matrix.rotate(-leftHaunch, 0, 0, 1);
        temphaunchMatrix = new Matrix4(haunch.matrix);
        haunch.matrix.rotate(-75, 0, 0, 1);
        haunch.matrix.scale(.4, -.4, -.1);
        haunch.render();

        let foot = new Cube();
        foot.color = [140, 135, 122, 1];
        foot.matrix = temphaunchMatrix;
        foot.matrix.translate(-.1, -0.4,0);
        foot.matrix.rotate(225, 0, 0, 1);
        foot.matrix.rotate(backFeet+65, 0, 0, 1);
        foot.matrix.scale(.15, -.4, -.1);
        foot.render();

        //right haunch (leg)
        haunch.color = [140, 135, 122, 1];
        haunch.matrix = new Matrix4(placeholder_body);
        haunch.matrix.translate(.5, -.6, .6);
        haunch.matrix.rotate(-rightHaunch, 0, 0, 1);
        temphaunchMatrix = new Matrix4(haunch.matrix);
        haunch.matrix.rotate(-75, 0, 0, 1);
        haunch.matrix.scale(.4, -.4, -.1);
        haunch.render();

        foot.color = [140, 135, 122, 1];
        foot.matrix = temphaunchMatrix;
        foot.matrix.translate(-.1,-.4,0);
        foot.matrix.rotate(225, 0, 0, 1);
        foot.matrix.rotate(backFeet+65, 0, 0, 1);
        foot.matrix.scale(.15, -.4, -.1);
        foot.render();

        //left paw (arm)
        haunch.color = [140, 135, 122, 1];
        haunch.matrix = new Matrix4(placeholder_body);
        haunch.matrix.translate(.05,  -.15, .05);
        haunch.matrix.rotate(leftArm - 45, 0, 0, 1);
        temphaunchMatrix = new Matrix4(haunch.matrix);
        haunch.matrix.scale(.15, -.3, -.1);
        haunch.render();

        foot.color = [140, 135, 122, 1];
        foot.matrix = temphaunchMatrix;
        foot.matrix.translate(0, -.2, 0);
        foot.matrix.rotate(leftPaw, -(2*leftPaw), leftPaw, 1);
        foot.matrix.rotate(-50, 0, 0, 1);
        foot.matrix.scale(.15, -.3, -.1);
        foot.render();

        //right paw (arm)
        haunch.color = [140, 135, 122, 1];
        haunch.matrix = new Matrix4(placeholder_body);
        haunch.matrix.translate(0.05,  -.15, .55);
        haunch.matrix.rotate(rightArm - 45, 0, 0, 1);
        temphaunchMatrix = new Matrix4(haunch.matrix);
        haunch.matrix.scale(.15, -.3, -.1);
        haunch.render();

        
        foot.color = [140, 135, 122, 1];
        foot.matrix = temphaunchMatrix;
        foot.matrix.translate(0, -.2, 0);
        foot.matrix.rotate(rightPaw, rightPaw * 2, -rightPaw, 1);
        foot.matrix.rotate(-50, 0, 0, 1);
        foot.matrix.scale(.15, -.3, -.1);
        foot.render();
        //end legs


        //tail
        let tail = new Cube();
        tail.color = [255, 100, 100, 1];//make pink
        tail.matrix = new Matrix4(placeholder_body);
        tail.matrix.translate(.6, -.8, .2);
        tail.matrix.rotate(tailJoint-50, 0, 0, 1);
        temptailMatrix = new Matrix4(tail.matrix);
        tail.matrix.scale(.1, .4, .1);
        tail.render();

        tail.color = [255, 100, 100, 1];
        tail.matrix = temptailMatrix
        tail.matrix.translate(0, .4, 0);
        tail.matrix.rotate(-tailJoint, -tailJoint - 30, 0, 1);
        temptailMatrix = new Matrix4(tail.matrix);
        tail.matrix.scale(.1, .4, .1);
        tail.render();

        let tailTip = new Triangle();
        tailTip.color = [255, 100, 100, 1];
        tailTip.matrix = new Matrix4(temptailMatrix);
        tailTip.matrix.translate(0, .4, 0);
        tailTip.matrix.rotate(tailJoint + 20, tailJoint, 0, 1);
        tailTip.matrix.scale(.1, .5, .1);
        tailTip.render();
        //end of tail
      
}
