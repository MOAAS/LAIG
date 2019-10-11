class Component {
    constructor(transformation, materials, comptexture, children) {
        this.transformation = transformation;
        this.children = children;
        this.materials = materials;
        this.currMaterialIndex = 0;
        this.texture = comptexture;
    }

    display(scene, currTrans, currMaterial, currTexture) {
        // Clones the current transformation to avoid changing the passed reference
        currTrans = mat4.clone(currTrans);
        mat4.multiply(currTrans, currTrans, this.transformation)
        // Not null -> not inherit
        if (this.materials[this.currMaterialIndex] != null) 
            currMaterial = this.materials[this.currMaterialIndex];
        // If no inheritance, uses his own texture and ignores passed one
        if (!this.texture.inherit)
            currTexture = this.texture
        // For each child, processes it
        for (var i = 0; i < this.children.length; i++) {
            let child = this.children[i];            
            if (child instanceof CGFobject) { // if child is primitive...
                // Multiplies the texcoords by length_s and length_t, sets the texture and applies the material
                this.multTexCoords(child, currTexture.length_s, currTexture.length_t)
                currMaterial.setTexture(currTexture.texture);        
                currMaterial.apply();
                // Saves the scene matrix, applies transformations to the scene, displays the primitive and restores the scene matrix
                scene.pushMatrix();
                scene.multMatrix(currTrans);
                child.display(scene);
                scene.popMatrix();
                // Restores the original texcoords
                this.multTexCoords(child, 1.0 / currTexture.length_s, 1.0 / currTexture.length_t)
            }
            // if component, calls the function again with the current arguments
            else child.display(scene, currTrans, currMaterial, currTexture)
        }
    }

    multTexCoords(primitive, sFact, tFact) {
        // Multiplies every s texcoord by sFact and t texcoords by tFact
        for (let i = 0; i < primitive.texCoords.length; i += 2) {
            primitive.texCoords[i] *= sFact;
            primitive.texCoords[i + 1] *= tFact;
        }
        primitive.updateTexCoordsGLBuffers();    
    }

    cycleMaterial() {
        // Changes the current material to the next one on the list
        this.currMaterialIndex = (this.currMaterialIndex + 1) % this.materials.length
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
        this.inherit = false;
    }
}

class InheritedTexture extends ComponentTexture {
    constructor() {
        super(null, 1, 1)
        this.inherit = true;
    }
}
