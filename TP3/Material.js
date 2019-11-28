/**
 * Represents a Material / Appearance
 */
class Material extends CGFappearance {
    constructor(scene, emission, amb, diff, spec, shininess) {
        super(scene);
        this.setEmission(emission[0] , emission[1] , emission[2] , emission[3]);
        this.setAmbient(amb[0] , amb[1] , amb[2] , amb[3]);
        this.setDiffuse(diff[0] , diff[1] , diff[2] , diff[3]);
        this.setSpecular(spec[0] , spec[1] , spec[2] , spec[3]);
		this.setShininess(shininess);
    }
}