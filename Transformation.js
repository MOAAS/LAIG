class Transformation {
    constructor () { }

    apply(scene) {
        
    }
}

class Rotation extends Transformation {
    constructor(angle, x, y, z) {
        super();
        this.angle = angle;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    apply(scene) {
        scene.rotate(this.angle, this.x, this.y, this.z)
    }
}

class Translation extends Transformation {
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }

    apply(scene) {
        scene.translate(this.x, this.y, this.z);
    }
}

class Scaling extends Transformation {
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }

    apply(scene) {
        scene.scale(this.x, this.y, this.z)
    }
}