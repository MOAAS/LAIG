class MySecurityCamera extends CGFobject {
    constructor(scene, rtt) {
        super(scene)
        this.rectangle = new MyRectangle(scene, "camera", 0.5, 1, -1, -0.5)

        for (let i = 0; i < this.rectangle.texCoords.length; i++)
            this.rectangle.texCoords[i] = this.rectangle.texCoords[i] * 2;
        this.rectangle.updateTexCoordsGLBuffers();

        debugger;
        
        this.rtt = rtt;
    }

    display() {
        let material = new CGFappearance(this.scene);
        material.setAmbient(1,1,1,1)
       material.setTexture(this.rtt);
        material.apply();

        this.rectangle.display();
    }
}