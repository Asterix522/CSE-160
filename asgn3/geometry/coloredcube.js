class ColoredCube extends geometry {
    constructor(color) {
        super();
        
        this.color = color || [1.0, 1.0, 1.0];
       
        const applyShade = (shade) => {
            return [
                Math.min(1.0, this.color[0] * shade),
                Math.min(1.0, this.color[1] * shade),
                Math.min(1.0, this.color[2] * shade)
            ];
        };
        
        //Generate vertices with shaded colors for each face
        this.vertices = new Float32Array([
            //RIGHT FACE (darker - shade 0.8)
            1.0, -1.0,  1.0, ...applyShade(0.8), 0, 0,
            1.0, -1.0, -1.0, ...applyShade(0.8), 0, 0,
            1.0,  1.0, -1.0, ...applyShade(0.8), 0, 0,
            1.0, -1.0,  1.0, ...applyShade(0.8), 0, 0,
            1.0,  1.0, -1.0, ...applyShade(0.8), 0, 0,
            1.0,  1.0,  1.0, ...applyShade(0.8), 0, 0,
            
            //LEFT FACE (darker - shade 0.8)
            -1.0, -1.0, -1.0, ...applyShade(0.8), 0, 0,
            -1.0, -1.0,  1.0, ...applyShade(0.8), 0, 0,
            -1.0,  1.0,  1.0, ...applyShade(0.8), 0, 0,
            -1.0, -1.0, -1.0, ...applyShade(0.8), 0, 0,
            -1.0,  1.0,  1.0, ...applyShade(0.8), 0, 0,
            -1.0,  1.0, -1.0, ...applyShade(0.8), 0, 0,
            
            //BACK FACE (full brightness - shade 1.0)
             1.0,  1.0, 1.0, ...applyShade(1.0), 0, 0,
            -1.0,  1.0, 1.0, ...applyShade(1.0), 0, 0,
            -1.0, -1.0, 1.0, ...applyShade(1.0), 0, 0,
             1.0,  1.0, 1.0, ...applyShade(1.0), 0, 0,
            -1.0, -1.0, 1.0, ...applyShade(1.0), 0, 0,
             1.0, -1.0, 1.0, ...applyShade(1.0), 0, 0,
             
             //FRONT FACE (full brightness - shade 1.0)
              1.0, -1.0, -1.0, ...applyShade(1.0), 0, 0,
             -1.0, -1.0, -1.0, ...applyShade(1.0), 0, 0,
             -1.0,  1.0, -1.0, ...applyShade(1.0), 0, 0,
              1.0, -1.0, -1.0, ...applyShade(1.0), 0, 0,
             -1.0,  1.0, -1.0, ...applyShade(1.0), 0, 0,
              1.0,  1.0, -1.0, ...applyShade(1.0), 0, 0,
             
             //TOP FACE (brighter - shade 1.2)
              1.0, 1.0, -1.0, ...applyShade(1.2), 0, 0,
             -1.0, 1.0, -1.0, ...applyShade(1.2), 0, 0,
             -1.0, 1.0,  1.0, ...applyShade(1.2), 0, 0,
              1.0, 1.0, -1.0, ...applyShade(1.2), 0, 0,
              1.0, 1.0,  1.0, ...applyShade(1.2), 0, 0,
             -1.0, 1.0,  1.0, ...applyShade(1.2), 0, 0,
             
             //BOTTOM FACE (much darker - shade 0.6)
              1.0, -1.0, -1.0, ...applyShade(0.6), 0, 0,
             -1.0, -1.0, -1.0, ...applyShade(0.6), 0, 0,
             -1.0, -1.0,  1.0, ...applyShade(0.6), 0, 0,
              1.0, -1.0, -1.0, ...applyShade(0.6), 0, 0,
              1.0, -1.0,  1.0, ...applyShade(0.6), 0, 0,
             -1.0, -1.0,  1.0, ...applyShade(0.6), 0, 0,
        ]);
    }
    
    render() {
        //Apply transformations
        this.modelMatrix.multiply(this.translationMatrix);
        this.modelMatrix.multiply(this.rotationMatrix);
        this.modelMatrix.multiply(this.scaleMatrix);

        let u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.modelMatrix.elements);

        //Upload vertices to buffer
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        
        //Draw the cube (36 vertices = 12 triangles)
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        //Reset model matrix
        this.modelMatrix.setIdentity();
    }
}