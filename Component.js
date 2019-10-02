class Component {
    constructor(transformation, materials, comptexture, children) {
        this.transformation = transformation;
        this.children = children;
        this.materials = materials;
        this.currentMaterial = materials[0];
        this.texture = comptexture;
    }

    display(scene, currTrans, currMaterial, currTexture) {
        currTrans = mat4.clone(currTrans);
        mat4.multiply(currTrans, this.transformation, currTrans)
        // Not null -> not inherit
        if (this.material != null) 
            currMaterial = this.material;
        if (!this.texture.inherit)
            currTexture = this.texture
        for (var i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            if (child instanceof CGFobject) {
                currMaterial.apply();
                currMaterial.setTexture(currTexture.texture);
                scene.pushMatrix();
                scene.multMatrix(currTrans);
                child.display(scene);
                scene.popMatrix();
            }
            else child.display(scene, currTrans, currMaterial, currTexture)
        }
    }
}


/**
 * Stores a texture for a component: CGFTexture, length_s, length_t
 */
class ComponentTexture {
    constructor(texture, length_s, length_t) {
        this.texture = texture;
        this.length_s = length_s;
        this.length_t = length_t;
        this.enabled = true;
        this.inherit = (this.texture == null);
    }
}

class EmptyTexture extends ComponentTexture {
    constructor() {
        super()
        this.texture = null;
        this.enabled = false;
        this.inherit = false;
    }
}