class Triangle {
    constructor(isTetrahedron = true) {
        this.type = "triangle";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.buffer = null;
        this.vertices = isTetrahedron ? this.generateTetrahedronVertices() : this.generateTriangleVertices();
    }
    
    generateTetrahedronVertices() {
        return new Float32Array([

            0,0,0, 1,0,0, 0.5,0,1, 0,0,0, 0.5,0,1, 1,0,0,

            0,0,0, 0.5,1,0.5, 1,0,0, 0,0,0, 1,0,0, 0.5,1,0.5,

            1,0,0, 0.5,1,0.5, 0.5,0,1, 1,0,0, 0.5,0,1, 0.5,1,0.5,

            0.5,0,1, 0.5,1,0.5, 0,0,0, 0.5,0,1, 0,0,0, 0.5,1,0.5
        ]);
    }
    
    generateTriangleVertices() {
        const height = Math.sqrt(3) / 2;
        return new Float32Array([0,0,0, 1,0,0, 0.5,height,0]);
    }
    
    render() {
        const [r,g,b,a] = this.color.map(c => c > 1 ? c/255 : c);
        const isTetrahedron = this.vertices.length > 9; // More than 3 vertices
        
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // Create/bind buffer
        if (!this.buffer) {
            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        
        if (isTetrahedron) {
            // Draw tetrahedron with shaded faces
            const shades = [1.0, 0.7, 0.9, 0.8];
            for (let i = 0; i < 4; i++) {
                gl.uniform4f(u_FragColor, r*shades[i], g*shades[i], b*shades[i], a);
                gl.drawArrays(gl.TRIANGLES, i*6, 6);
            }
        } else {
            // Draw single triangle
            gl.uniform4f(u_FragColor, r, g, b, a);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
    }
}