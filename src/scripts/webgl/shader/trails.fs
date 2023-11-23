precision highp float;

uniform sampler2D tEntityMap;
uniform sampler2D tPrev;
uniform vec2 uPx;
uniform float uDecay;

varying vec2 vUv;

const int DIM = 1;
const float WEIGHT = 1.0 / pow(2.0 * float(DIM) + 1.0, 2.0);

void main() {
  vec4 entity = texture2D(tEntityMap, vUv);
  float pheromone = entity.r;

  float diffuse = 0.0;
  for (int i = -DIM; i <= DIM; i++) {
    for (int j = -DIM; j <= DIM; j++) {
      vec3 val = texture2D(tPrev, fract(vUv + uPx * vec2(i, j))).rgb;
      diffuse += val.r * WEIGHT + val.g * WEIGHT * 0.8;
    }
  }

  vec2 fin = vec2(pheromone * uDecay, diffuse * uDecay);
  fin = clamp(fin, 0.0, 1.0);

  gl_FragColor = vec4(fin, 0.0, entity.w);
}