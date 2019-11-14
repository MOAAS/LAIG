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

        this.rectangle.display();
    }
}