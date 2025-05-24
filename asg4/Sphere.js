class Sphere {
    constructor() {
        this.type == 'sphere';
        // this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        // this.size = 10;
        // this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.allVerts = new Float32Array([
            0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   0.0, 1.0, 0.0,
            0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 1.0, 0.0,

            0.0, 1.0, 1.0,   0.0, 0.0, 0.0,   0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,   0.0, 0.0, 0.0,   0.0, 1.0, 1.0,

            1.0, 1.0, 1.0,   0.0, 0.0, 1.0,   0.0, 1.0, 1.0,
            1.0, 0.0, 1.0,   0.0, 0.0, 1.0,   1.0, 1.0, 1.0,

            1.0, 0.0, 0.0,   0.0, 0.0, 0.0,   1.0, 0.0, 1.0,
            0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 1.0,

            1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0,
            1.0, 0.0, 0.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0,

            0.0, 1.0, 1.0,   0.0, 1.0, 0.0,   1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0
        ]);

        this.allUVs = new Float32Array([
            0, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1,

            0, 1, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 1,

            1, 1, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 1,

            1, 0, 0, 0, 1, 1,
            0, 0, 0, 1, 1, 1,

            0, 0, 1, 1, 1, 0,
            0, 0, 1, 0, 1, 1,

            0, 1, 0, 0, 1, 1,
            1, 1, 0, 0, 1, 0
        ]);

        this.allNormals = new Float32Array([
            0,0,-1,  0,0,-1,   0,0,-1,
            0,0,-1,  0,0,-1,   0,0,-1,

            -1,0,0,  -1,0,0,   -1,0,0,
            -1,0,0,  -1,0,0,   -1,0,0,

            0,0,1,   0,0,1,    0,0,1,
            0,0,1,   0,0,1,    0,0,1,

            0,-1,0,  0,-1,0,   0,-1,0,
            0,-1,0,  0,-1,0,   0,-1,0,

            1,0,0,   1,0,0,    1,0,0,
            1,0,0,   1,0,0,    1,0,0,

            0,1,0,   0,1,0,    0,1,0,
            0,1,0,   0,1,0,    0,1,0,
        ]);
    }
    // render() {
    //     // var xy = this.position;
    //     var rgba = this.color;
        
    //     // var size = this.size;
    //     gl.uniform1i(u_whichTexture, this.textureNum);
    //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //     // pass the matrix
    //     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //     // Front of Cube
    //     // gl.uniform4f(u_FragColor, 255, 0, 0, rgba[3]);
    //     drawTriangle3DUV(gl, [0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   0.0, 1.0, 0.0], [0, 0, 1, 1, 0, 1]);
    //     drawTriangle3DUV(gl, [0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 1.0, 0.0], [0, 0, 1, 0, 1, 1]);

    //     // Back of Cube
    //     gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    //     drawTriangle3DUV(gl, [0.0, 1.0, 1.0,   0.0, 0.0, 0.0,   0.0, 1.0, 0.0], [0, 1, 0, 0, 0, 1]);
    //     drawTriangle3DUV(gl, [0.0, 0.0, 1.0,   0.0, 0.0, 0.0,   0.0, 1.0, 1.0], [1, 0, 0, 0, 0, 1]);

    //     // Left of Cube
    //     gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    //     drawTriangle3DUV(gl, [1.0, 1.0, 1.0,   0.0, 0.0, 1.0,   0.0, 1.0, 1.0], [1, 1, 0, 0, 0, 1]);
    //     drawTriangle3DUV(gl, [1.0, 0.0, 1.0,   0.0, 0.0, 1.0,   1.0, 1.0, 1.0], [1, 0, 0, 0, 1, 1]);

    //     // Right of Cube
    //     gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    //     drawTriangle3DUV(gl, [1.0, 0.0, 0.0,   0.0, 0.0, 0.0,   1.0, 0.0, 1.0], [1, 0, 0, 0, 1, 1]);
    //     drawTriangle3DUV(gl, [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 1.0], [0, 0, 0, 1, 1, 1]);

    //     // Top of Cube
    //     gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    //     drawTriangle3DUV(gl, [1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0], [0, 0, 1, 1, 1, 0]);
    //     drawTriangle3DUV(gl, [1.0, 0.0, 0.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0], [0, 0, 1, 0, 1, 1]);

    //     // Bottom of Cube
    //     gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
    //     drawTriangle3DUV(gl, [0.0, 1.0, 1.0,   0.0, 1.0, 0.0,   1.0, 1.0, 1.0], [0, 1, 0, 0, 1, 1]);
    //     drawTriangle3DUV(gl, [1.0, 1.0, 1.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0], [1, 1, 0, 0, 1, 0]);
 
    // }

    // renderFast() {
    //     var rgba = this.color;
        
    //     gl.uniform1i(u_whichTexture, this.textureNum);
    //     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
    //     // Use initDrawTriangle3DUVNormal instead of initDrawTriangle3D
    //     initDrawTriangle3DUVNormal();
        
    //     // Bind vertex data
    //     gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    //     gl.bufferData(gl.ARRAY_BUFFER, this.allVerts, gl.DYNAMIC_DRAW);
        
    //     // Bind UV data
    //     gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
    //     gl.bufferData(gl.ARRAY_BUFFER, this.allUVs, gl.DYNAMIC_DRAW);
        
    //     // Bind normal data
    //     gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);
    //     gl.bufferData(gl.ARRAY_BUFFER, this.allNormals, gl.DYNAMIC_DRAW);
        
    //     // Draw the cube
    //     gl.drawArrays(gl.TRIANGLES, 0, this.allVerts.length/3);
    // }

    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var d = Math.PI/10;
        var dd = Math.PI/10;

        for (var t = 0; t < Math.PI; t += d) {
            for (var r = 0; r < Math.PI*2; r += d) {
                var p1 = [Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t)];
                var p2 = [Math.sin(t + dd) * Math.cos(r), Math.sin(t + dd) * Math.sin(r), Math.cos(t + dd)];
                var p3 = [Math.sin(t) * Math.cos(r + dd), Math.sin(t) * Math.sin(r + dd), Math.cos(t)];
                var p4 = [Math.sin(t + dd) * Math.cos(r + dd), Math.sin(t + dd) * Math.sin(r + dd), Math.cos(t + dd)];

                var v = [];
                var uv = [];
                v = v.concat(p1); uv = uv.concat([0,0]);
                v = v.concat(p4); uv = uv.concat([0,0]); 
                v = v.concat(p2); uv = uv.concat([0,0]); 

                gl.uniform4f(u_FragColor, 1,1,1,1);
                drawTriangle3DUVNormal(v, uv,v);

                v = []; uv = [];
                v = v.concat(p1); uv = uv.concat([0,0]);
                v = v.concat(p3); uv = uv.concat([0,0]); 
                v = v.concat(p4); uv = uv.concat([0,0]);
                
                gl.uniform4f(u_FragColor, 1,1,1,1);
                drawTriangle3DUVNormal(v, uv,v);
            }
        }
    }
}