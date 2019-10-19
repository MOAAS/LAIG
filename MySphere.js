/**
* MySphere
* @constructor
*/
class MySphere extends CGFobject {
  constructor(scene, stacks, slices, radius) {
    super(scene);
    this.stacks = stacks;
    this.slices = slices;
    this.radius = radius;
    this.initBuffers();
  }
  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    for (let latNumber = 0; latNumber <= this.stacks; ++latNumber) {
      let theta = (latNumber * Math.PI/2) / this.stacks;
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);
      for (let longNumber = 0; longNumber <= this.slices; ++longNumber) {
        let phi = longNumber * 2 * Math.PI / this.slices;
        let sinPhi = Math.sin(phi);
        let cosPhi = Math.cos(phi);
        let x = cosTheta*cosPhi;
        let y = cosTheta*sinPhi;
        let z = sinTheta;
        let u = 1 - (longNumber / this.slices);
        let v = 0.5 - (latNumber / this.stacks) / 2;
        this.vertices.push(this.radius * x);
        this.vertices.push(this.radius * y);
        this.vertices.push(this.radius * z);
        this.normals.push(x);
        this.normals.push(y);
        this.normals.push(z);
        this.texCoords.push(u);
        this.texCoords.push(v);
      }
    }


    for (let latNumber = -this.stacks; latNumber <= 0; ++latNumber) {
      let theta = (latNumber * Math.PI/2) / this.stacks;
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);
      for (let longNumber = 0; longNumber <= this.slices; ++longNumber) {
        let phi = longNumber * 2 * Math.PI / this.slices;
        let sinPhi = Math.sin(phi);
        let cosPhi = Math.cos(phi);
        let x = cosTheta*cosPhi;
        let y = cosTheta*sinPhi;
        let z = sinTheta;
        let u = 1 - (longNumber / this.slices);
        let v = 0.5 - (latNumber / this.stacks) / 2;
        this.vertices.push(this.radius * x);
        this.vertices.push(this.radius * y);
        this.vertices.push(this.radius * z);
        this.normals.push(x);
        this.normals.push(y);
        this.normals.push(z);
        this.texCoords.push(u);
        this.texCoords.push(v);
      }
    }
    
    // Calculate sphere indices.
    for (let latNumber = 0; latNumber <= this.stacks*2; ++latNumber) {
      for (let longNumber = 0; longNumber < this.slices; ++longNumber) {
        let first = (latNumber * (this.slices + 1)) + longNumber;
        let second = first + this.slices + 1;
        this.indices.push(second);
        this.indices.push(first);
        this.indices.push(first + 1);
        this.indices.push(first + 1);
        this.indices.push(second + 1);
        this.indices.push(second);
      }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }
}
