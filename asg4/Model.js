class Model {
  constructor(gl, filePath) {
    this.filePath = filePath;
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.gl = gl;
    this.loaded = false;

    this.loader = new OBJLoader(this.filePath);
    this.loader.parseModel().then(() => {
      try {
        this.modelData = this.loader.getModelData();
        if (!this.modelData || !this.modelData.vertices || this.modelData.vertices.length === 0) {
          console.error("Invalid model data for", this.filePath);
          return;
        }
        
        // Create buffers immediately upon loading
        this.vertexBuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();

        if (!this.vertexBuffer || !this.normalBuffer) {
          console.error("Failed to create buffers for", this.filePath);
          return;
        }
        
        // Enable 32-bit indices for large models
        gl.getExtension('OES_element_index_uint');
        
        console.log(`Model loaded: ${this.filePath}, vertices: ${this.modelData.vertices.length/3}`);
        this.loaded = true;
      } catch (err) {
        console.error("Error processing model data:", err);
      }
    }).catch(err => {
      console.error("Error loading model:", err);
    });
  }

  render(gl, program) {
    if (!this.loaded || !this.modelData || !this.modelData.vertices) {
      return;
    }

    // Use much smaller chunks for safer rendering
    const chunkSize = 512; // Drastically reduced chunk size
    const totalVertices = this.modelData.vertices.length / 3;
    
    for (let i = 0; i < totalVertices; i += chunkSize) {
      const vertexCount = Math.min(chunkSize, totalVertices - i);
      const start = i * 3;
      const end = start + vertexCount * 3;
      
      try {
        // Buffer vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(this.modelData.vertices.slice(start, end)),
          gl.STREAM_DRAW  // Use STREAM_DRAW for maximum compatibility
        );
        
        // Make sure the attribute is enabled and properly set
        gl.enableVertexAttribArray(program.a_Position);
        gl.vertexAttribPointer(program.a_Position, 3, gl.FLOAT, false, 0, 0);

        // Buffer normals - carefully check if normals exist and match vertices
        if (this.modelData.normals && this.modelData.normals.length >= end) {
          gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.modelData.normals.slice(start, end)),
            gl.STREAM_DRAW
          );
          
          gl.enableVertexAttribArray(program.a_Normal);
          gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0, 0);
        } else {
          // If no proper normals, use default
          gl.disableVertexAttribArray(program.a_Normal);
          gl.vertexAttrib3f(program.a_Normal, 0.0, 0.0, 1.0);
        }

        // Set model matrix and color
        gl.uniformMatrix4fv(program.u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4fv(program.u_FragColor, this.color);

        // Set normal matrix
        const normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(program.u_NormalMatrix, false, normalMatrix.elements);

        // Draw this chunk
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
        
      } catch (e) {
        console.error(`Error rendering chunk ${i}/${totalVertices}:`, e);
      }
    }
  }
}
