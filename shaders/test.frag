#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
uniform float time;

varying vec2 textureCoord;

void main() {
	vec4 color = texture2D(uSampler, textureCoord);

    float x = textureCoord.x - 0.5;
    float y = textureCoord.y - 0.5;
    float factor = 1.0- sqrt(x * x + y * y);
    color = vec4(color.rgb * factor, color.a);

    if(mod(time + textureCoord.y * 100.0, 2.0) > 1.0)
        color.rgb = mix(color.rgb, vec3(1.0, 1.0, 1.0), 0.25);

    gl_FragColor = color;

}