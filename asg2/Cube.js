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
        // gl.uniform4f(u_FragColor, 255, 0, 0, rgba[3]);
        drawTriangle3D(gl, [0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   0.0, 1.0, 0.0]);
        drawTriangle3D(gl, [0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 1.0, 0.0]);

        // Back of Cube
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        // gl.uniform4f(u_FragColor, 0, 255, 0, rgba[3]);
        drawTriangle3D(gl, [1.0, 1.0, 1.0,   0.0, 0.0, 1.0,   0.0, 1.0, 1.0]);
        drawTriangle3D(gl, [1.0, 0.0, 1.0,   0.0, 0.0, 1.0,   1.0, 1.0, 1.0]);
        
        // Left of Cube
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        // gl.uniform4f(u_FragColor, 0, 0, 255, rgba[3]);
        drawTriangle3D(gl, [0.0, 1.0, 1.0,   0.0, 0.0, 0.0,   0.0, 1.0, 0.0]);
        drawTriangle3D(gl, [0.0, 0.0, 1.0,   0.0, 0.0, 0.0,   0.0, 1.0, 1.0]);

        // Right of Cube
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3D(gl, [1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0]);
        drawTriangle3D(gl, [1.0, 0.0, 0.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0]);

        // Top of Cube
        gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3D(gl, [1.0, 0.0, 0.0,   0.0, 0.0, 0.0,   1.0, 0.0, 1.0]);
        drawTriangle3D(gl, [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 1.0]);

        // Bottom of Cube
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        drawTriangle3D(gl, [0.0, 1.0, 1.0,   0.0, 1.0, 0.0,   1.0, 1.0, 1.0]);
        drawTriangle3D(gl,[1.0, 1.0, 1.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0]);
 
    }
}