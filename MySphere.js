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

    //goes around latitute of the semi-sphere z>0
    for (let latNumber = -this.stacks; latNumber <= this.stacks; ++latNumber) {
      let theta = (latNumber * Math.PI/2) / this.stacks;
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta);
      //goes around longitude of the sphere
      for (let longNumber = 0; longNumber <= this.slices; ++longNumber) {
        let phi = longNumber * 2 * Math.PI / this.slices;
        let sinPhi = Math.sin(phi);
        let cosPhi = Math.cos(phi);
        let x = cosTheta*cosPhi;
        let y = cosTheta*sinPhi;
        let z = sinTheta;
        //vertices 
        this.vertices.push(this.radius * x); //x = r * cos(theta) * cos(phi)
        this.vertices.push(this.radius * y); //y = r * cos(theta) * sin(phi)
        this.vertices.push(this.radius * z); //z = r * sin(theta)

        //normals have the direction of the vertices coordinates
        this.normals.push(x);
        this.normals.push(y);
        this.normals.push(z);
        
        //texCoords
        let u = 1 - (longNumber / this.slices);
        let v = 0.5 - (latNumber / this.stacks) / 2;
        this.texCoords.push(u);
        this.texCoords.push(v);
      }
    }
    
    // Calculate sphere indices
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
