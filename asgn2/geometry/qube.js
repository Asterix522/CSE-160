class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.buffer = null;
        this.vertices = this.generateVertices();
    }
    
    generateVertices() {
        return new Float32Array([
            0,0,0, 1,1,0, 1,0,0, 0,0,0, 0,1,0, 1,1,0,

            0,1,0, 0,1,1, 1,1,1, 0,1,0, 1,1,1, 1,1,0,

            0,0,1, 0,1,1, 1,1,1, 0,0,1, 1,1,1, 1,0,1,

            0,0,0, 0,0,1, 0,1,1, 0,0,0, 0,1,1, 0,1,0,

            1,0,0, 1,1,0, 1,1,1, 1,0,0, 1,1,1, 1,0,1,

            0,0,0, 1,0,0, 1,0,1, 0,0,0, 1,0,1, 0,0,1
        ]);
    }
    
    normalizeColor() {
        const [r,g,b,a] = this.color;
        return r > 1 ? [r/255, g/255, b/255, a] : [r,g,b,a];
    }
    
    render() {
        const [r,g,b,a] = this.normalizeColor();
        
        // Set model matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // Create or bind buffer once
        if (!this.buffer) {
            this.buffer = gl.createBuffer();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        
        // Configure vertex attributes
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        
        // Draw each face with different shading
        const shades = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5];
        for (let i = 0; i < 6; i++) {
            gl.uniform4f(u_FragColor, r*shades[i], g*shades[i], b*shades[i], a);
            gl.drawArrays(gl.TRIANGLES, i*6, 6);
        }
    }
}