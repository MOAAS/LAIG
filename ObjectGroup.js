class ObjectGroup extends Object {
	constructor(scene) {
        super(scene);
        
        // Composite pattern
        this.objects = [];
    }

    initBuffers() {
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].initBuffers();
        }		
    }
	
	display() {
        this.scene.pushMatrix()
        this.applySceneTransformations();

        // Applies texture to scene
        if (this.material != null)
            this.material.apply();

        // Displays each component individually
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].display();
        }		

        this.scene.popMatrix();
    }   
   
    addObjects(...args) {
        this.objects.push(...args);
    }

    getObjects() {
        return this.objects;
    }
}
