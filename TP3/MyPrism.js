class MyPrism extends CGFobject {
    constructor(scene, slices) {
        super(scene);
        this.slices = slices;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        let angDiff = 2*Math.PI/this.slices;


        for(let i = 0, ang = 0; i < this.slices; i++, ang += angDiff) {
            this.vertices.push(Math.cos(ang), 1, Math.sin(ang));
            this.texCoords.push((Math.cos(ang) + 1) / 2, (Math.sin(ang) + 1) / 2);
            this.normals.push(0,1,0);
        }

        for(let i = 1; i < this.slices - 1; i++) {
            this.indices.push(0, i + 1 , i )
        }
            
        for(let i = 0, ang = 0; i < this.slices; i++, ang += angDiff) {
            this.vertices.push(Math.cos(ang), 0, Math.sin(ang));
            this.texCoords.push((Math.cos(ang) + 1) / 2, (Math.sin(ang) + 1) / 2);
            this.normals.push(0,-1,0);
        }
        
        for(let i = 1; i < this.slices - 1; i++) {
            this.indices.push(this.slices , this.slices + i, this.slices + i + 1)
        }  
        
        for(let i = 0, ang = 0; i < this.slices; i++, ang += angDiff) {
            // Add vertices
            this.vertices.push(Math.cos(ang), 0, -Math.sin(ang)); // 0 + 4 * i
            this.vertices.push(Math.cos(ang), 1, -Math.sin(ang)); // 1 + 4 * i

            this.vertices.push(Math.cos(ang + angDiff), 0, -Math.sin(ang + angDiff)); // 2 + 4 * i
            this.vertices.push(Math.cos(ang + angDiff), 1, -Math.sin(ang + angDiff)); // 3 + 4 * i

            this.texCoords.push(ang / (2*Math.PI), 1);
            this.texCoords.push(ang / (2*Math.PI), 0);
            this.texCoords.push((ang + angDiff) / (2*Math.PI), 1);
            this.texCoords.push((ang + angDiff) / (2*Math.PI), 0);


            this.indices.push(4 * i + 2 * this.slices + 0, 4 * i + 2 * this.slices + 2, 4 * i + 2 * this.slices + 1)
            this.indices.push(4 * i + 2 * this.slices + 3, 4 * i + 2 * this.slices + 1, 4 * i + 2 * this.slices + 2)

            let normal = [Math.sin(ang + angDiff) - Math.sin(ang), 0, Math.cos(ang + angDiff) - Math.cos(ang)]
            // normalization
            let normalLength=Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2])
            normal[0] /= normalLength;
            normal[1] /= normalLength;
            normal[2] /= normalLength;          
            
            this.normals.push(...normal);
            this.normals.push(...normal);
            this.normals.push(...normal);
            this.normals.push(...normal);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    
	
}