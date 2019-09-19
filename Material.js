class Material extends CGFappearance {
    constructor(scene, amb, diff, spec, shininess, texture) {
        super(scene);
        this.setAmbient(amb , amb , amb , 1.0);
        this.setDiffuse(diff , diff , diff , 1.0);
        this.setSpecular(spec , spec , spec , 1.0);
		this.setShininess(shininess);
        this.amb = amb;
        this.diff = diff;
        this.spec = spec;

        super.setTexture(texture);
    }

    setColor(R, G, B) {
        this.setAmbient(R / 255 * this.amb, G / 255 * this.amb, B / 255 * this.amb, 1.0);
        this.setDiffuse(R / 255 * this.diff, G / 255 * this.diff, B / 255 * this.diff, 1.0);
        this.setSpecular(R / 255 * this.spec, G / 255 * this.spec, B / 255 * this.spec, 1.0);
    }

    setTexture(texture) {
        super.setTexture(texture);
    }

}