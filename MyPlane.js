class MyPlane extends CGFobject {
    constructor(scene, nPartsU, nPartsV) {
        super(scene);
        this.nPartsU = nPartsU;
        this.nPartsV = nPartsV;
        this.controlPoints = [	// U = 0
            [ // V = 0..1;
                [-0.5, 0, 0.5, 1 ],
                [-0.5, 0, -0.5, 1 ]
               
           ],
           // U = 1
           [ // V = 0..1
                [ 0.5, 0, 0.5, 1 ],						 
                [ 0.5, 0, -0.5, 1 ]
           ]
        ]
        this.degree1 = 1
        this.degree2 = 1
        this.makeSurface();
    }
    makeSurface(){
        var nurbsSurface = new CGFnurbsSurface(this.degree1,this.degree2,this.controlPoints);
        this.nurbsObject = new CGFnurbsObject(this.scene,this.nPartsU,this.nPartsV,nurbsSurface);
    }
    display(){
        this.nurbsObject.display();
    }
}