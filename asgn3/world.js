class World {
    constructor() {
        this.walls = [];
        this.wallSize = 1.0;
        this.playerWidth = 0.6; // Player collision width
    }
    
    // Add a wall at (x, z) with given height (in cubes)
    addWall(x, z, height) {
        // Make sure coordinates are integers to maintain grid spacing
        x = Math.round(x);
        z = Math.round(z);
        
        for (let h = 0; h < height; h++) {
            let wallCube = new cube();
            // Position cubes at integer + 0.5 for centering
            wallCube.translate(x, h, z);
            wallCube.scale(.5,.5, .5);
            this.walls.push(wallCube);
            shapes.push(wallCube);
        }
        //console.log(`Added wall at (${x}, ${z}) with height ${height}`);
    }
    
    // Check if a point (x, z) collides with any wall at given height
    checkCollision(x, z, playerFeetY) {
        const playerHeadY = playerFeetY + 1.8; // Approximate head height
        const buffer = 0.1; // Small buffer for floating point errors
        
        for (let wall of this.walls) {
            let wallX = wall.translationMatrix.elements[12];
            let wallZ = wall.translationMatrix.elements[14];
            let wallY = wall.translationMatrix.elements[13];
            
            // Calculate distance from player center to wall center
            let dx = Math.abs(x - wallX);
            let dz = Math.abs(z - wallZ);
            
            // Check horizontal collision
            // Wall extends 0.5 from center, player extends playerWidth/2 from center
            // So collision occurs when dx < 0.5 + playerWidth/2
            let collisionDistance = 0.5 + (this.playerWidth / 2) - buffer;
            
            if (dx < collisionDistance && dz < collisionDistance) {
                // Check vertical overlap
                let wallBottom = wallY - 0.5;
                let wallTop = wallY + 0.5;
                
                // If player overlaps with wall vertically, it's a collision
                if (playerFeetY < wallTop && playerHeadY > wallBottom) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Check collision for movement in X direction only
    checkCollisionX(x, z, playerFeetY) {
        const playerHeadY = playerFeetY + 1.8;
        const buffer = 0.1;
        
        for (let wall of this.walls) {
            let wallX = wall.translationMatrix.elements[12];
            let wallZ = wall.translationMatrix.elements[14];
            let wallY = wall.translationMatrix.elements[13];
            
            let dx = Math.abs(x - wallX);
            let dz = Math.abs(z - wallZ);
            
            // Only check collision if we're roughly aligned in Z
            if (dz < 0.5 + (this.playerWidth / 2)) {
                let collisionDistance = 0.5 + (this.playerWidth / 2) - buffer;
                
                if (dx < collisionDistance) {
                    let wallBottom = wallY - 0.5;
                    let wallTop = wallY + 0.5;
                    
                    if (playerFeetY < wallTop && playerHeadY > wallBottom) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // Check collision for movement in Z direction only
    checkCollisionZ(x, z, playerFeetY) {
        const playerHeadY = playerFeetY + 1.8;
        const buffer = 0.1;
        
        for (let wall of this.walls) {
            let wallX = wall.translationMatrix.elements[12];
            let wallZ = wall.translationMatrix.elements[14];
            let wallY = wall.translationMatrix.elements[13];
            
            let dx = Math.abs(x - wallX);
            let dz = Math.abs(z - wallZ);
            
            // Only check collision if we're roughly aligned in X
            if (dx < 0.5 + (this.playerWidth / 2)) {
                let collisionDistance = 0.5 + (this.playerWidth / 2) - buffer;
                
                if (dz < collisionDistance) {
                    let wallBottom = wallY - 0.5;
                    let wallTop = wallY + 0.5;
                    
                    if (playerFeetY < wallTop && playerHeadY > wallBottom) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // Get the height of the highest block at (x, z) below given feet position
    getBlockHeightAt(x, z, feetY) {
        let highestBlock = null;
        let highestY = -Infinity;
        
        for (let wall of this.walls) {
            let wallX = wall.translationMatrix.elements[12];
            let wallZ = wall.translationMatrix.elements[14];
            let wallY = wall.translationMatrix.elements[13];
            
            // Check if we're within this block horizontally
            // Player width doesn't matter for standing on blocks
            if (Math.abs(x - wallX) < 0.4 && Math.abs(z - wallZ) < 0.4) {
                let blockTop = wallY + 0.5;
                let blockBottom = wallY - 0.5;
                
                // If the block is below the player's feet
                if (blockTop < feetY + 0.1 && blockTop > highestY) {
                    highestY = blockTop;
                    highestBlock = blockTop;
                }
            }
        }
        
        return highestBlock;
    }
    
    // Clear all walls
    clearWalls() {
        for (let wall of this.walls) {
            let index = shapes.indexOf(wall);
            if (index > -1) {
                shapes.splice(index, 1);
            }
        }
        this.walls = [];
        console.log("All walls cleared");
    }
}