//rat.js - Rat model with reduced foot movement
class Rat {
    constructor() {
        //Arrays to store all rat part cubes
        this.bodyParts = [];
        this.headParts = [];
        this.faceParts = [];
        this.earParts = [];
        this.legParts = [];
        this.tailParts = [];
        
        //Local position offset (will be combined with world matrix)
        this.localPosition = [0, 2, 0]; //x, y, z position
        
        //World transformation matrix for the entire rat
        this.worldMatrix = new Matrix4();
        this.worldMatrix.setIdentity();
        
        //Store the base transformations separately
        this.baseTranslate = [0, 0, 0];
        this.baseRotate = [0, 0, 0];
        this.baseScale = [1, 1, 1];
        
        //Animation variables
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
        
        //Colors
        this.bodyColor = [255/255, 253/255, 208/255];
        this.pinkColor = [255/255, 255/255, 255/255];
        this.blackColor = [0, 0, 0];
        
        //Create all rat parts
        this.createRat();
    }

    getPosition() {
        return [
            this.baseTranslate[0] + this.localPosition[0],
            this.baseTranslate[1] + this.localPosition[1],
            this.baseTranslate[2] + this.localPosition[2]
        ];
    }

    translate(x, y, z) {
        this.baseTranslate[0] += x;
        this.baseTranslate[1] += y;
        this.baseTranslate[2] += z;
        this.updateWorldMatrix();
    }
    
    rotate(angle, x, y, z) {
        if (x === 1) this.baseRotate[0] += angle;
        if (y === 1) this.baseRotate[1] += angle;
        if (z === 1) this.baseRotate[2] += angle;
        this.updateWorldMatrix();
    }
    
    rotateX(angle) {
        this.baseRotate[0] += angle;
        this.updateWorldMatrix();
    }
    
    rotateY(angle) {
        this.baseRotate[1] += angle;
        this.updateWorldMatrix();
    }
    
    rotateZ(angle) {
        this.baseRotate[2] += angle;
        this.updateWorldMatrix();
    }
    
    scale(x, y, z) {
        this.baseScale[0] = x;
        this.baseScale[1] = y;
        this.baseScale[2] = z;
        this.updateWorldMatrix();
    }
    
    setPosition(x, y, z) {
        this.baseTranslate = [x, y, z];
        this.updateWorldMatrix();
    }
    
    setLocalPosition(x, y, z) {
        this.localPosition = [x, y, z];
    }
    
    updateWorldMatrix() {
        this.worldMatrix.setIdentity();
        this.worldMatrix.translate(this.baseTranslate[0], this.baseTranslate[1], this.baseTranslate[2]);
        this.worldMatrix.rotate(this.baseRotate[0], 1, 0, 0);
        this.worldMatrix.rotate(this.baseRotate[1], 0, 1, 0);
        this.worldMatrix.rotate(this.baseRotate[2], 0, 0, 1);
        this.worldMatrix.scale(this.baseScale[0], this.baseScale[1], this.baseScale[2]);
    }
    
    createRat() {
        let body = new Cube(this.bodyColor);
        this.bodyParts.push(body);
      
        let head = new Cube(this.bodyColor);
        this.headParts.push(head);
        
        let ear1 = new Cube(this.bodyColor);
        this.earParts.push(ear1);
        
        let ear2 = new Cube(this.bodyColor);
        this.earParts.push(ear2);
        
        let eye1 = new Cube(this.blackColor);
        this.faceParts.push(eye1);
        
        let eye2 = new Cube(this.blackColor);
        this.faceParts.push(eye2);
        
        let leftHaunch = new Cube(this.bodyColor);
        this.legParts.push(leftHaunch);
        
        let leftFoot = new Cube(this.bodyColor);
        this.legParts.push(leftFoot);
        
        let rightHaunch = new Cube(this.bodyColor);
        this.legParts.push(rightHaunch);
        
        let rightFoot = new Cube(this.bodyColor);
        this.legParts.push(rightFoot);
        
        let leftArm = new Cube(this.bodyColor);
        this.legParts.push(leftArm);

        let rightArm = new Cube(this.bodyColor);
        this.legParts.push(rightArm);
        
        let tail1 = new Cube(this.pinkColor);
        this.tailParts.push(tail1);
    }
    
    updateAnimation(seconds) {
        this.rightHaunch = Math.max(-5 * Math.sin(seconds * 2), 0); 
        this.leftHaunch = Math.max(-5 * Math.sin(seconds * 2), 0); 
        this.backFeet = Math.min(-5 * Math.sin(seconds * 2), 10); 
        this.blink = 0.1 * (0.5 + 0.5 * Math.sin(seconds));
        this.tailJ = Math.min(-15 * Math.sin(seconds * 2), 20); 
        this.rightArm = Math.max(20 * -Math.sin(seconds * 2), 0); 
        this.rightPaw = Math.max(45 * -Math.sin(seconds * 2), -20); 
        this.leftArm = Math.max(20 * -Math.sin(seconds * 2), 0); 
        this.leftPaw = Math.max(45 * -Math.sin(seconds * 2), -20); 
        this.headJ = Math.max(15 * Math.sin(seconds), 0); 
        this.bodyJ = Math.min(-8 * Math.sin(seconds), 0); 
        this.noseJ = 3 * Math.sin(seconds * 8); 
        this.earJ = -3 * Math.sin(seconds * 6); 
        
        this.applyAnimations();
    }
    
    applyAnimations() {
        //Get the base position and scale
        let baseX = this.baseTranslate[0] + this.localPosition[0];
        let baseY = this.baseTranslate[1] + this.localPosition[1];
        let baseZ = this.baseTranslate[2] + this.localPosition[2];
        
        let scaleX = this.baseScale[0];
        let scaleY = this.baseScale[1];
        let scaleZ = this.baseScale[2];
        
        //Body
        if (this.bodyParts[0]) {
            let body = this.bodyParts[0];
            body.setTranslate(baseX, baseY, baseZ);
            body.setRotate(0, 0, 10 + this.bodyJ);
            body.setScale(0.5 * scaleX, 1 * scaleY, 0.5 * scaleZ);
        }
        
        //Head
        if (this.headParts[0]) {
            let head = this.headParts[0];
            head.setTranslate(baseX - 0.2 * scaleX, baseY + 1.5 * scaleY, baseZ);
            head.setRotate(0, 0, -this.headJ);
            head.setScale(0.5 * scaleX, 0.5 * scaleY, 0.5 * scaleZ);
        }
        
        //Left eye
        if (this.faceParts[0]) {
            let leftEye = this.faceParts[0];
            leftEye.setTranslate(baseX - 0.64 * scaleX, baseY + 1.7 * scaleY, baseZ - 0.2 * scaleZ);
            leftEye.setRotate(0, 0, -this.headJ);
            leftEye.setScale(0.08 * scaleX, (0.01 + this.blink * 0.8) * scaleY, 0.08 * scaleZ);
        }
        
        //Right eye
        if (this.faceParts[1]) {
            let rightEye = this.faceParts[1];
            rightEye.setTranslate(baseX - 0.64 * scaleX, baseY + 1.7 * scaleY, baseZ + 0.2 * scaleZ);
            rightEye.setRotate(0, 0, -this.headJ);
            rightEye.setScale(0.08 * scaleX, (0.01 + this.blink * 0.8) * scaleY, 0.08 * scaleZ);
        }
        
        //Left ear
        if (this.earParts[0]) {
            let leftEar = this.earParts[0];
            leftEar.setTranslate(baseX + 0.05 * scaleX, baseY + 2.3 * scaleY, baseZ + 0.3 * scaleZ);
            leftEar.setRotate(0, 0, this.earJ);
            leftEar.setScale(0.05 * scaleX, 0.5 * scaleY, 0.15 * scaleZ);
        }
        
        //Right ear
        if (this.earParts[1]) {
            let rightEar = this.earParts[1];
            rightEar.setTranslate(baseX + 0.05 * scaleX, baseY + 2.3 * scaleY, baseZ - 0.25 * scaleZ);
            rightEar.setRotate(0, 0, this.earJ);
            rightEar.setScale(0.05 * scaleX, 0.5 * scaleY, 0.15 * scaleZ);
        }
        
        //Left haunch
        if (this.legParts[0]) {
            let leftHaunch = this.legParts[0];
            leftHaunch.setTranslate(baseX, baseY - 0.6 * scaleY, baseZ - 0.6 * scaleZ);
            leftHaunch.setRotate(0, 0, -75 + this.leftHaunch);
            leftHaunch.setScale(0.4 * scaleX, 0.4 * scaleY, 0.1 * scaleZ);
        }
        
        //Left foot
        if (this.legParts[1]) {
            let leftFoot = this.legParts[1];
            leftFoot.setTranslate(baseX - 0.2 * scaleX, baseY - 1.0 * scaleY + (this.backFeet/100), baseZ + 0.6 * scaleZ);
            leftFoot.setRotate(0, 0, 225 + 65 + this.backFeet);
            leftFoot.setScale(0.15 * scaleX, 0.4 * scaleY, 0.1 * scaleZ);
        }
        
        //Right haunch
        if (this.legParts[2]) {
            let rightHaunch = this.legParts[2];
            rightHaunch.setTranslate(baseX, baseY - 0.6 * scaleY, baseZ + 0.6 * scaleZ);
            rightHaunch.setRotate(0, 0, -75 + this.rightHaunch);
            rightHaunch.setScale(0.4 * scaleX, 0.4 * scaleY, 0.1 * scaleZ);
        }
        
        //Right foot
        if (this.legParts[3]) {
            let rightFoot = this.legParts[3];
            rightFoot.setTranslate(baseX - 0.2 * scaleX, baseY - 1.0 * scaleY + (this.backFeet/100), baseZ - 0.6 * scaleZ);
            rightFoot.setRotate(0, 0, 225 + 65 + this.backFeet);
            rightFoot.setScale(0.15 * scaleX, 0.4 * scaleY, 0.1 * scaleZ);
        }
        
        //Left arm
        if (this.legParts[4]) {
            let leftArm = this.legParts[4];
            leftArm.setTranslate(baseX - 0.35 * scaleX, baseY + 0.2 * scaleY, baseZ - 0.6 * scaleZ);
            leftArm.setRotate(0, 0, -45 - this.leftArm);
            leftArm.setScale(0.15 * scaleX, 0.3 * scaleY, 0.1 * scaleZ);
        }
        
        //Right arm
        if (this.legParts[5]) {
            let rightArm = this.legParts[5];
            rightArm.setTranslate(baseX - 0.35 * scaleX, baseY + 0.2 * scaleY, baseZ + 0.6 * scaleZ);
            rightArm.setRotate(0, 0, -45 - this.rightArm);
            rightArm.setScale(0.15 * scaleX, 0.3 * scaleY, 0.1 * scaleZ);
        }
        
        //Tail
        if (this.tailParts[0]) {
            let tail = this.tailParts[0];
            tail.setTranslate(baseX + 0.6 * scaleX, baseY - 0.75 * scaleY, baseZ);
            tail.setRotate(0, 0, -50 + this.tailJ);
            tail.setScale(0.2 * scaleX, 0.2 * scaleY, 0.2 * scaleZ);
        }
    }
    
    addToScene(shapesArray) {
        shapesArray.push(...this.bodyParts);
        shapesArray.push(...this.headParts);
        shapesArray.push(...this.faceParts);
        shapesArray.push(...this.earParts);
        shapesArray.push(...this.legParts);
        shapesArray.push(...this.tailParts);
    }
}