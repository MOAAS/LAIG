class MySceneGraph {
    constructor(components, idRoot, views, defaultView, ambient, background, lights, materials, textures) {
        this.components = components;
        this.idRoot = idRoot;
        this.views = views;
        this.defaultView = defaultView;
        this.ambient = ambient;
        this.background = background;
        this.lights = lights;
        this.materials = materials;
        this.textures = textures;
    }

    update(t) {
        for (var componentID in this.components) {
            this.components[componentID].update(t);
        }
    }

    display() {
        this.components[this.idRoot].display();
    }

    addComponent(component) {
        this.components[this.idRoot].children.push(component);
    }
}