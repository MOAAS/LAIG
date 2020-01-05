class MyAnimation {
    constructor(keyframes, maxLoops) {
        this.keyframes = keyframes;
        if(maxLoops == null)
            this.maxLoops = 1;
        else this.maxLoops = maxLoops;
    }
    
    reverse() {
        let reversedKeyframes = [];
        // Reverses an animation by reversing the keyframe order
        // Gets last keyframe's instant, so that each keyframe's instant can be flipped
        let lastInstant = this.keyframes[this.keyframes.length - 1].instant;
        for (let i = this.keyframes.length - 1; i >= 0; i--) {
            let keyframe = this.keyframes[i];
            reversedKeyframes.push(new KeyFrame(
                lastInstant - keyframe.instant,
                new AnimTranslation(keyframe.T.x, keyframe.T.y, keyframe.T.z),
                new AnimRotation(keyframe.R.x, keyframe.R.y, keyframe.R.z),
                new AnimScale(keyframe.S.x, keyframe.S.y, keyframe.S.z)
            ));
        }
        if (this.keyframes.length == 0 || this.keyframes[0].instant != 0)
            reversedKeyframes.push(new DefaultKeyFrame(lastInstant))
        return new MyAnimation(reversedKeyframes, this.maxLoops)
    }

    apply(startTime, t) {
        if (this.keyframes.length == 0)
            return mat4.create();

        // Calculates the time difference since animation has started
        let dt = (t - startTime) / 1000;


        // Calculates endingInstant and the number of loops that have passed so far
        // in order to figure out how many loops it can still run
        let endingInstant = this.keyframes[this.keyframes.length - 1].instant;
        let loopsDone = Math.floor(dt / endingInstant);

        // If loopsDone < maxLoops OR maxLoops == 0 -> loop
        if (this.maxLoops != 0)
            dt = dt - Math.min(loopsDone, this.maxLoops - 1) * endingInstant;
        else dt = dt - loopsDone * endingInstant;
        
        // Calculates current key frame based on dt
        // Calculates previous keyframe based on current keyframe
        // USes those two to calculate how far into the keyframe we are (in %)
        let currKeyFrame = this.getCurrKeyFrame(dt);
        let previousKeyFrame = this.getPreviousKeyFrame(currKeyFrame);
        let currKeyFramePercentage = Math.min(1, (dt - previousKeyFrame.instant) / (currKeyFrame.instant - previousKeyFrame.instant));

        // Applies the keyframe returning the matrix
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
            return new DefaultKeyFrame(0);
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
        // Calculate translation, rotation and scale based on current previous
        let translation = new AnimTranslation(this.T.x - previous.T.x, this.T.y - previous.T.y, this.T.z - previous.T.z)
        let rotation = new AnimRotation(this.R.x - previous.R.x, this.R.y - previous.R.y, this.R.z - previous.R.z)
        let scale = new AnimScale(this.S.x / previous.S.x, this.S.y / previous.S.y, this.S.z / previous.S.z)

        // Translation has a linear progress based on percentage
        translation.x = translation.x * percentage + previous.T.x;
        translation.y = translation.y * percentage + previous.T.y;
        translation.z = translation.z * percentage + previous.T.z;

        // Rotation has a linear progress based on percentage
        rotation.x = rotation.x * percentage + previous.R.x;
        rotation.y = rotation.y * percentage + previous.R.y;
        rotation.z = rotation.z * percentage + previous.R.z;

        // Rotation has an exponential progress based on percentage
        scale.x = Math.pow(scale.x, percentage) * previous.S.x;
        scale.y = Math.pow(scale.y, percentage) * previous.S.y;
        scale.z = Math.pow(scale.z, percentage) * previous.S.z;

        // Creates a transformation matrix for the keyframe
        // Order is: Scale -> RotateZ -> RotateY -> RotateX -> Translate
        let matrix = mat4.create();
        mat4.translate(matrix, matrix, [translation.x, translation.y, translation.z]);
        mat4.rotate(matrix, matrix, rotation.x, [1, 0, 0]);
        mat4.rotate(matrix, matrix, rotation.y, [0, 1, 0]);
        mat4.rotate(matrix, matrix, rotation.z, [0, 0, 1]);
        mat4.scale(matrix, matrix, [scale.x, scale.y, scale.z]);
        return matrix;
    }
}

// Represents a default key frame: T(0,0,0), R(0,0,0), S(1,1,1)
class DefaultKeyFrame extends KeyFrame {
    constructor(instant) {
        super(instant, new AnimTranslation(0,0,0), new AnimRotation(0,0,0), new AnimScale(1,1,1))
    }
}

// Animation Transformation, simply contains 3 arguments: x, y, z
// Can be used for Translation, Rotation and Scale
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
