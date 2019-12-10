class BoardGame {
    constructor(scene, graph) {
        this.scene = scene;
        this.graph = graph;
    }

    start() {        
        let piece1 = new Component(this.scene, [new MySphere(this.scene, 100, 100, 2)]);
        let piece2 = new Component(this.scene, [new MySphere(this.scene, 100, 100, 2)], new Translation(0,5,0).getMatrix());
        let piece3 = new Component(this.scene, [new MySphere(this.scene, 100, 100, 2)], new Translation(0,0,5).getMatrix());

        let piece4 = new Component(
            this.scene, 
            [new MySphere(this.scene, 100, 100, 2)], 
            new TransformationGroup([
                new Translation(0,2,5),
                new Scale(2,2,2),
            ]).getMatrix()
        );

        

        let shinyGreen =  this.graph.materials['shinyGreen'];
        let grayDiffuse =  this.graph.materials['graydiffuse'];
        let toggleMaterial = function(piece) {
            if (piece.material == shinyGreen)
                piece.material = grayDiffuse
            else piece.material = shinyGreen;
        }
        
        this.scene.addPickable(piece1, () => toggleMaterial(piece1))
        this.scene.addPickable(piece2, () => toggleMaterial(piece2))
        this.scene.addPickable(piece3, () => toggleMaterial(piece3))
        console.log("Started!");
        sendPrologRequest('start', function (response) { console.log(response)} );
    }
}