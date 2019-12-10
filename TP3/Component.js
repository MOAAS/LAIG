class Component {
    constructor(scene, children, transformationMatrix, animation, material, comptexture) {
        this.scene = scene;
        this.children = children;
        // Sets identity matrix as default matrix
        // Sets empty animation as default animation
        // Sets default apearance as default material
        // Sets no texture as default texture
        this.transformationMatrix = transformationMatrix || mat4.create();
        this.animation = animation || new MyAnimation([]);
        this.material = material || new CGFappearance(scene);
        this.texture = comptexture || new ComponentTexture(null, 1, 1);
        this.animationMatrix = mat4.create();
    }

    update(t) {
        if (this.animation == null)
            return;
        // Starts the animation if not started
        if (this.started == null) {
            console.log("START");
            this.started = true;
            this.animation.start(t)
        }
        else this.animationMatrix = this.animation.apply(t);
    }

    display() {
        // picks default initial arguments
        let defaultTrans = mat4.create();
        let defaultMaterial = new CGFappearance(this.scene)
        let defaultTexture = new ComponentTexture(null, 1, 1);
        // Calls recursive display function
        this.displayChildren(defaultTrans, defaultMaterial, defaultTexture);
    }
    
    displayChildren(currTrans, currMaterial, currTexture) {
        // Clones the current transformation to avoid changing the passed reference
        currTrans = mat4.clone(currTrans);
        mat4.multiply(currTrans, currTrans, this.transformationMatrix)
        mat4.multiply(currTrans, currTrans, this.animationMatrix);
        // Not -1 -> not inherit
        if (this.material != -1) 
            currMaterial = this.material;
        // If no inheritance, uses his own texture and ignores passed one
        if (!this.texture.inherit)
            currTexture = this.texture
        // For each child, processes it
        for (var i = 0; i < this.children.length; i++) {
            let child = this.children[i];            
            if (child instanceof CGFobject) { // if child is primitive...
                // Multiplies the texcoords by length_s and length_t, sets the texture and applies the material
                this.multTexCoords(child, 1.0 / currTexture.length_s, 1.0 / currTexture.length_t)
                currMaterial.setTexture(currTexture.texture);        
                currMaterial.apply();
                // Saves the scene matrix, applies transformations to the scene, displays the primitive and restores the scene matrix
                this.scene.pushMatrix();
                this.scene.multMatrix(currTrans);
                child.display();
                this.scene.popMatrix();
                // Restores the original texcoords
                this.multTexCoords(child, currTexture.length_s, currTexture.length_t)
            }
            // if component, calls the function again with the current arguments
            else child.displayChildren(currTrans, currMaterial, currTexture)
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
