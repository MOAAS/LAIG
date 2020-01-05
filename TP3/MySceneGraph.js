class MySceneGraph {
    constructor(components, idRoot, views, defaultView, ambient, background, lights, materials, textures, animations) {
        this.components = components;
        this.idRoot = idRoot;
        this.views = views;
        this.defaultView = defaultView;
        this.ambient = ambient;
        this.background = background;
        this.lights = lights;
        this.materials = materials;
        this.textures = textures;
        this.animations = animations;

        this.nextPickableID = 1;

        this.i = 0;
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
        this.components.push(component)
        this.components[this.idRoot].children.push(component);
    }

    removeComponentFromRoot(component) {
        console.log("Component " + this.i++);
        let rootChildren = this.getRootComponent().children;
        let componentIndex = rootChildren.indexOf(component);
        if (componentIndex > -1)
            rootChildren.splice(componentIndex, 1);
        else console.log("Couldn't find component 1")

        componentIndex = this.components.indexOf(component);
        if (componentIndex > -1)
            this.components.splice(componentIndex, 1);
        else console.log("Couldn't find component 2")
    }

    addPickable(component, onPick) {
        component.setOnPick(onPick, this.nextPickableID);
        this.addComponent(component)
        this.nextPickableID++;
    }

    setPickable(component, onPick) {
        component.setOnPick(onPick, this.nextPickableID);
        this.nextPickableID++;
    }

    getRootComponent() {
        return this.components[this.idRoot]
    }
}