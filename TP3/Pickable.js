class Pickable {
    constructor(component, onPicked) {
        this.component = component;
        this.onPicked = onPicked || function() {console.log("Picked!"); };
    }
}