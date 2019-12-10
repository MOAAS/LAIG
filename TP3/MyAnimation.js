class MyAnimation {
    constructor(keyframes) {
        this.keyframes = keyframes;
    }

    start(t) {
        this.startTime = t;
    }

    apply(t) {
        if (this.keyframes.length == 0)
            return mat4.create();
        let dt = (t - this.startTime) / 1000;
        let currKeyFrame = this.getCurrKeyFrame(dt);
        let previousKeyFrame = this.getPreviousKeyFrame(currKeyFrame);
        let currKeyFramePercentage = Math.min(1, (dt - previousKeyFrame.instant) / (currKeyFrame.instant - previousKeyFrame.instant));

        return currKeyFrame.apply(currKeyFramePercentage, previousKeyFrame)
    }

    getCurrKeyFrame(dt) {
        for (let i = 0; i < this.keyframes.length; i++) {
            if (dt < this.keyframes[i].instant)
                return this.keyframes[i];
        }
        return this.keyframes[this.keyframes.length - 1];
    }

    getPreviousKeyFrame(currentKeyFrame) {
        let index = this.keyframes.indexOf(currentKeyFrame);
        if (index == 0)
            return new KeyFrame(0, new Translation(0,0,0), new Rotation(0,0,0), new Scale(1,1,1));
        return this.keyframes[index - 1];
    }
}

class KeyFrame {
    constructor(instant, T, R, S) {
        this.instant = instant;
        this.T = T;
        this.R = R;
        this.S = S;
    }

    apply(percentage, previous) {
        let translation = new AnimTranslation(this.T.x - previous.T.x, this.T.y - previous.T.y, this.T.z - previous.T.z)
        let rotation = new AnimRotation(this.R.x - previous.R.x, this.R.y - previous.R.y, this.R.z - previous.R.z)
        let scale = new AnimScale(this.S.x / previous.S.x, this.S.y / previous.S.y, this.S.z / previous.S.z)

        translation.x = translation.x * percentage + previous.T.x;
        translation.y = translation.y * percentage + previous.T.y;
        translation.z = translation.z * percentage + previous.T.z;

        rotation.x = rotation.x * percentage + previous.R.x;
        rotation.y = rotation.y * percentage + previous.R.y;
        rotation.z = rotation.z * percentage + previous.R.z;

        scale.x = Math.pow(scale.x, percentage) * previous.S.x;
        scale.y = Math.pow(scale.y, percentage) * previous.S.y;
        scale.z = Math.pow(scale.z, percentage) * previous.S.z;

        /*
        let T = mat4.create();
        let R = mat4.create();
        let S = mat4.create();
        
        mat4.translate(T, T, [translation.x, translation.y, translation.z]);
        mat4.scale(S, S, [scale.x, scale.y, scale.z]);

        mat4.rotate(R, R, rotation.x, [1, 0, 0]);
        mat4.rotate(R, R, rotation.y, [0, 1, 0]);
        mat4.rotate(R, R, rotation.z, [0, 0, 1]);
        return [T, R, S];
        */
        let matrix = mat4.create();
        mat4.translate(matrix, matrix, [translation.x, translation.y, translation.z]);
        mat4.rotate(matrix, matrix, rotation.x, [1, 0, 0]);
        mat4.rotate(matrix, matrix, rotation.y, [0, 1, 0]);
        mat4.rotate(matrix, matrix, rotation.z, [0, 0, 1]);
        mat4.scale(matrix, matrix, [scale.x, scale.y, scale.z]);
        return matrix;
    }
}

class AnimTransformation {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class AnimTranslation extends AnimTransformation {
    
}
class AnimRotation extends AnimTransformation {
    
}
class AnimScale extends AnimTransformation {
    
}
