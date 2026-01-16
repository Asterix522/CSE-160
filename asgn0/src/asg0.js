// asg0.js - Console output only
var ctx;

function main() {
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    ctx = canvas.getContext('2d');
    
    var drawButton = document.getElementById('drawButton');
    drawButton.addEventListener('click', handleDrawEvent);
    
    var drawOperationButton = document.getElementById('drawOperationButton');
    drawOperationButton.addEventListener('click', handleDrawOperationEvent);
    
    handleDrawEvent();
}

function handleDrawEvent() {
    // Clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 400, 400);
    
    // Draw axes
    drawAxes();
    
    // Get vector values
    var x1 = parseFloat(document.getElementById('xCoord1').value);
    var y1 = parseFloat(document.getElementById('yCoord1').value);
    var x2 = parseFloat(document.getElementById('xCoord2').value);
    var y2 = parseFloat(document.getElementById('yCoord2').value);
    
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        alert("Please enter valid numbers for coordinates");
        return;
    }
    
    // Create and draw vectors
    var v1 = new Vector3([x1, y1, 0]);
    var v2 = new Vector3([x2, y2, 0]);
    
    drawVector(v1, "#ff4444");
    drawVector(v2, "#4444ff");
}

function handleDrawOperationEvent() {
    
    // Clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 400, 400);
    
    // Draw axes
    drawAxes();
    
    // Get vector values
    var x1 = parseFloat(document.getElementById('xCoord1').value);
    var y1 = parseFloat(document.getElementById('yCoord1').value);
    var x2 = parseFloat(document.getElementById('xCoord2').value);
    var y2 = parseFloat(document.getElementById('yCoord2').value);
    
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        alert("Please enter valid numbers for coordinates");
        return;
    }
    
    // Create vectors
    var v1 = new Vector3([x1, y1, 0]);
    var v2 = new Vector3([x2, y2, 0]);
    
    // Draw original vectors
    drawVector(v1, "#ff4444");
    drawVector(v2, "#4444ff");
    
    // Get operation and scalar
    var operation = document.getElementById('operation').value;
    var scalar = parseFloat(document.getElementById('scalar').value);
    
    // Perform operation and output to console
    switch(operation) {
        case 'add':
            var v3 = new Vector3(v1.elements);
            v3.add(v2);
            drawVector(v3, "#44ff44");
            break;
            
        case 'sub':
            var v3 = new Vector3(v1.elements);
            v3.sub(v2);
            drawVector(v3, "#44ff44");
            break;
            
        case 'mul':
            if (isNaN(scalar)) {
                alert("Please enter a valid scalar value");
                return;
            }
            var v3 = new Vector3(v1.elements);
            v3.mul(scalar);
            var v4 = new Vector3(v2.elements);
            v4.mul(scalar);
            drawVector(v3, "#44ff44");
            drawVector(v4, "#44ff44");
            break;
            
        case 'div':
            if (isNaN(scalar) || scalar === 0) {
                alert("Please enter a valid non-zero scalar value");
                return;
            }
            var v3 = new Vector3(v1.elements);
            v3.div(scalar);
            var v4 = new Vector3(v2.elements);
            v4.div(scalar);
            drawVector(v3, "#44ff44");
            drawVector(v4, "#44ff44");
            break;
            
        case 'mag':
            var mag1 = v1.magnitude();
            var mag2 = v2.magnitude();
            console.log("|v1| = " + mag1.toFixed(4));
            console.log("|v2| = " + mag2.toFixed(4));
            break;
            
        case 'norm':
            var norm1 = new Vector3(v1.elements);
            norm1.normalize();
            var norm2 = new Vector3(v2.elements);
            norm2.normalize();
            drawVector(norm1, "#44ff44");
            drawVector(norm2, "#44ff44");
            console.log("Magnitude of normalized v1 = " + norm1.magnitude().toFixed(4));
            console.log("Magnitude of normalized v2 = " + norm2.magnitude().toFixed(4));
            break;
            
        case 'angle':
            var dotProduct = Vector3.dot(v1, v2);
            var mag1 = v1.magnitude();
            var mag2 = v2.magnitude();
            
            if (mag1 === 0 || mag2 === 0) {
                alert("Cannot calculate angle for zero-length vectors");
                return;
            }
            
            var cosTheta = dotProduct / (mag1 * mag2);
            cosTheta = Math.max(-1, Math.min(1, cosTheta));
            var angleRad = Math.acos(cosTheta);
            var angleDeg = angleRad * (180 / Math.PI);
            
            console.log("Angle: " + angleDeg.toFixed(2));
            break;
            
        case 'area':
            var area = areaTriangle(v1, v2);
            console.log("Area: " + area.toFixed(2));
            break;
    }
    
}

function areaTriangle(v1, v2) {
    var crossProduct = Vector3.cross(v1, v2);
    var parallelogramArea = crossProduct.magnitude();
    var triangleArea = parallelogramArea / 2;
    
    return triangleArea;
}

function drawVector(v, color) {
    var centerX = 200;
    var centerY = 200;
    
    var x = v.elements[0] * 20;
    var y = -v.elements[1] * 20;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + x, centerY + y);
    ctx.stroke();
}

function drawAxes() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(400, 200);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(200, 0);
    ctx.lineTo(200, 400);
    ctx.stroke();
}