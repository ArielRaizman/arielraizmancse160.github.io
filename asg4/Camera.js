class Camera {
    constructor(canvasElement) {
      this.fov = 90;
      this.canvas = canvasElement;
      this.eye = new Vector3([0, 0.8, 3]);
      this.at = new Vector3([0, 0.8, 0]);
      this.up = new Vector3([0, 1, 0]);
      
      this.eyeHeight = 0.5;  // Keep this for other calculations
      
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
      const eyeToLookYDiff = this.at.elements[1] - this.eye.elements[1];
      
      let f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);
      f.elements[1] = 0;
      f.normalize();
      f.mul(speed);
      
      this.eye.elements[0] += f.elements[0];
      this.eye.elements[2] += f.elements[2];
      
      this.at.elements[0] += f.elements[0];
      this.at.elements[1] = this.eye.elements[1] + eyeToLookYDiff;
      this.at.elements[2] += f.elements[2];
      
      this.updateViewMatrix();
    }
    
    moveBackward(speed) {
      this.moveForward(-speed);
    }
    
    moveLeft(speed) {
      const eyeToLookYDiff = this.at.elements[1] - this.eye.elements[1];
      
      let f = new Vector3();
      f.set(this.at);
      f.sub(this.eye);
      f.elements[1] = 0; 
      
      let s = new Vector3();
      s = Vector3.cross(this.up, f);
      s.normalize();
      s.mul(speed);
      
      this.eye.elements[0] += s.elements[0];
      this.eye.elements[2] += s.elements[2];
      
      this.at.elements[0] += s.elements[0];
      this.at.elements[1] = this.eye.elements[1] + eyeToLookYDiff;
      this.at.elements[2] += s.elements[2];
      
      this.updateViewMatrix();
    }
    
    moveRight(speed) {
      this.moveLeft(-speed);
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
    
    moveUp(speed) {
      const eyeToLookYDiff = this.at.elements[1] - this.eye.elements[1];
      
      this.eye.elements[1] += speed;
      this.at.elements[1] = this.eye.elements[1] + eyeToLookYDiff;
      
      this.updateViewMatrix();
    }
    
    moveDown(speed) {
      this.moveUp(-speed);
    }
    
    jump() {
      this.moveUp(0.2);
    }
    
    update() {
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