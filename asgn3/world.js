class World {
    constructor() {
        this.walls = [];
        this.playerWidth = 0.6; //Player collision width
        this.blockHalfSize = 0.25; //Since blocks are scaled 0.5, half-size is 0.25
    }
    
    
    addWall(x, z, height, y = 0) {
        
        x = Math.round(x);
        z = Math.round(z);
        y = Math.round(y);
        
        for (let h = 0; h < height; h++) {
            let blockY = y + h;

            //check if space is already occupied before adding
            if (!this.isSpaceOccupied(x, blockY, z)) {
                let wallCube = new cube();
                //position cubes at integer coordinates (centered)
                wallCube.translate(x, blockY, z);
                wallCube.scale(0.5, 0.5, 0.5);
                this.walls.push(wallCube);
                shapes.push(wallCube);
            } else {
                //console.log(`Space at (${x}, ${blockY}, ${z}) is already occupied - skipping`);
            }
        }
    }
    
    
    isSpaceOccupied(x, y, z) {
        
        x = Math.round(x);
        y = Math.round(y);
        z = Math.round(z);
        
        for (let wall of this.walls) {
            let wallX = Math.round(wall.translationMatrix.elements[12]);
            let wallY = Math.round(wall.translationMatrix.elements[13]);
            let wallZ = Math.round(wall.translationMatrix.elements[14]);
            
            if (wallX === x && wallY === y && wallZ === z) {
                return true; //Space is occupied
            }
        }
        return false; //Space is free
    }
    
    
    //Check if a point (x, z) collides with any wall at given height
    checkCollision(x, z, playerFeetY) {
        const playerHeadY = playerFeetY + 1.8; //Approximate head height
        const buffer = 0.1; //Small buffer for floating point errors
        
        for (let wall of this.walls) {
            let wallX = wall.translationMatrix.elements[12];
            let wallZ = wall.translationMatrix.elements[14];
            let wallY = wall.translationMatrix.elements[13];
            
            //Calculate distance from player center to wall center
            let dx = Math.abs(x - wallX);
            let dz = Math.abs(z - wallZ);
            
            //Check horizontal collision
            let collisionDistance = this.blockHalfSize + (this.playerWidth / 2) - buffer;
            
            if (dx < collisionDistance && dz < collisionDistance) {
                //Check vertical overlap
                let wallBottom = wallY - this.blockHalfSize;
                let wallTop = wallY + this.blockHalfSize;
                
                //If player overlaps with wall vertically, it's a collision
                if (playerFeetY < wallTop && playerHeadY > wallBottom) {
                    return true;
                }
            }
        }
        return false;
    }
    
    //Check collision for movement in X direction only
    checkCollisionX(x, z, playerFeetY) {
        const playerHeadY = playerFeetY + 1.8;
        const buffer = 0.1;
        
        for (let wall of this.walls) {
            let wallX = wall.translationMatrix.elements[12];
            let wallZ = wall.translationMatrix.elements[14];
            let wallY = wall.translationMatrix.elements[13];
            
            let dx = Math.abs(x - wallX);
            let dz = Math.abs(z - wallZ);
            
            //Only check collision if we're roughly aligned in Z
            if (dz < this.blockHalfSize + (this.playerWidth / 2)) {
                let collisionDistance = this.blockHalfSize + (this.playerWidth / 2) - buffer;
                
                if (dx < collisionDistance) {
                    let wallBottom = wallY - this.blockHalfSize;
                    let wallTop = wallY + this.blockHalfSize;
                    
                    if (playerFeetY < wallTop && playerHeadY > wallBottom) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    //Check collision for movement in Z direction only
    checkCollisionZ(x, z, playerFeetY) {
        const playerHeadY = playerFeetY + 1.8;
        const buffer = 0.1;
        
        for (let wall of this.walls) {
            let wallX = wall.translationMatrix.elements[12];
            let wallZ = wall.translationMatrix.elements[14];
            let wallY = wall.translationMatrix.elements[13];
            
            let dx = Math.abs(x - wallX);
            let dz = Math.abs(z - wallZ);
            
            //Only check collision if we're roughly aligned in X
            if (dx < this.blockHalfSize + (this.playerWidth / 2)) {
                let collisionDistance = this.blockHalfSize + (this.playerWidth / 2) - buffer;
                
                if (dz < collisionDistance) {
                    let wallBottom = wallY - this.blockHalfSize;
                    let wallTop = wallY + this.blockHalfSize;
                    
                    if (playerFeetY < wallTop && playerHeadY > wallBottom) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    //Get the height of the highest block at (x, z) below given feet position
    getBlockHeightAt(x, z, feetY) {
        let highestBlock = null;
        let highestY = -Infinity;
        
        for (let wall of this.walls) {
            let wallX = wall.translationMatrix.elements[12];
            let wallZ = wall.translationMatrix.elements[14];
            let wallY = wall.translationMatrix.elements[13];
            
            //Check if we're within this block horizontally
            if (Math.abs(x - wallX) < this.blockHalfSize && Math.abs(z - wallZ) < this.blockHalfSize) {
                let blockTop = wallY + this.blockHalfSize;
                
                //If the block is below the player's feet
                if (blockTop < feetY + 0.1 && blockTop > highestY) {
                    highestY = blockTop;
                    highestBlock = blockTop;
                }
            }
        }
        
        return highestBlock;
    }
    
}