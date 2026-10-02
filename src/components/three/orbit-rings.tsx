"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useInView, usePrefersReducedMotion } from "./hooks";

const RINGS = [
  { radius: 1.55, tilt: [0.35, 0, 0.2], speed: 0.5, color: "#3d3bf3" },
  { radius: 1.25, tilt: [1.2, 0.4, 0], speed: -0.7, color: "#1c2033" },
  { radius: 0.95, tilt: [0.6, 1.1, 0.5], speed: 0.9, color: "#0e9f8e" },
] as const;

function Ring({ radius, tilt, speed, color, reduced }: (typeof RINGS)[number] & { reduced: boolean }) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (spin.current && !reduced) spin.current.rotation.z += delta * speed;
  });
  return (
    <group rotation={tilt as unknown as THREE.Euler}>
      <group ref={spin}>
        <mesh>
          <torusGeometry args={[radius, 0.008, 8, 160]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.07, 20, 20]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  useFrame(({ pointer, clock }, delta) => {
    if (!root.current || reduced) return;
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, pointer.x * 0.6, 2.5, delta);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -pointer.y * 0.4, 2.5, delta);
    root.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.06;
  });
  return (
    <group ref={root}>
      {RINGS.map((ring, i) => (
        <Ring key={i} {...ring} reduced={reduced} />
      ))}
      <mesh>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshBasicMaterial color="#3d3bf3" />
      </mesh>
    </group>
  );
}

export default function OrbitRings() {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="h-full w-full" aria-hidden>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 40 }} frameloop={inView ? "always" : "never"} gl={{ alpha: true }}>
        <Scene reduced={reduced} />
      </Canvas>
    </div>
  );
}
