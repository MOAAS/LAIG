/**
* MyScene
* @constructor
*/
class Object extends CGFobject {
    constructor(scene) {
        super(scene);

        this.material = new MyCGFappearance(scene, 0.35, 0.7, 0.3, 10);

        this.transformations = []
        
        this.xpos = 0;
        this.ypos = 0;
        this.zpos = 0;

        this.xAngle = 0;
        this.yAngle = 0;
        this.zAngle = 0;   
        
        this.xScale = 1;
        this.yScale = 1;
        this.zScale = 1;
        
    }

    translate(x, y, z) {
        // se a ultima transformacao foi uma translacao, adiciona aos valores dela
        // (mini otimizacao)
        let length = this.transformations.length;
        if (length > 0 && this.transformations[length - 1] instanceof Translation) {
            this.transformations[length - 1].x += x;
            this.transformations[length - 1].y += y
            this.transformations[length - 1].z += z;
        }
        else this.transformations.push(new Translation(x, y, z))
    }

    rotate(angle, x, y, z) {
        this.transformations.push(new Rotation(angle, x, y, z))
    }

    scale(x, y, z) {
        this.transformations.push(new Scaling(x,y,z))
    }

    setPos(x, y, z) {
        if (x != null)
            this.xpos = x;
        if (y != null)
            this.ypos = y;
        if (z != null)
            this.zpos = z;        
    }

    movePos(x, y, z) {
        this.xpos += x;
        this.ypos += y;
        this.zpos += z;        
    }

    setAngle(x, y, z) {
        if (x != null)
            this.xAngle = x;
        if (y != null)
            this.yAngle = y;
        if (z != null)
            this.zAngle = z;        
    }

    moveAngle(x, y, z) {
        this.xAngle += x;
        this.yAngle += y;
        this.zAngle += z;
        // normaliza os angulos para [0, 2PI]
        while (this.xAngle > 2 * Math.PI)    
            this.xAngle -= 2 * Math.PI;
        while (this.yAngle > 2 * Math.PI)    
            this.yAngle -= 2 * Math.PI;
        while (this.zAngle > 2 * Math.PI)    
            this.zAngle -= 2 * Math.PI;
    }

    setScale(x, y, z) {
        this.xScale = x;
        this.yScale = y;
        this.zScale = z;
    }

    addScale(x, y, z) {
        this.xScale *= x;
        this.yScale *= y;
        this.zScale *= z;
    }


    applySceneTransformations() {
        for (let transformation in this.transformations)
            transformation.apply(this.scene);

        // Applies general transformations
        this.scene.translate(this.xpos, this.ypos, this.zpos);
        this.scene.rotate(this.zAngle, 0, 0, 1);
        this.scene.rotate(this.yAngle, 0, 1, 0);
        this.scene.rotate(this.xAngle, 1, 0, 0);
        this.scene.scale(this.xScale, this.yScale, this.zScale)        
    }
    
    // Aplica as transformacoes necessarias e mostra o objeto
    display() {
        this.scene.pushMatrix()
        this.applySceneTransformations();

        // Applies texture to scene
        if (this.material != null)
            this.material.apply();
    
        super.display();
        this.scene.popMatrix();        
    }

    // --- Lighting, Materials, Textures -- //

    setMaterial(material) {
        this.material = material;
    }

    setTexture(texture) {
        if (this.material != null)
            this.material.setTexture(texture);
    }

    setTextureWrap(x, y) {
        this.material.setTextureWrap(x,y);
    }
}