precision mediump float;

uniform sampler2D tBackground;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  vec3 bg = texture2D(tBackground, vUv).rgb;
  gl_FragColor = vec4(floor(255.0 * bg * uOpacity) / 255.0, uOpacity);
}