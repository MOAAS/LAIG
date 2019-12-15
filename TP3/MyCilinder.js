class MyCilinder extends CGFobject {
    constructor(scene, base, top, height, slices, stacks) {
        super(scene);
        this.baseRadius = base;
        this.topRadius = top;
        this.height = height;
        this.stacks = stacks;
        this.slices = slices;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var angDiff = 2*Math.PI/this.slices;

        // Base superior 
        for(var i = 0, ang = 0; i < this.slices; i++, ang += angDiff) {
            this.vertices.push(Math.cos(ang) * this.topRadius, Math.sin(ang) * this.topRadius, this.height);
            this.texCoords.push((Math.cos(ang) + 1) / 2, (Math.sin(ang) + 1) / 2);
            this.normals.push(0,0,1);
        }

        for(var i = 1; i < this.slices - 1; i++) {
            this.indices.push(i, i + 1, 0)
        }
            
        // Base inferior
        for(var i = 0, ang = 0; i < this.slices; i++, ang += angDiff) {
            this.vertices.push(Math.cos(ang) * this.baseRadius, Math.sin(ang) * this.baseRadius, 0);
            this.texCoords.push((Math.cos(ang) + 1) / 2, (Math.sin(ang) + 1) / 2);
            this.normals.push(0,0,-1);
        }
        
        for(var i = 1; i < this.slices - 1; i++) {
            this.indices.push(this.slices + i + 1, this.slices + i, this.slices)
        } 

        var angDiff = 2*Math.PI / this.slices;
        var zDiff = this.height / this.stacks;
        var radiusDiff = (this.topRadius - this.baseRadius) / this.stacks;

        // Goes around the cylinder
        for(var i = 0, ang = 0; i <= this.slices; i++, ang += angDiff) {
            // Goes up the cylinder
            for(var j = 0, z = 0, radius = this.baseRadius; j <= this.stacks; j++, z += zDiff, radius += radiusDiff) {
                // (R*cos, R*sin, z) -> twice for the inner walls
                this.vertices.push(Math.cos(ang) * radius, Math.sin(ang)  * radius, z); 

                // normal to the circle point
                this.normals.push(Math.cos(ang)  * radius, Math.sin(ang)  * radius, 0);
                
                // Texture also wraps around the cylinder
                this.texCoords.push(1 - ang / (2*Math.PI), 1 - z / this.height);

                // Calculate indices for a square (inner and outer wall)
                var currVertIndex = (this.slices * 2) + (this.stacks + 1) * i + j;
                var nextVertIndex = currVertIndex + 1;
                var nextSliceVertIndex = currVertIndex + (this.stacks + 1);
                var nextSliceNextVertIndex = nextSliceVertIndex + 1;

                if (j != this.stacks && i != this.slices) {

                   this.indices.push(currVertIndex, nextSliceVertIndex, nextVertIndex);
                   this.indices.push(nextVertIndex, nextSliceVertIndex, nextSliceNextVertIndex);
                }
    
            }
            
        }
 

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
