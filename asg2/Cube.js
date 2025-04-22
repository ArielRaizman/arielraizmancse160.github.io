class Cube {
    constructor() {
        this.type == 'cube';
        // this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        // this.size = 10;
        // this.segments = 10;
        this.matrix = new Matrix4();
    }
    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // pass the matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of Cube
        drawTriangle3D(gl, [0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0]);
        drawTriangle3D(gl, [0.0,0.0,0.0,  0.0,1.0,0.0,  1.0,1.0,0.0]);

        // Back of Cube
        drawTriangle3D(gl, [0.0,0.0,1.0,  1.0,0.0,1.0,  1.0,1.0,1.0]);
        drawTriangle3D(gl, [0.0,0.0,1.0,  1.0,1.0,1.0,  0.0,1.0,1.0]);
        
        // Left of Cube
        drawTriangle3D(gl, [0.0,0.0,0.0,  0.0,1.0,1.0,  0.0,1.0,0.0]);
        drawTriangle3D(gl, [0.0,0.0,0.0,  0.0,0.0,1.0,  0.0,1.0,1.0]);

        // Right of Cube
        drawTriangle3D(gl, [1.0,0.0,0.0,  1.0,1.0,0.0,  1.0,1.0,1.0]);
        drawTriangle3D(gl, [1.0,0.0,0.0,  1.0,1.0,1.0,  1.0,0.0,1.0]);

        // Top of Cube
        drawTriangle3D(gl, [0.0,1.0,0.0,  1.0,1.0,1.0,  1.0,1.0,0.0]);
        drawTriangle3D(gl, [0.0,1.0,0.0,  0.0,1.0,1.0,  1.0,1.0,1.0]);

        // Bottom of Cube
        drawTriangle3D(gl, [0.0,0.0,0.0,  1.0,0.0,1.0,  1.0,0.0,0.0]);
        drawTriangle3D(gl, [0.0,0.0,0.0,  0.0,0.0,1.0,  1.0,0.0,1.0]);

    }
}