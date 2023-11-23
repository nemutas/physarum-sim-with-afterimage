attribute vec2 uv;

uniform sampler2D tAgentMap;

varying float vIndividual;

void main(){
    vec4 agent = texture2D(tAgentMap, uv);
    agent.xy = agent.xy * 2.0 - 1.0;

    vIndividual = agent.w;

    gl_Position = vec4(agent.xy, 0.0, 1.0);
    gl_PointSize = 5.0;
}