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

        var aaa = 2 * Math.PI / this.loops;
        var bbb = 2 * Math.PI / this.slices;
/*
        for (let i = 0; i < 2 * Math.PI; i += aaa) {
            for (let j = 0; j < 2 * Math.PI; j += bbb) {
                let x = (this.outterRadius + this.innerRadius * Math.cos(j) * Math.cos(i));
                let y = (this.outterRadius + this.innerRadius * Math.cos(j) * Math.sin(i));
                let z = this.innerRadius * Math.sin(j);
                let xNormal = Math.cos(j) * Math.cos(i);
                let yNormal = Math.cos(j) * Math.sin(i);
                let zNormal = Math.sin(j);

                this.vertices.push(x);
                this.vertices.push(y);
                this.vertices.push(z);

                this.normals.push(xNormal);
                this.normals.push(yNormal);
                this.normals.push(zNormal);
            }
        }
        */
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
             cos_loops * sin_slices, 
             sin_loops * sin_slices, 
             cos_slices);
  
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
    /*
 
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
}*/
}