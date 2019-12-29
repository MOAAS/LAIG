class Component {
    constructor(scene, children, transformationMatrix, animation, material, comptexture) {
        this.scene = scene;
        this.children = children || [];
        // Sets identity matrix as default matrix
        // Sets empty animation as default animation
        // Sets default apearance as default material
        // Sets no texture as default texture
        this.transformationMatrix = transformationMatrix || mat4.create();
        this.setAnimation(animation || new MyAnimation([]));
        this.material = material || new CGFappearance(scene);
        this.texture = comptexture || new ComponentTexture(null, 1, 1);
        this.animationMatrix = mat4.create();
    }

    clone() {
        // For each child, gets a clone
        let childrenClones  = []
        for (let i = 0; i <this.children.length; i++) {
            if (this.children[i] instanceof Component)  // if component, clones component
                childrenClones.push(this.children[i].clone())
            else childrenClones.push(this.children[i]); // else puts primitive 
        }
        // returns new component with cloned children
        let cloneComponent = new Component(this.scene, childrenClones, this.transformationMatrix, this.animation, this.material, this.texture);

        // copies animation state in case animation was running
        cloneComponent.copyAnimationStateFrom(this);
        return cloneComponent
    }

    copyAnimationStateFrom(component) {
        // Copies an animation from a component, keeping the current state as well
        this.animation = component.animation;
        this.animationStarted = component.animationStarted;
        this.animationStartTime = component.animationStartTime;
    }

    update(t) {
        if (this.animation == null)
            return;
        // Starts the animation if not started
        if (this.animationStarted == false) {
            this.animationStarted = true;
            this.animationStartTime = t;
        }
        // Calculates the matrix based on the animation start time
        this.animationMatrix = this.animation.apply(this.animationStartTime, t);
    }

    setAnimation(animation) {
        // Sets new animation and stops previous one
        this.animation = animation;
        this.animationStarted = false;
    }

    setTexture(texture) {
        // Sets component texture
        this.texture = new ComponentTexture(texture, 1, 1);
    }

    reverseAnimation() {
        if (this.animation == null)
            return console.log("Animation is null.");
        if (!this.animationStarted)
            return console.log("Animation hasn't been started, can't reverse") 
        // Creates the opposite animation       
        this.animation = this.animation.reverse()
        // Calculating the new start time (animation can still be running)
        let lastInstant = this.animation.keyframes[this.animation.keyframes.length - 1].instant;
        let now = new Date().getTime()
        // Calculate new start time based on how long the animation had been running
        this.animationStartTime = now + Math.min(0, now - this.animationStartTime - 1000 * lastInstant);
    }

    setOnPick(onPick, pickID) {
        // Setting on pick function and pick id. if pick id is undefined, change just onPick function
        this.onPick = onPick;
        if (pickID != null)
            this.pickID = pickID;
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
        if (this.onPick != null) {            
            this.scene.registerForPick(this.pickID, this);
        }

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

        if (this.onPick != null)
            this.scene.clearPickRegistration();
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
