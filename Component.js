class Component {
    constructor(transformation, materials, comptexture, children) {
        this.transformation = transformation;
        this.children = children;
        this.materials = materials;
        this.currentMaterial = materials[0];
        this.texture = comptexture;
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
        this.enabled = false;
    }
}