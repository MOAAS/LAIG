#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 textureCoord;
varying vec3 coords;

void main() {
    gl_Position = vec4(aVertexPosition.x * 0.5 + 0.75, -aVertexPosition.y * 0.5 - 0.75, aVertexPosition.z * 0.5, 1.0);
    textureCoord = aTextureCoord;
    coords = aVertexPosition;
}