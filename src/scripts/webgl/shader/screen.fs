precision highp float;

uniform sampler2D tTrailMap;
uniform vec2 uUvTransform;

varying vec2 vUv;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 uv = (vUv - 0.5) * uUvTransform + 0.5;
  vec4 trail = texture2D(tTrailMap, uv);

  // そのままだと赤が強いのでちょっと調整する
  float hue = (trail.w - 0.5) * 0.96 + 0.5;
  vec3 color = hsv2rgb(vec3(hue, 0.8, 0.1));
  float a = (trail.r + trail.g) * 0.5;
  // gl_FragColor = vec4(color, trail.g);

  vec3 white = trail.ggg;
  gl_FragColor = vec4(white * 0.1, 1);
}