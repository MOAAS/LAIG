class SimpleButton {
    constructor(scene, graph, transformation, onPress) {
        // Saves supplied arguments
        this.scene = scene;
        this.graph = graph;       
        this.transformation = transformation;
        this.onPress = onPress;
        
        // Makes component and adds it to graph as a pickable. 
        this.component = new Component(this.scene, [graph.components['genericbutton']], this.transformation.getMatrix());
        this.graph.addPickable(this.component, () => this.press());

        // Gets needed materials before enabling the button
        this.enabledMaterial = this.graph.materials['shinyGold'];
        this.disabledMaterial = this.graph.materials['shinyRed'];
        this.enable()
    }

    toNewGraph(graph) {
        // Maintains button state but gets new materials/textures/models from a new graph
        this.graph = graph;
        this.component = new Component(this.scene, [graph.components['genericbutton']], this.transformation.getMatrix());
        this.enabledMaterial = this.graph.materials['shinyGold'];
        this.disabledMaterial = this.graph.materials['shinyRed'];

        // Readds the component as a pickable with the same function
        this.graph.addPickable(this.component, () => this.press());
        
        // Calls enable/disable again just to update the material
        if (this.enabled)
            this.enable()
        else this.disable()
    }

    press() {
        if (this.enabled) {
            // If button is enabled, set the press animation and call the supplied function
            this.component.setAnimation(this.graph.animations['buttonpress'])
            this.onPress();
        }
    }

    enable() {
        // Updates state and material
        this.enabled = true;
        this.component.material =  this.enabledMaterial;
    }

    disable() {
        // Updates state and material
        this.enabled = false;
        this.component.material = this.disabledMaterial;
    }
}

class ToggleButton {
    constructor(scene, graph, transformation, onDown) {
        // Saves supplied arguments
        this.scene = scene;
        this.graph = graph;           
        this.transformation = transformation;
        this.onDown = onDown;

        // Makes component and adds it to graph as a pickable. 
        this.component = new Component(this.scene, [graph.components['genericbutton']], this.transformation.getMatrix());
        this.graph.addPickable(this.component, () => this.press());

        // Gets needed materials before enabling the button
        this.upMaterial = this.graph.materials['shinyGold'];
        this.downMaterial = this.graph.materials['shinyGreen'];
        this.disabledMaterial = this.graph.materials['shinyRed'];        
        this.isDown = false;
        this.enable()
    }

    toNewGraph(graph) {
        // Maintains button state but gets new materials/textures/models from a new graph
        this.graph = graph;
        this.component = new Component(this.scene, [graph.components['genericbutton']], this.transformation.getMatrix());
        this.upMaterial = this.graph.materials['shinyGold'];
        this.downMaterial = this.graph.materials['shinyGreen'];
        this.disabledMaterial = this.graph.materials['shinyRed'];        

        // Readds the component as a pickable with the same function
        this.graph.addPickable(this.component, () => this.press());

        // If button is down, puts it back down aagain
        // Calls enable/disable again just to update the material
        if (this.isDown)
            this.component.setAnimation(this.graph.animations['buttonToggleDown'])
        if (this.enabled)
            this.enable()
        else this.disable()
    }

    press() {
        if (!this.enabled)
            return;
        // If button is enabled, toggle up/down depending on the current state
        // If button is pressed down, supplied function is called
        if (this.isDown)
            this.toggleUp()
        else {
            this.toggleDown()
            this.onDown()
        }
    }

    toggleUp() {
        if (!this.isDown)
            return;
        // If button isn't already up, updates material and animates it up
        this.component.material = this.upMaterial;
        this.component.setAnimation(this.graph.animations['buttonToggleUp'])

        // Update button state
        this.isDown = false;
    }

    toggleDown() {
        if (this.isDown)
            return;
        // If button isn't already down, updates material and animates it down
        this.component.material = this.downMaterial;
        this.component.setAnimation(this.graph.animations['buttonToggleDown'])

        // Update button state
        this.isDown = true;
    }

    enable() {
        // Updates state and material
        this.enabled = true;
        if (this.isDown)
            this.component.material = this.downMaterial;
        else this.component.material = this.upMaterial;
    }

    disable() {
        // Updates state and material
        this.enabled = false;
        if (this.isDown)
            this.component.material = this.downMaterial;
        else this.component.material = this.disabledMaterial;
    }
}