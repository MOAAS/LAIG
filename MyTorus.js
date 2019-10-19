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

    for (let slice = 0; slice <= this.slices; ++slice) {
      const v = slice / this.slices;
      const slice_angle = v * 2 * Math.PI;
      const cos_slices = Math.cos(slice_angle);
      const sin_slices = Math.sin(slice_angle);
      const slice_rad = this.outerRadius + this.innerRadius * cos_slices;

      for (let loop = 0; loop <= this.loops; ++loop) {
        const u = loop / this.loops;
        const loop_angle = u * 2 * Math.PI;
        const cos_loops = Math.cos(loop_angle);
        const sin_loops = Math.sin(loop_angle);

        const x = slice_rad * cos_loops;
        const y = slice_rad * sin_loops;
        const z = this.innerRadius * sin_slices;

        this.vertices.push(x, y, z);
        this.normals.push(
          cos_slices * cos_loops,
          cos_slices * sin_loops,
          sin_slices);

        this.texCoords.push(u);
        this.texCoords.push(v);
      }
    }
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