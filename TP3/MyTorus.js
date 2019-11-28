/**
* MySphere
* @constructor
*/
class MyTorus extends CGFobject {
  constructor(scene, slices, loops, innerRadius, outerRadius) {
    super(scene);
    this.slices = slices;
    this.loops = loops;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];
  
    //Goes around inner circle
    for (let slice = 0; slice <= this.slices; ++slice) {
      let v = slice / this.slices;
      //slice angle
      let theta = slice / this.slices * 2 * Math.PI;
      let cos_theta = Math.cos(theta);
      let sin_theta = Math.sin(theta);
      let slice_rad = this.outerRadius + this.innerRadius * cos_theta;

      //Goes around outer circle
      for (let loop = 0; loop <= this.loops; ++loop) {
        let u = loop / this.loops;
        //loop angle
        let phi =loop / this.loops * 2 * Math.PI;
        let cos_phi = Math.cos(phi);
        let sin_phi = Math.sin(phi);

        let x = slice_rad * cos_phi; // x = (R + r cos(theta)) * cos(phi)
        let y = slice_rad * sin_phi; // y = (R + r cos(theta)) * sin(phi)
        let z = this.innerRadius * sin_theta; // z = r * sin (theta)

        this.vertices.push(x, y, z);

        //Normals
        this.normals.push(
          cos_theta * cos_phi,
          cos_theta * sin_phi,
          sin_theta);

        //texCoords
        this.texCoords.push(u);
        this.texCoords.push(v);
      }
    }

    // Calculate torus indices
    const vertsPerSlice = this.loops + 1;
    for (let i = 0; i < this.slices; ++i) {
      let v1 = i * vertsPerSlice;
      let v2 = v1 + vertsPerSlice;

      for (let j = 0; j < this.loops; ++j) {

        this.indices.push(v1);
        this.indices.push(v1 + 1);
        this.indices.push(v2);

        this.indices.push(v2);
        this.indices.push(v1 + 1);
        this.indices.push(v2 + 1);

        v1 += 1;
        v2 += 1;
      }
    }
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

}