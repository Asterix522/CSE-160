class Camera {
    constructor(aspectRatio, near, far, world){
      this.fov = 60;
      this.eye = new Vector3([0, 2, 10]); // Start position
      this.center = new Vector3([0, 2, 9]); // Look at point (1 unit in front)
      this.up = new Vector3([0, 1, 0]);

      this.viewMatrix = new Matrix4();
      
      // Calculate initial distance between eye and center
      let dx = this.center.elements[0] - this.eye.elements[0]; // Should be 0
      let dz = this.center.elements[2] - this.eye.elements[2]; // Should be -1
      
      console.log("dx:", dx, "dz:", dz);
      
      this.distance = Math.sqrt(dx*dx + dz*dz);
      console.log("Initial distance:", this.distance);
      
      // Store current angle (in radians) for Y-axis rotation
      // Since we're looking from (0,2,10) to (0,2,9), we're looking along negative Z
      // That means angle should be 0 (looking "down" the negative Z axis)
      if (this.distance > 0) {
          this.angle = Math.atan2(dx, dz);
      } else {
          console.warn("Distance was 0, setting default angle");
          this.angle = 0; // Looking along negative Z
      }
      
      console.log("Initial angle:", this.angle * 180/Math.PI, "degrees");
      
      // Movement and rotation speed
      this.moveSpeed = 0.2;
      this.mouseSensitivity = 0.2;
      
      // Physics
      this.velocityY = 0;
      this.gravity = 0.015;
      this.isGrounded = false;
      this.jumpStrength = 0.25;
      this.groundLevel = 2.0;
      this.playerHeight = 1.8;
      
      // Reference to world for collision detection
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
        // Move in the direction the camera is facing
        let moveX = Math.sin(this.angle) * this.moveSpeed;
        let moveZ = Math.cos(this.angle) * this.moveSpeed;
        
        let feetY = this.eye.elements[1] - this.playerHeight;
        let currentX = this.eye.elements[0];
        let currentZ = this.eye.elements[2];
        
        // Try moving in X direction first
        let newX = currentX + moveX;
        if (!this.world.checkCollisionX(newX, currentZ, feetY)) {
            this.eye.elements[0] = newX;
        }
        
        // Then try moving in Z direction
        let newZ = this.eye.elements[2] + moveZ;
        if (!this.world.checkCollisionZ(this.eye.elements[0], newZ, feetY)) {
            this.eye.elements[2] = newZ;
        }
        
        this.updateView();
    }

    moveBackwards(){
        let moveX = Math.sin(this.angle) * this.moveSpeed;
        let moveZ = Math.cos(this.angle) * this.moveSpeed;
        
        let feetY = this.eye.elements[1] - this.playerHeight;
        let currentX = this.eye.elements[0];
        let currentZ = this.eye.elements[2];
        
        // Try moving in X direction first
        let newX = currentX - moveX;
        if (!this.world.checkCollisionX(newX, currentZ, feetY)) {
            this.eye.elements[0] = newX;
        }
        
        // Then try moving in Z direction
        let newZ = this.eye.elements[2] - moveZ;
        if (!this.world.checkCollisionZ(this.eye.elements[0], newZ, feetY)) {
            this.eye.elements[2] = newZ;
        }
        
        this.updateView();
    }
		
    moveLeft(){
        let strafeAngle = this.angle + Math.PI/2;
        let moveX = Math.sin(strafeAngle) * this.moveSpeed;
        let moveZ = Math.cos(strafeAngle) * this.moveSpeed;
        
        let feetY = this.eye.elements[1] - this.playerHeight;
        let currentX = this.eye.elements[0];
        let currentZ = this.eye.elements[2];
        
        // Try moving in X direction first
        let newX = currentX + moveX;
        if (!this.world.checkCollisionX(newX, currentZ, feetY)) {
            this.eye.elements[0] = newX;
        }
        
        // Then try moving in Z direction
        let newZ = this.eye.elements[2] + moveZ;
        if (!this.world.checkCollisionZ(this.eye.elements[0], newZ, feetY)) {
            this.eye.elements[2] = newZ;
        }
        
        this.updateView();
    }

    moveRight(){
        let strafeAngle = this.angle - Math.PI/2;
        let moveX = Math.sin(strafeAngle) * this.moveSpeed;
        let moveZ = Math.cos(strafeAngle) * this.moveSpeed;
        
        let feetY = this.eye.elements[1] - this.playerHeight;
        let currentX = this.eye.elements[0];
        let currentZ = this.eye.elements[2];
        
        // Try moving in X direction first
        let newX = currentX + moveX;
        if (!this.world.checkCollisionX(newX, currentZ, feetY)) {
            this.eye.elements[0] = newX;
        }
        
        // Then try moving in Z direction
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
        // Apply gravity
        this.velocityY -= this.gravity;
        
        // Update vertical position
        let newY = this.eye.elements[1] + this.velocityY;
        let feetY = newY - this.playerHeight;
        
        // Check if we're standing on any block
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

    // Mouse look - just like Q/E but with mouse delta
    mouseMove(dx) {
    // Make sure angle is a valid number
    if (isNaN(this.angle)) {
        console.warn("Angle was NaN, resetting to 0");
        this.angle = 0;
    }
    
    // Update angle based on mouse movement
    // INVERTED: Subtract instead of add to fix left/right inversion
    this.angle -= dx * this.mouseSensitivity * Math.PI / 180;
    
    this.updateView();
}
    // Keep Q/E as alternative controls
    panLeft(){
        this.angle += 2 * Math.PI / 180; // 2 degrees
        this.updateView();
    }

    panRight(){
        this.angle -= 2 * Math.PI / 180; // 2 degrees
        this.updateView();
    }

    updateView(){
        // Make sure we have a valid distance
        if (this.distance <= 0) {
            console.warn("Invalid distance, setting to 1");
            this.distance = 1;
        }
        
        // Make sure angle is valid
        if (isNaN(this.angle)) {
            console.warn("Angle is NaN in updateView, resetting to 0");
            this.angle = 0;
        }
        
        // Calculate new center position using angle
        let centerX = this.eye.elements[0] + Math.sin(this.angle) * this.distance;
        let centerZ = this.eye.elements[2] + Math.cos(this.angle) * this.distance;
        
        this.center.elements[0] = centerX;
        this.center.elements[2] = centerZ;
        this.center.elements[1] = this.eye.elements[1]; // Keep Y the same
        
        // Optional debug
        // console.log("updateView - angle:", this.angle * 180/Math.PI, "center:", this.center.elements);
        
        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
                            this.center.elements[0], this.center.elements[1], this.center.elements[2],
                            this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }
}