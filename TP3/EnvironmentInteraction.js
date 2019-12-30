class RoomInteraction {
    constructor(graph, scene) {
        this.graph = graph;
        this.scene = scene;
    }

    setup() {
       // console.log("room")
        let painting = this.graph.components['canvas'];

        let paintingTextureNormal = this.graph.textures['painting'];
        let paintingTextureEdited = this.graph.textures['paintingedit'];

        this.isPaintingEdited = false;
        this.graph.setPickable(painting, () => {
            if (this.isPaintingEdited)
                painting.setTexture(paintingTextureNormal);
            else painting.setTexture(paintingTextureEdited);
            this.isPaintingEdited = !this.isPaintingEdited
        });        

        let tvscreen = this.graph.components['tvscreen'];
        
        this.isTVon = true;        
        this.graph.setPickable(tvscreen, () => {
            if (this.isTVon)
                tvscreen.material = new Material(this.scene, 0, 0, 0, 0, 0)
            else tvscreen.material = -1;
            this.isTVon = !this.isTVon;
        })


        let chair1 = this.graph.components['chair1'];
        let chair2 = this.graph.components['chair2'];
        let chair1Anim = new MyAnimation([new KeyFrame(0.75, new AnimTranslation(0, 0, -5), new AnimRotation(0, 0, 0), new AnimScale(1, 1, 1))])    
        let chair2Anim = new MyAnimation([new KeyFrame(0.75, new AnimTranslation(0, 0, -5), new AnimRotation(0, 0, 0), new AnimScale(1, 1, 1))])    

        this.chair1backed = false;
        this.chair2backed = false;
        this.graph.setPickable(chair1, () => {
            if (chair1.animation == chair1Anim)
                chair1.reverseAnimation();
            else chair1.setAnimation(chair1Anim)
        });
        this.graph.setPickable(chair2, () => {
            if (chair2.animation == chair2Anim)
                chair2.reverseAnimation();
            else chair2.setAnimation(chair2Anim)
        });
    }
}

class PoolInteraction {
    constructor(graph) {
        this.graph = graph;
    }

    setup() {
       // console.log("pool")

        let beachballAnim = new MyAnimation([
            new KeyFrame(0.75, new AnimTranslation(4.5, 2, -6), new AnimRotation(14, 0, 0), new AnimScale(1, 1, 1)),
            new KeyFrame(1.5, new AnimTranslation(9, 1, -12), new AnimRotation(28, 0, 0), new AnimScale(1, 1, 1)),
            new KeyFrame(1.75, new AnimTranslation(9, 1.5, -12), new AnimRotation(28, 0, 0), new AnimScale(1, 1, 1)),
        ])
        let beachballAnimReverse = new MyAnimation([
            new KeyFrame(0, new AnimTranslation(9, 1.5, -12), new AnimRotation(28, 0, 0), new AnimScale(1, 1, 1)),
            new KeyFrame(0.75, new AnimTranslation(4.5, 2, -6), new AnimRotation(14, 0, 0), new AnimScale(1, 1, 1)),
            new KeyFrame(1.5, new AnimTranslation(0, -0.5, -0.5), new AnimRotation(0, 0, 0), new AnimScale(1, 1, 1)),

            new DefaultKeyFrame(1.75)
        ])
        let beachballAnimExplode = new MyAnimation([
            new DefaultKeyFrame(0),
            new KeyFrame(0.6, new AnimTranslation(6, 7.5, 3.75), new AnimRotation(0, 5, 0), new AnimScale(1, 1, 1)),
            new KeyFrame(0.9, new AnimTranslation(8, 10, 5), new AnimRotation(0, 9, 0), new AnimScale(1, 1, 1)),
            new KeyFrame(1, new AnimTranslation(8, 10, 5), new AnimRotation(0, 10, 0), new AnimScale(1, 1, 1)),
            new KeyFrame(1.4, new AnimTranslation(6, 7.5, 3.75), new AnimRotation(0, 14, 0), new AnimScale(1, 1, 1)),
            new KeyFrame(2, new AnimTranslation(0, 0, 0), new AnimRotation(0, 19, 0), new AnimScale(1, 1, 1)),
        ])
        let beachball = this.graph.components['beachball'];

        this.graph.setPickable(beachball, () => {
            if (!beachball.isAnimationOver())
                return;
            if (beachball.animation == beachballAnim)
                beachball.setAnimation(beachballAnimReverse)
            else {
                if (Math.random() > 0.2)
                    beachball.setAnimation(beachballAnim)
                else beachball.setAnimation(beachballAnimExplode);
            }
        })


        let lifebuoy = this.graph.components['lifebuoy'];

        let lifebuoyAnimation = new MyAnimation([
            new KeyFrame(0.75, new AnimTranslation(1.5, 0, 0), new AnimRotation(0, 0, -2), new AnimScale(1, 1, 1)),
            new KeyFrame(0.9, new AnimTranslation(1.75, -1, 0), new AnimRotation(0, 0, -4), new AnimScale(1, 1, 1)),
            new KeyFrame(3, new AnimTranslation(15, -1.1, 0), new AnimRotation(Math.PI / 8, 0, -16), new AnimScale(1, 1, 1)),
            new KeyFrame(4, new AnimTranslation(20, -1.2, 0), new AnimRotation(Math.PI / 6, 0, -20), new AnimScale(1, 1, 1)),
            new KeyFrame(4.1, new AnimTranslation(20, -1.65, 0.8), new AnimRotation(Math.PI / 2, 0, -20), new AnimScale(1, 1, 1))
        ])

        this.graph.setPickable(lifebuoy, () => {
            lifebuoy.setAnimation(lifebuoyAnimation);
            lifebuoy.setOnPick(() => {});
        });
    }
}