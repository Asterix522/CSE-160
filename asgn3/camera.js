class Camera {
    constructor(aspectRatio, near, far, world){
      this.fov = 60;
      this.eye = new Vector3([0, 2, 6]); //start position
      
      let initialDirX = 0;
      let initialDirY = 0;
      let initialDirZ = -1; //looking along negative Z axis
      
      this.center = new Vector3([
          this.eye.elements[0] + initialDirX,
          this.eye.elements[1] + initialDirY,
          this.eye.elements[2] + initialDirZ
      ]);
      
      this.up = new Vector3([0, 1, 0]);

      this.viewMatrix = new Matrix4();
      
      //calculate distance
      this.distance = Math.sqrt(
        Math.pow(this.center.elements[0] - this.eye.elements[0], 2) +
        Math.pow(this.center.elements[1] - this.eye.elements[1], 2) +
        Math.pow(this.center.elements[2] - this.eye.elements[2], 2)
    );
      this.yaw = Math.atan2(initialDirX, initialDirZ);
      this.pitch = Math.atan2(initialDirY, Math.sqrt(initialDirX*initialDirX + initialDirZ*initialDirZ));
      this.moveSpeed = 0.2;
      this.mouseSensitivity = 0.2;
      this.maxPitch = 80 * Math.PI / 180;
      this.minPitch = -80 * Math.PI / 180;
      this.velocityY = 0;
      this.gravity = 0.015;
      this.isGrounded = false;
      this.jumpStrength = 0.3;
      this.groundLevel = 2.0;
      this.playerHeight = 1.8;
      this.world = world;
      
      this.updateView();
      
      this.projectionMatrix = new Matrix4();
      this.projectionMatrix.setPerspective(this.fov, aspectRatio, near, far);
    }

    getPositionArray() {
        return [
            this.eye.elements[0],
            this.eye.elements[1],
            this.eye.elements[2]
        ];
    }

    moveForward(){
        let moveX = Math.sin(this.yaw) * this.moveSpeed;
        let moveZ = Math.cos(this.yaw) * this.moveSpeed;
        
        let feetY = this.eye.elements[1] - this.playerHeight;
        let currentX = this.eye.elements[0];
        let currentZ = this.eye.elements[2];
        
        let newX = currentX + moveX;
        if (!this.world.checkCollisionX(newX, currentZ, feetY)) {
            this.eye.elements[0] = newX;
        }
        
        let newZ = this.eye.elements[2] + moveZ;
        if (!this.world.checkCollisionZ(this.eye.elements[0], newZ, feetY)) {
            this.eye.elements[2] = newZ;
        }
        
        this.updateView();
    }

    moveBackwards(){
        let moveX = Math.sin(this.yaw) * this.moveSpeed;
        let moveZ = Math.cos(this.yaw) * this.moveSpeed;
        
        let feetY = this.eye.elements[1] - this.playerHeight;
        let currentX = this.eye.elements[0];
        let currentZ = this.eye.elements[2];
        
        let newX = currentX - moveX;
        if (!this.world.checkCollisionX(newX, currentZ, feetY)) {
            this.eye.elements[0] = newX;
        }
        
        let newZ = this.eye.elements[2] - moveZ;
        if (!this.world.checkCollisionZ(this.eye.elements[0], newZ, feetY)) {
            this.eye.elements[2] = newZ;
        }
        
        this.updateView();
    }
		
    moveLeft(){
        let strafeAngle = this.yaw + Math.PI/2;
        let moveX = Math.sin(strafeAngle) * this.moveSpeed;
        let moveZ = Math.cos(strafeAngle) * this.moveSpeed;
        
        let feetY = this.eye.elements[1] - this.playerHeight;
        let currentX = this.eye.elements[0];
        let currentZ = this.eye.elements[2];
        
        let newX = currentX + moveX;
        if (!this.world.checkCollisionX(newX, currentZ, feetY)) {
            this.eye.elements[0] = newX;
        }
        
        let newZ = this.eye.elements[2] + moveZ;
        if (!this.world.checkCollisionZ(this.eye.elements[0], newZ, feetY)) {
            this.eye.elements[2] = newZ;
        }
        
        this.updateView();
    }

    moveRight(){
        let strafeAngle = this.yaw - Math.PI/2;
        let moveX = Math.sin(strafeAngle) * this.moveSpeed;
        let moveZ = Math.cos(strafeAngle) * this.moveSpeed;
        
        let feetY = this.eye.elements[1] - this.playerHeight;
        let currentX = this.eye.elements[0];
        let currentZ = this.eye.elements[2];
        
        let newX = currentX + moveX;
        if (!this.world.checkCollisionX(newX, currentZ, feetY)) {
            this.eye.elements[0] = newX;
        }
        
        let newZ = this.eye.elements[2] + moveZ;
        if (!this.world.checkCollisionZ(this.eye.elements[0], newZ, feetY)) {
            this.eye.elements[2] = newZ;
        }
        
        this.updateView();
    }

    jump() {
        if (this.isGrounded) {
            this.velocityY = this.jumpStrength;
            this.isGrounded = false;
        }
    }

    updatePhysics() {

        this.velocityY -= this.gravity;
        

        let newY = this.eye.elements[1] + this.velocityY;
        let feetY = newY - this.playerHeight;
        

        let blockBelow = this.world.getBlockHeightAt(
            this.eye.elements[0], 
            this.eye.elements[2], 
            feetY
        );
        
        if (blockBelow !== null) {
            let blockTopY = blockBelow;
            let playerFeetOnBlock = feetY <= blockTopY && this.velocityY <= 0;
            
            if (playerFeetOnBlock) {
                newY = blockTopY + this.playerHeight;
                this.velocityY = 0;
                this.isGrounded = true;
            } else {
                this.isGrounded = false;
            }
        } 
        else if (newY <= this.groundLevel) {
            newY = this.groundLevel;
            this.velocityY = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
        
        this.eye.elements[1] = newY;
        
        this.updateView();
    }


    mouseMove(dx, dy) {

        if (isNaN(this.yaw)) {
            this.yaw = 0;
        }
        this.yaw -= dx * this.mouseSensitivity * Math.PI / 180;
        

        if (isNaN(this.pitch)) {
            this.pitch = 0;
        }

        this.pitch -= dy * this.mouseSensitivity * Math.PI / 180;
        

        this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
        
        this.updateView();
    }


    panLeft(){
        this.yaw += 2 * Math.PI / 180; //2 degrees
        this.updateView();
    }

    panRight(){
        this.yaw -= 2 * Math.PI / 180; //2 degrees
        this.updateView();
    }


    lookUp() {
        this.pitch += 2 * Math.PI / 180;
        this.pitch = Math.min(this.maxPitch, this.pitch);
        this.updateView();
    }

    lookDown() {
        this.pitch -= 2 * Math.PI / 180;
        this.pitch = Math.max(this.minPitch, this.pitch);
        this.updateView();
    }

    updateView(){
        if (this.distance <= 0) {
            this.distance = 1;
        }
        
        if (isNaN(this.yaw)) this.yaw = 0;
        if (isNaN(this.pitch)) this.pitch = 0;
        
        let dirX = Math.sin(this.yaw) * Math.cos(this.pitch);
        let dirY = Math.sin(this.pitch);
        let dirZ = Math.cos(this.yaw) * Math.cos(this.pitch);
        
        let length = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
        if (length > 0) {
            dirX /= length;
            dirY /= length;
            dirZ /= length;
        }
        
        this.center.elements[0] = this.eye.elements[0] + dirX * this.distance;
        this.center.elements[1] = this.eye.elements[1] + dirY * this.distance;
        this.center.elements[2] = this.eye.elements[2] + dirZ * this.distance;
        
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.center.elements[0], this.center.elements[1], this.center.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }
}