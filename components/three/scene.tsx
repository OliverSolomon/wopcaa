"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* Shared GLSL: a cheap 3D value noise good enough for slow organic motion. */
const NOISE = /* glsl */ `
  float hash(vec3 p){ p = fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float noise(vec3 x){
    vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z);
  }
`;

const globeVertex = /* glsl */ `
  uniform float uTime; uniform vec2 uPointer; uniform float uPixel;
  attribute float aSeed;
  varying float vLat; varying float vGlow; varying float vSeed;
  ${NOISE}
  void main(){
    vec3 p = position;
    float n = noise(p*1.6 + uTime*0.12);
    // Points breathe outwards along their normal, more near the pointer.
    vec3 dir = normalize(p);
    float near = 1.0 - smoothstep(0.0, 1.4, distance(dir.xy, uPointer*1.2));
    p += dir * (n*0.18 + near*0.22*(0.5+0.5*sin(uTime*1.5+aSeed*6.28)));
    vec4 mv = modelViewMatrix * vec4(p,1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPixel * (1.4 + aSeed*2.2 + near*2.5) * (6.0 / -mv.z);
    vLat = dir.y; vGlow = near + n*0.4; vSeed = aSeed;
  }
`;

const globeFragment = /* glsl */ `
  uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
  varying float vLat; varying float vGlow; varying float vSeed;
  void main(){
    vec2 c = gl_PointCoord - 0.5; float d = length(c);
    if(d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uA, uB, smoothstep(-0.8, 0.9, vLat));
    col = mix(col, uC, clamp(vGlow*0.55 + step(0.93, vSeed)*0.8, 0.0, 1.0));
    gl_FragColor = vec4(col, alpha * (0.55 + vSeed*0.45));
  }
`;

function fibonacciSphere(count: number, radius: number) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = g * i;
    pos.set([Math.cos(t) * r * radius, y * radius, Math.sin(t) * r * radius], i * 3);
    seed[i] = Math.random();
  }
  return { pos, seed };
}

function Globe() {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Points>(null);
  const { size, viewport } = useThree();
  const { pos, seed } = useMemo(() => fibonacciSphere(size.width < 768 ? 5000 : 9000, 1.9), [size.width]);
  const ringGeo = useMemo(() => {
    const n = 1400; const p = new Float32Array(n * 3); const s = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2; const r = 2.75 + (Math.random() - 0.5) * 0.35;
      p.set([Math.cos(a) * r, (Math.random() - 0.5) * 0.08, Math.sin(a) * r], i * 3); s[i] = Math.random();
    }
    return { p, s };
  }, []);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uPointer: { value: new THREE.Vector2() }, uPixel: { value: Math.min(window.devicePixelRatio, 2) },
    uA: { value: new THREE.Color("#2f6b45") }, uB: { value: new THREE.Color("#cfe0c8") }, uC: { value: new THREE.Color("#e4a77c") },
  }), []);
  const ringUniforms = useMemo(() => ({ ...uniforms, uA: { value: new THREE.Color("#e4a77c") }, uB: { value: new THREE.Color("#f5efe4") } }), [uniforms]);

  useFrame((state, dt) => {
    uniforms.uTime.value += dt;
    uniforms.uPointer.value.lerp(state.pointer, 0.05);
    if (group.current) {
      group.current.rotation.y += dt * 0.06;
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -state.pointer.y * 0.25 + 0.15, 0.04);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, state.pointer.x * 0.12, 0.04);
    }
    if (ring.current) ring.current.rotation.y -= dt * 0.03;
  });

  const offsetX = viewport.width > 9 ? viewport.width * 0.2 : 0;
  return (
    <group position={[offsetX, viewport.width > 9 ? 0 : -0.6, 0]}>
      <group ref={group}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[pos, 3]} />
            <bufferAttribute attach="attributes-aSeed" args={[seed, 1]} />
          </bufferGeometry>
          <shaderMaterial vertexShader={globeVertex} fragmentShader={globeFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        <points ref={ring} rotation={[0.35, 0, 0.18]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[ringGeo.p, 3]} />
            <bufferAttribute attach="attributes-aSeed" args={[ringGeo.s, 1]} />
          </bufferGeometry>
          <shaderMaterial vertexShader={globeVertex} fragmentShader={globeFragment} uniforms={ringUniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>
    </group>
  );
}

const fieldVertex = /* glsl */ `
  uniform float uTime; uniform vec2 uPointer; uniform float uPixel;
  varying float vH;
  ${NOISE}
  void main(){
    vec3 p = position;
    float h = noise(vec3(p.x*0.35, p.z*0.35 - uTime*0.15, uTime*0.05));
    float ripple = exp(-distance(p.xz, uPointer*vec2(7.0, -4.0)) * 0.6) * 0.8;
    p.y += h*1.6 + sin(p.x*0.6 + uTime*0.6)*0.18 + ripple*sin(uTime*3.0 - distance(p.xz, uPointer*vec2(7.0,-4.0))*2.0);
    vec4 mv = modelViewMatrix * vec4(p,1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPixel * (1.3 + h*1.8) * (8.0 / -mv.z);
    vH = h + ripple;
  }
`;
const fieldFragment = /* glsl */ `
  uniform vec3 uA; uniform vec3 uB;
  varying float vH;
  void main(){
    float d = length(gl_PointCoord - 0.5); if(d > 0.5) discard;
    gl_FragColor = vec4(mix(uA, uB, clamp(vH, 0.0, 1.0)), smoothstep(0.5, 0.0, d) * (0.35 + vH*0.6));
  }
`;

function Field({ light }: { light?: boolean }) {
  const pts = useMemo(() => {
    const cols = 180, rows = 70; const p = new Float32Array(cols * rows * 3);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) p.set([(i / cols - 0.5) * 22, 0, (j / rows - 0.5) * 9], (i * rows + j) * 3);
    return p;
  }, []);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uPointer: { value: new THREE.Vector2() }, uPixel: { value: Math.min(window.devicePixelRatio, 2) },
    uA: { value: new THREE.Color(light ? "#8fb596" : "#2f6b45") }, uB: { value: new THREE.Color(light ? "#c8693a" : "#e4a77c") },
  }), [light]);
  useFrame((state, dt) => {
    uniforms.uTime.value += dt;
    uniforms.uPointer.value.lerp(state.pointer, 0.04);
  });
  return (
    <points position={[0, -1.6, 0]} rotation={[0.18, 0, 0]}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pts, 3]} /></bufferGeometry>
      <shaderMaterial vertexShader={fieldVertex} fragmentShader={fieldFragment} uniforms={uniforms} transparent depthWrite={false} blending={light ? THREE.NormalBlending : THREE.AdditiveBlending} />
    </points>
  );
}

export default function Scene({ variant = "globe", light }: { variant?: "globe" | "field"; light?: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, variant === "globe" ? 6.2 : 7], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      {variant === "globe" ? <Globe /> : <Field light={light} />}
    </Canvas>
  );
}
