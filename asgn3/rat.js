// rat.js - Animated rat using individual ColoredCube instances with world transformation

class Rat {
    constructor() {
        // Arrays to store all rat part ColoredCubes
        this.bodyParts = [];
        this.headParts = [];
        this.faceParts = [];
        this.earParts = [];
        this.legParts = [];
        this.tailParts = [];
        
        // Local position offset (will be combined with world matrix)
        this.localPosition = [0, 2, 0]; // x, y, z position
        
        // World transformation matrix for the entire rat
        this.worldMatrix = new Matrix4();
        this.worldMatrix.setIdentity();
        
        // Animation variables
        this.rightHaunch = 0;
        this.leftHaunch = 0;
        this.backFeet = 0;
        this.tailJ = 0;
        this.rightArm = 0;
        this.rightPaw = 0;
        this.leftArm = 0;
        this.leftPaw = 0;
        this.bodyJ = 0;
        this.headJ = 0;
        this.earJ = 0;
        this.noseJ = 0;
        this.blink = 0;
        
        // Colors
        this.bodyColor = [255/255, 253/255, 208/255];
        this.pinkColor = [255/255, 255/255, 255/255];
        this.blackColor = [0, 0, 0];
        
        // Create all rat parts
        this.createRat();
    }

    getPosition() {
    // The rat's actual world position is at the translation components of the worldMatrix
    // plus the localPosition, but we need to see what's actually in the matrix
    
    // First, let's see what's in the worldMatrix
    let worldX = this.worldMatrix.elements[12];
    let worldY = this.worldMatrix.elements[13];
    let worldZ = this.worldMatrix.elements[14];
    
    // The localPosition is an offset that gets added in applyAnimations
    // So the final position is worldMatrix translation + localPosition
    return [
        worldX + this.localPosition[0],
        worldY + this.localPosition[1],
        worldZ + this.localPosition[2]
    ];
}

    // World transformation methods
    translate(x, y, z) {
        this.worldMatrix.translate(x, y, z);
    }
    
    rotate(angle, x, y, z) {
        this.worldMatrix.rotate(angle, x, y, z);
    }
    
    rotateX(angle) {
        this.worldMatrix.rotate(angle, 1, 0, 0);
    }
    
    rotateY(angle) {
        this.worldMatrix.rotate(angle, 0, 1, 0);
    }
    
    rotateZ(angle) {
        this.worldMatrix.rotate(angle, 0, 0, 1);
    }
    
    scale(x, y, z) {
        this.worldMatrix.scale(x, y, z);
    }
    
    setPosition(x, y, z) {
        this.worldMatrix.setTranslate(x, y, z);
    }
    
    setLocalPosition(x, y, z) {
        this.localPosition = [x, y, z];
    }
    
    createRat() {
        // ============ BODY ============
        let body = new ColoredCube(this.bodyColor);
        this.bodyParts.push(body);
        
        // ============ HEAD ============
        let head = new ColoredCube(this.bodyColor);
        this.headParts.push(head);
        
        // ============ EARS ============
        // Ear 1 (right side)
        let ear1 = new ColoredCube(this.bodyColor);
        this.earParts.push(ear1);
        
        // Ear 2 (left side)
        let ear2 = new ColoredCube(this.bodyColor);
        this.earParts.push(ear2);
        
        // ============ EYES ============
        let eye1 = new ColoredCube(this.blackColor);
        this.faceParts.push(eye1);
        
        let eye2 = new ColoredCube(this.blackColor);
        this.faceParts.push(eye2);
        
        // ============ LEGS ============
        // Left haunch (leg)
        let leftHaunch = new ColoredCube(this.bodyColor);
        this.legParts.push(leftHaunch);
        
        // Left foot
        let leftFoot = new ColoredCube(this.bodyColor);
        this.legParts.push(leftFoot);
        
        // Right haunch (leg)
        let rightHaunch = new ColoredCube(this.bodyColor);
        this.legParts.push(rightHaunch);
        
        // Right foot
        let rightFoot = new ColoredCube(this.bodyColor);
        this.legParts.push(rightFoot);
        
        // Left arm
        let leftArm = new ColoredCube(this.bodyColor);
        this.legParts.push(leftArm);
        
        // Right arm
        let rightArm = new ColoredCube(this.bodyColor);
        this.legParts.push(rightArm);
        
        // ============ TAIL ============
        // Tail segment 1
        let tail1 = new ColoredCube(this.pinkColor);
        this.tailParts.push(tail1);
    }
    
    updateAnimation(seconds) {
        // Base walking animation
        this.rightHaunch = Math.max(-10 * Math.sin(seconds * 2), 0);
        this.leftHaunch = Math.max(-10 * Math.sin(seconds * 2), 0);
        this.backFeet = Math.min(-20 * Math.sin(seconds * 2), 40);
        this.blink = 0.1 * (0.5 + 0.5 * Math.sin(seconds));
        this.tailJ = Math.min(-30 * Math.sin(seconds * 2), 40);
        this.rightArm = Math.max(40 * -Math.sin(seconds * 2), 0);
        this.rightPaw = Math.max(90 * -Math.sin(seconds * 2), -40);
        this.leftArm = Math.max(40 * -Math.sin(seconds * 2), 0);
        this.leftPaw = Math.max(90 * -Math.sin(seconds * 2), -40);
        this.headJ = Math.max(30 * Math.sin(seconds), 0);
        this.bodyJ = Math.min(-15 * Math.sin(seconds), 0);
        this.noseJ = 5 * Math.sin(seconds * 8);
        this.earJ = -5 * Math.sin(seconds * 6);
        
        this.applyAnimations();
    }
    
    applyAnimations() {
        // Create base matrix that combines world transform with local position
        let baseMatrix = new Matrix4(this.worldMatrix);
        baseMatrix.translate(this.localPosition[0], this.localPosition[1], this.localPosition[2]);
        
        // ============ BODY ANIMATION ============
        if (this.bodyParts[0]) {
            // Store the world matrix in the cube for later use in draw()
            this.bodyParts[0].worldMatrix = new Matrix4(baseMatrix);
            
            // Reset local transformations
            this.bodyParts[0].translationMatrix = new Matrix4();
            this.bodyParts[0].rotationMatrix = new Matrix4();
            this.bodyParts[0].scaleMatrix = new Matrix4();
            
            // Apply local transformations
            this.bodyParts[0].translate(0, 0, 0);
            this.bodyParts[0].rotateZ(10 + this.bodyJ);
            this.bodyParts[0].scale(0.5, -1, 0.5);
        }
        
        // ============ HEAD ANIMATION ============
        if (this.headParts[0]) {
            this.headParts[0].worldMatrix = new Matrix4(baseMatrix);
            
            this.headParts[0].translationMatrix = new Matrix4();
            this.headParts[0].rotationMatrix = new Matrix4();
            this.headParts[0].scaleMatrix = new Matrix4();
            
            this.headParts[0].translate(-0.2, 1.5, 0);
            this.headParts[0].rotateZ(-this.headJ);
            this.headParts[0].scale(0.5, 0.5, 0.5);
        }
        
        // ============ FACE ANIMATIONS ============
        // Eyes
        if (this.faceParts[0]) {
            this.faceParts[0].worldMatrix = new Matrix4(baseMatrix);
            
            this.faceParts[0].translationMatrix = new Matrix4();
            this.faceParts[0].rotationMatrix = new Matrix4();
            this.faceParts[0].scaleMatrix = new Matrix4();
            
            this.faceParts[0].translate(-0.64, 1.7, -0.2);
            this.faceParts[0].rotateZ(-this.headJ);
            this.faceParts[0].scale(0.08, 0.01 + this.blink * 0.8, 0.08);
        }
        
        if (this.faceParts[1]) {
            this.faceParts[1].worldMatrix = new Matrix4(baseMatrix);
            
            this.faceParts[1].translationMatrix = new Matrix4();
            this.faceParts[1].rotationMatrix = new Matrix4();
            this.faceParts[1].scaleMatrix = new Matrix4();
            
            this.faceParts[1].translate(-0.64, 1.7, 0.2);
            this.faceParts[1].rotateZ(-this.headJ);
            this.faceParts[1].scale(0.08, 0.01 + this.blink * 0.8, 0.08);
        }
        
        // ============ EAR ANIMATIONS ============
        if (this.earParts[0]) {
            this.earParts[0].worldMatrix = new Matrix4(baseMatrix);
            
            this.earParts[0].translationMatrix = new Matrix4();
            this.earParts[0].rotationMatrix = new Matrix4();
            this.earParts[0].scaleMatrix = new Matrix4();
            
            this.earParts[0].translate(0.05, 2.3, 0.3);
            this.earParts[0].rotateZ(this.earJ);
            this.earParts[0].scale(0.05, 0.5, 0.15);
        }
        
        if (this.earParts[1]) {
            this.earParts[1].worldMatrix = new Matrix4(baseMatrix);
            
            this.earParts[1].translationMatrix = new Matrix4();
            this.earParts[1].rotationMatrix = new Matrix4();
            this.earParts[1].scaleMatrix = new Matrix4();
            
            this.earParts[1].translate(0.05, 2.3, -0.25);
            this.earParts[1].rotateZ(this.earJ);
            this.earParts[1].scale(0.05, 0.5, 0.15);
        }
        
        // ============ LEG ANIMATIONS ============
        // Left haunch
        if (this.legParts[0]) {
            this.legParts[0].worldMatrix = new Matrix4(baseMatrix);
            
            this.legParts[0].translationMatrix = new Matrix4();
            this.legParts[0].rotationMatrix = new Matrix4();
            this.legParts[0].scaleMatrix = new Matrix4();
            
            this.legParts[0].translate(0, -0.6, -0.6);
            this.legParts[0].rotateZ(-75 + this.leftHaunch);
            this.legParts[0].scale(0.4, -0.4, -0.1);
        }
        
        // Left foot
        if (this.legParts[1]) {
            this.legParts[1].worldMatrix = new Matrix4(baseMatrix);
            
            this.legParts[1].translationMatrix = new Matrix4();
            this.legParts[1].rotationMatrix = new Matrix4();
            this.legParts[1].scaleMatrix = new Matrix4();
            
            this.legParts[1].translate(-0.2, -1.0 + (this.backFeet/100), 0.6);
            this.legParts[1].rotateZ(225 + 65 + this.backFeet);
            this.legParts[1].scale(0.15, -0.4, -0.1);
        }
        
        // Right haunch
        if (this.legParts[2]) {
            this.legParts[2].worldMatrix = new Matrix4(baseMatrix);
            
            this.legParts[2].translationMatrix = new Matrix4();
            this.legParts[2].rotationMatrix = new Matrix4();
            this.legParts[2].scaleMatrix = new Matrix4();
            
            this.legParts[2].translate(0, -0.6, 0.6);
            this.legParts[2].rotateZ(-75 + this.rightHaunch);
            this.legParts[2].scale(0.4, -0.4, -0.1);
        }
        
        // Right foot
        if (this.legParts[3]) {
            this.legParts[3].worldMatrix = new Matrix4(baseMatrix);
            
            this.legParts[3].translationMatrix = new Matrix4();
            this.legParts[3].rotationMatrix = new Matrix4();
            this.legParts[3].scaleMatrix = new Matrix4();
            
            this.legParts[3].translate(-0.2, -1.0 + (this.backFeet/100), -0.6);
            this.legParts[3].rotateZ(225 + 65 + this.backFeet);
            this.legParts[3].scale(0.15, -0.4, -0.1);
        }
        
        // Left arm
        if (this.legParts[4]) {
            this.legParts[4].worldMatrix = new Matrix4(baseMatrix);
            
            this.legParts[4].translationMatrix = new Matrix4();
            this.legParts[4].rotationMatrix = new Matrix4();
            this.legParts[4].scaleMatrix = new Matrix4();
            
            this.legParts[4].translate(-0.35, 0.2, -0.6);
            this.legParts[4].rotateZ(-45 - this.leftArm);
            this.legParts[4].scale(0.15, -0.3, -0.1);
        }
        
        // Right arm
        if (this.legParts[5]) {
            this.legParts[5].worldMatrix = new Matrix4(baseMatrix);
            
            this.legParts[5].translationMatrix = new Matrix4();
            this.legParts[5].rotationMatrix = new Matrix4();
            this.legParts[5].scaleMatrix = new Matrix4();
            
            this.legParts[5].translate(-0.35, 0.2, 0.6);
            this.legParts[5].rotateZ(-45 - this.rightArm);
            this.legParts[5].scale(0.15, -0.3, -0.1);
        }
        
        // ============ TAIL ANIMATIONS ============
        if (this.tailParts[0]) {
            this.tailParts[0].worldMatrix = new Matrix4(baseMatrix);
            
            this.tailParts[0].translationMatrix = new Matrix4();
            this.tailParts[0].rotationMatrix = new Matrix4();
            this.tailParts[0].scaleMatrix = new Matrix4();
            
            this.tailParts[0].translate(0.6, -0.75, 0);
            this.tailParts[0].rotateZ(-50 + this.tailJ);
            this.tailParts[0].scale(0.2, 0.2, 0.2);
        }
    }
    
    addToScene(shapesArray) {
        // Add all rat parts to the shapes array
        shapesArray.push(...this.bodyParts);
        shapesArray.push(...this.headParts);
        shapesArray.push(...this.faceParts);
        shapesArray.push(...this.earParts);
        shapesArray.push(...this.legParts);
        shapesArray.push(...this.tailParts);
    }
}