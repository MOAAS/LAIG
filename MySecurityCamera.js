class MySecurityCamera extends CGFobject {
    constructor(scene, rtt) {
        super(scene)
        this.rectangle = new MyRectangle(scene, "camera", -0.5, 0.5, -0.5, 0.5)
        this.rtt = rtt;
    }

    display() {
        let material = new CGFappearance(this.scene);
        material.setAmbient(1,1,1,1)
       material.setTexture(this.rtt);
        material.apply();

        this.scene.pushMatrix()
        this.scene.translate(0,0,-8);
        this.scene.scale(20, -20, 20)

        this.rectangle.display();
        this.scene.popMatrix();
    }
}