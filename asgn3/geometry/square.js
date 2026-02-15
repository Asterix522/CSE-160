class square extends geometry {
    constructor(tileCount = 20) {
        super();
        
        const floatsPerVertex = 8; //x,y,z,r,g,b,u,v
        const verticesPerTile = 6;
        const totalTiles = tileCount * tileCount;
        const totalVertices = totalTiles * verticesPerTile;
        const vertices = new Float32Array(totalVertices * floatsPerVertex);
        
        let offset = 0;
        const tileSize = 2.0 / tileCount;
        const startX = -1.0;
        const startY = -1.0;
        
        for (let row = 0; row < tileCount; row++) {
            for (let col = 0; col < tileCount; col++) {
                const left = startX + col * tileSize;
                const right = left + tileSize;
                const bottom = startY + row * tileSize;
                const top = bottom + tileSize;
                
                //Alternate colors based on grid position for debugging
                const r = (row + col) % 2 === 0 ? 1.0 : 0.5;
                const g = (row) / tileCount;
                const b = (col) / tileCount;
                
                //First triangle
                //bottom-left
                vertices[offset++] = left;
                vertices[offset++] = bottom;
                vertices[offset++] = 0.0;
                vertices[offset++] = r;
                vertices[offset++] = g;
                vertices[offset++] = b;
                vertices[offset++] = 0.0;
                vertices[offset++] = 0.0;
                
                //bottom-right
                vertices[offset++] = right;
                vertices[offset++] = bottom;
                vertices[offset++] = 0.0;
                vertices[offset++] = r;
                vertices[offset++] = g;
                vertices[offset++] = b;
                vertices[offset++] = 1.0;
                vertices[offset++] = 0.0;
                
                //top-right
                vertices[offset++] = right;
                vertices[offset++] = top;
                vertices[offset++] = 0.0;
                vertices[offset++] = r;
                vertices[offset++] = g;
                vertices[offset++] = b;
                vertices[offset++] = 1.0;
                vertices[offset++] = 1.0;
                
                //Second triangle
                //bottom-left
                vertices[offset++] = left;
                vertices[offset++] = bottom;
                vertices[offset++] = 0.0;
                vertices[offset++] = r;
                vertices[offset++] = g;
                vertices[offset++] = b;
                vertices[offset++] = 0.0;
                vertices[offset++] = 0.0;
                
                //top-right
                vertices[offset++] = right;
                vertices[offset++] = top;
                vertices[offset++] = 0.0;
                vertices[offset++] = r;
                vertices[offset++] = g;
                vertices[offset++] = b;
                vertices[offset++] = 1.0;
                vertices[offset++] = 1.0;
                
                //top-left
                vertices[offset++] = left;
                vertices[offset++] = top;
                vertices[offset++] = 0.0;
                vertices[offset++] = r;
                vertices[offset++] = g;
                vertices[offset++] = b;
                vertices[offset++] = 0.0;
                vertices[offset++] = 1.0;
            }
        }
        
        this.vertices = vertices;
    }
}