class Triangle{ 
    constructor() {
      this.type = 'triangle';
      this.position = [0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0,1.0];
      this.size = 10;
    }
  
    render() {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;
  
      // Pass the position of a point to a_Position variable
    //   gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Pass the size of a point to gl_PointSize variable
      gl.uniform1f(u_Size, size);
      // Draw
    //   gl.drawArrays(gl.POINTS, 0, 1);
      var d = this.size/200.0;
      drawTriangle(gl,[xy[0],xy[1],xy[0]+d,xy[1],xy[0],xy[1]+d]);
    }
  }


function drawTriangle(gl,vertices) {
    // var vertices = new Float32Array([
    //   0, 0.5,   -0.5, -0.5,   0.5, -0.5
    // ]);
    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    // var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // if (a_Position < 0) {
    //   console.log('Failed to get the storage location of a_Position');
    //   return -1;
    // }
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    // return n;
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

  
  function drawPicture() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    //mountain
    gl.uniform4f(u_FragColor, 0.6, 0.3, 0.0, 1.0); 
    drawTriangle(gl, [0.0, 0.7, -0.6, -0.5, 0.6, -0.5]);

    // snow
    gl.uniform4f(u_FragColor, 0.9, 0.9, 0.9, 1.0); 
    drawTriangle(gl, [0.0, 0.7, -0.2, 0.3, 0.2, 0.3]);

    // spikey snow
    gl.uniform4f(u_FragColor, 0.9, 0.9, 0.9, 1.0); 
    drawTriangle(gl, [-0.2, 0.2, -0.2, 0.3, 0.0, 0.3]);

    gl.uniform4f(u_FragColor, 0.9, 0.9, 0.9, 1.0); 
    drawTriangle(gl, [0.2, 0.2, 0.2, 0.3, 0.0, 0.3]);


    // left tree
    drawTree(-0.6, -0.6); 

    // right tree
    drawTree(0.6, -0.6); 

    drawStar(0.5, 0.8, 0.03); 
    drawStar(0.4, 0.5, 0.04); 
    drawStar(0.7, 0.6, 0.02); 
    drawStar(0.6, 0.3, 0.03);
    drawStar(-0.5, 0.8, 0.04);
    drawStar(-0.4, 0.5, 0.02);
    drawStar(-0.7, 0.6, 0.03);
    drawStar(-0.6, 0.3, 0.03);
    drawStar(-0.2, 0.9, 0.02);
    drawStar(0.2, 0.9, 0.03);

}

function drawTree(x, y) {
    // trunk
    gl.uniform4f(u_FragColor, 0.5, 0.25, 0.0, 1.0);
    drawTriangle(gl, [x - 0.1, y, x + 0.1, y, x, y + 0.3]); 

    // leaves
    gl.uniform4f(u_FragColor, 0.0, 0.5, 0.0, 1.0);

    drawTriangle(gl, [x - 0.3, y + 0.3, x + 0.3, y + 0.3, x, y + 0.45]);  
    drawTriangle(gl, [x - 0.25, y + 0.45, x + 0.25, y + 0.45, x, y + 0.6]);  
    drawTriangle(gl, [x - 0.2, y + 0.6, x + 0.2, y + 0.6, x, y + 0.75]); 
}

function drawStar(x, y, size) {
  // triangle
  gl.uniform4f(u_FragColor, 0.9, 0.9, 0.4, 1.0);
  drawTriangle(gl, [x, y + size, x - size, y - size, x + size, y - size]);

  // upside down triangle
  gl.uniform4f(u_FragColor, 0.9, 0.9, 0.4, 1.0); 
    drawTriangle(gl, [x, y - size * 1.5, x - size, y + size * 0.5, x + size, y + size * 0.5]);
}







function drawTriangle3D(gl,vertices) {
  // var vertices = new Float32Array([
  //   0, 0.5,   -0.5, -0.5,   0.5, -0.5
  // ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // return n;
  gl.drawArrays(gl.TRIANGLES, 0, n);
  // console.log("drawTriangle3D")
}

function drawTriangle3DUV(gl,vertices,uv) {
  var n  = 3;

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);

  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_uv);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}