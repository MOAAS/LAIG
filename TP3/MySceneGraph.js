class MySceneGraph {
    constructor(components, idRoot, views, defaultView, ambient, background, lights) {
        this.components = components;
        this.idRoot = idRoot;
        this.views = views;
        this.defaultView = defaultView;
        this.ambient = ambient;
        this.background = background;
        this.lights = lights;
    }

    cycleMaterials() {
        for (var componentID in this.components) {
            this.components[componentID].cycleMaterial();
        }
    }

    update(t) {
        for (var componentID in this.components) {
            this.components[componentID].update(t);
        }
    }

    display(scene) {
        let defaultTrans = mat4.create();
        let defaultMaterial = new CGFappearance(this.scene)
        let defaultTexture = new ComponentTexture(null, 0, 0);

        this.components[this.idRoot].display(scene, defaultTrans, defaultMaterial, defaultTexture);
    }
}