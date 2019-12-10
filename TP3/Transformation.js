class Transformation {
    constructor () {
        
    }
}

class Translation extends Transformation {
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }
    getMatrix() {
        let ident = mat4.create();
        return mat4.translate(ident, ident, [this.x, this.y, this.z]);
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

    getMatrix() {
        let ident = mat4.create();
        return mat4.rotate(ident, ident, this.angle, [this.x, this.y, this.z]);
    }    
}

class Scale extends Transformation {    
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    getMatrix() {
        let ident = mat4.create();
        return mat4.scale(ident, ident, [this.x, this.y, this.z]);
    }    
}

class TransformationGroup extends Transformation {
    constructor(transformations) {
        super()
        this.transformations = transformations;
    }

    getMatrix() {
        let matrix = mat4.create();
        for (let i = 0; i < this.transformations.length; i++) {
            mat4.multiply(matrix, matrix, this.transformations[i].getMatrix())
        }
        return matrix;
    }
}
