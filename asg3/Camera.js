class Camera {
    constructor(canvasElement) {
      this.fov = 60;
      this.canvas = canvasElement;
      this.eye = new Vector3([0, 0, 0]);
      this.at = new Vector3([0, 0, -1]);
      this.up = new Vector3([0, 1, 0]);
      
      this.viewMatrix = new Matrix4();
      this.updateViewMatrix();
      
      this.projectionMatrix = new Matrix4();
      this.updateProjectionMatrix();
    }
    
    updateViewMatrix() {
      this.viewMatrix.setLookAt(
        this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
        this.at.elements[0], this.at.elements[1], this.at.elements[2],
        this.up.elements[0], this.up.elements[1], this.up.elements[2]
      );
    }
    
    updateProjectionMatrix() {
      this.projectionMatrix.setPerspective(
        this.fov, 
        canvas.width / canvas.height, 
        0.1, 
        1000
      );
    }
    
    moveForward(speed) {
      let f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);
      f.normalize();
      f.mul(speed);
      
      this.eye.add(f);
      this.at.add(f);
      
      this.updateViewMatrix();
    }
    
    moveBackward(speed) {
      let b = new Vector3();
      b.set(this.eye);
      b.sub(this.at);
      b.normalize();
      b.mul(speed);
      
      this.eye.add(b);
      this.at.add(b);
      
      this.updateViewMatrix();
    }
    
    moveLeft(speed) {
      let f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);
      
      let s = new Vector3();
      s = Vector3.cross(this.up, f);
      s.normalize();
      s.mul(speed);
      
      this.eye.add(s);
      this.at.add(s);
      
      this.updateViewMatrix();
    }
    
    moveRight(speed) {
      let f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);
      
      let s = new Vector3();
      s = Vector3.cross(f, this.up);
      s.normalize();
      s.mul(speed);
      
      this.eye.add(s);
      this.at.add(s);
      
      this.updateViewMatrix();
    }
    
    panLeft(alpha) {
      let f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);
      
      let rotationMatrix = new Matrix4();
      rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      
      let f_prime = rotationMatrix.multiplyVector3(f);
      
      this.at.set(this.eye);
      this.at.add(f_prime);
      
      this.updateViewMatrix();
    }
    
    panRight(alpha) {
      this.panLeft(-alpha);
    }

  panUp(alpha) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    let right = new Vector3();
    right = Vector3.cross(f, this.up);
    right.normalize();
    
    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(alpha, right.elements[0], right.elements[1], right.elements[2]);
    
    let f_prime = rotationMatrix.multiplyVector3(f);
    
    this.at.set(this.eye);
    this.at.add(f_prime);
    
    this.updateViewMatrix();
  }
    
    getViewMatrix() {
      return this.viewMatrix;
    }
    
    getProjectionMatrix() {
      return this.projectionMatrix;
    }
    
    updateAspectRatio() {
      this.updateProjectionMatrix();
    }
  }