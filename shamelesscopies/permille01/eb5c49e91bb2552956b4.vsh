#version 300 es
precision highp float;
precision highp int;

in highp vec3 position;

void main(){
  gl_Position = vec4(position, 1.);
}