class MyPatch extends CGFobject {
    constructor(scene,nPointsU, nPointsV, nPartsU, nPartsV, controlPoints) {
        super(scene);
        this.nPartsU = nPartsU;
        this.nPartsV = nPartsV;
        this.controlPoints = controlPoints;
        this.degree1 = nPointsU-1;
        this.degree2 = nPointsV-1;
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