/**
* MySphere
* @constructor
*/
class MySphere extends CGFobject {
  constructor(scene, horizontalSlices, verticalSlices, radius) {
    super(scene);
    this.horizontalSlices = horizontalSlices;
    this.verticalSlices = verticalSlices;
    this.radius = radius;
    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    for (let latNumber = 0; latNumber <= this.horizontalSlices; ++latNumber) {
      let theta = latNumber * Math.PI / this.horizontalSlices;
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);
      for (let longNumber = 0; longNumber <= this.verticalSlices; ++longNumber) {
        let phi = longNumber * 2 * Math.PI / this.verticalSlices;
        let sinPhi = Math.sin(phi);
        let cosPhi = Math.cos(phi);
        let x = sinPhi * sinTheta;
        let y = cosTheta;
        let z = cosPhi * sinTheta;
        let u = 1 - (longNumber / this.verticalSlices);
        let v = 1 - (latNumber / this.horizontalSlices);
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
    for (let latNumber = 0; latNumber < this.horizontalSlices; ++latNumber) {
      for (let longNumber = 0; longNumber < this.verticalSlices; ++longNumber) {
        let first = (latNumber * (this.verticalSlices + 1)) + longNumber;
        let second = first + this.verticalSlices + 1;
        this.indices.push(first);
        this.indices.push(second);
        this.indices.push(first + 1);
        this.indices.push(first + 1);
        this.indices.push(second);
        this.indices.push(second + 1);
      }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }
}
