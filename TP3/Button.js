class SimpleButton {
    constructor(scene, graph, transformationMatrix, onPress) {
        this.scene = scene;
        this.graph = graph;
        this.transformationMatrix = transformationMatrix;        
        this.component = new Component(scene, [graph.components['genericbutton']],  this.transformationMatrix);
        this.onPress = onPress;
        this.graph.addPickable(this.component, () => this.press());

        this.enabledMaterial = this.graph.materials['shinyGold'];
        this.disabledMaterial = this.graph.materials['shinyRed'];

        this.disable()
    }

    press() {
        if (this.enabled) {
            this.component.setAnimation(this.graph.animations['buttonpress'])
            this.onPress();
        }
    }

    enable() {
        this.enabled = true;
        this.component.material =  this.enabledMaterial;
    }

    disable() {
        this.enabled = false;
        this.component.material = this.disabledMaterial;
    }
}

class ToggleButton {
    constructor(scene, graph, transformationMatrix, onDown) {
        this.scene = scene;
        this.graph = graph;        
        this.transformationMatrix = transformationMatrix;        
        this.component = new Component(scene, [graph.components['genericbutton']], this.transformationMatrix);
        this.onDown = onDown;
        this.graph.addPickable(this.component, () => this.press());

        this.upMaterial = this.graph.materials['shinyGold'];
        this.downMaterial = this.graph.materials['shinyGreen'];
        this.disabledMaterial = this.graph.materials['shinyRed'];        

        this.isDown = false;
        this.disable()
    }

    press() {
        if (!this.enabled)
            return;
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
        this.component.material = this.upMaterial;
        this.component.setAnimation(this.graph.animations['buttonToggleUp'])
        this.isDown = false;
    }

    toggleDown() {
        if (this.isDown)
            return;
        this.component.material = this.downMaterial;
        this.component.setAnimation(this.graph.animations['buttonToggleDown'])
        this.isDown = true;
    }

    enable() {
        this.enabled = true;
        if (this.isDown)
            this.component.material = this.downMaterial;
        else this.component.material = this.upMaterial;
    }

    disable() {
        this.enabled = false;
        this.component.material = this.disabledMaterial;
    }
}