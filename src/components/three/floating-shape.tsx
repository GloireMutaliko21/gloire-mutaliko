"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { useInView, usePalette, usePrefersReducedMotion, type Palette } from "./hooks";

function Knot({ reduced, palette }: { reduced: boolean; palette: Palette }) {
  const mesh = useRef<THREE.Group>(null);
  useFrame(({ pointer }, delta) => {
    if (!mesh.current || reduced) return;
    mesh.current.rotation.y += delta * 0.25;
    mesh.current.rotation.x = THREE.MathUtils.damp(mesh.current.rotation.x, pointer.y * 0.5, 2, delta);
  });
  return (
    <Float speed={reduced ? 0 : 1.4} rotationIntensity={reduced ? 0 : 0.6} floatIntensity={reduced ? 0 : 0.8}>
      <group ref={mesh}>
        <mesh>
          <torusKnotGeometry args={[0.9, 0.26, 220, 32, 2, 3]} />
          <MeshDistortMaterial color={palette.accent} roughness={0.35} metalness={0.1} distort={reduced ? 0 : 0.22} speed={1.6} />
        </mesh>
        <mesh scale={1.015}>
          <torusKnotGeometry args={[0.9, 0.26, 110, 12, 2, 3]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.18} />
        </mesh>
      </group>
    </Float>
  );
}

export default function FloatingShape() {
  const reduced = usePrefersReducedMotion();
  const palette = usePalette();
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="h-full w-full" aria-hidden>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.4], fov: 42 }} frameloop={inView ? "always" : "never"} gl={{ alpha: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <directionalLight position={[-4, -2, -3]} intensity={0.8} color={palette.cats.backend} />
        <Knot reduced={reduced} palette={palette} />
      </Canvas>
    </div>
  );
}
