class Leaf {
    constructor() {
        this.type == 'leaf';
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

        // Top half
        // Front-right face
        drawTriangle3D(gl, [0, 1.5, 0,   0.5, 0, 0,   0, 0, 0.5]);
        
        // Front-left face
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3D(gl, [0, 1.5, 0,   0, 0, 0.5,   -0.5, 0, 0]);
        
        // Back-left face
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D(gl, [0, 1.5, 0,   -0.5, 0, 0,   0, 0, -0.5]);
        
        // Back-right face
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3D(gl, [0, 1.5, 0,   0, 0, -0.5,   0.5, 0, 0]);

        // Bottom half
        // Front-right face
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3D(gl, [0, -1.5, 0,   0, 0, 0.5,   0.5, 0, 0]);
        
        // Front-left face
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D(gl, [0, -1.5, 0,   -0.5, 0, 0,   0, 0, 0.5]);
        
        // Back-left face
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3D(gl, [0, -1.5, 0,   0, 0, -0.5,   -0.5, 0, 0]);
        
        // Back-right face
        gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        drawTriangle3D(gl, [0, -1.5, 0,   0.5, 0, 0,   0, 0, -0.5]);
 
    }
}