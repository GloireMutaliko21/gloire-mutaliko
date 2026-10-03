"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { SkillCategory } from "@/lib/types";
import { usePalette, usePrefersReducedMotion, useInView, type Palette } from "./hooks";

export type GraphSkill = { name: string; category: SkillCategory; level: number };

type Node = GraphSkill & { pos: THREE.Vector3; size: number };
type Edge = { a: number; b: number; cross: boolean }; // b === -1 means the core

const CATEGORY_DIRS: Record<SkillCategory, [number, number, number]> = {
  frontend: [-1, 0.45, 0.55],
  backend: [1, 0.3, 0.45],
  devops: [0.25, -1, 0.35],
  data: [-0.55, -0.55, -0.8],
  tools: [0.55, 0.7, -0.75],
};

/** Deterministic pseudo-random number in [0, 1) so the graph has the same shape on every visit. */
function rand(input: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}

function buildGraph(skills: GraphSkill[]) {
  const radius = (level: number) => 2.25 + (level - 3) * 0.14;
  const nodes: Node[] = skills.map((s) => {
    const dir = new THREE.Vector3(...CATEGORY_DIRS[s.category]).normalize();
    const jitter = new THREE.Vector3(rand(s.name, 1) - 0.5, rand(s.name, 2) - 0.5, rand(s.name, 3) - 0.5).multiplyScalar(1.25);
    return {
      ...s,
      pos: dir.add(jitter).normalize().multiplyScalar(radius(s.level)),
      size: 0.04 + s.level * 0.012,
    };
  });

  // Push overlapping nodes apart, then project back onto their shell.
  for (let iter = 0; iter < 80; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const diff = nodes[i].pos.clone().sub(nodes[j].pos);
        const dist = diff.length();
        if (dist < 1 && dist > 0) {
          const push = diff.normalize().multiplyScalar((1 - dist) / 2);
          nodes[i].pos.add(push);
          nodes[j].pos.sub(push);
        }
      }
    }
    nodes.forEach((n) => n.pos.setLength(radius(n.level)));
  }

  const edges: Edge[] = [];
  const seen = new Set<string>();
  const add = (a: number, b: number, cross = false) => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (a === b || seen.has(key)) return;
    seen.add(key);
    edges.push({ a, b, cross });
  };

  // Each node links to its two nearest neighbours of the same category.
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => ({ j, d: m.category === n.category ? n.pos.distanceTo(m.pos) : Infinity }))
      .filter((x) => x.j !== i && Number.isFinite(x.d))
      .sort((x, y) => x.d - y.d)
      .slice(0, 2)
      .forEach((x) => add(i, x.j));
  });

  // The strongest skill of each category links to the core and to the next category.
  const tops = Object.keys(CATEGORY_DIRS)
    .map((cat) =>
      nodes.reduce<number>((best, n, i) => (n.category === cat && (best < 0 || n.level > nodes[best].level) ? i : best), -1),
    )
    .filter((i) => i >= 0);
  tops.forEach((i, k) => {
    add(i, -1, true);
    if (tops.length > 2) add(i, tops[(k + 1) % tops.length], true);
  });

  return { nodes, edges };
}

function endpoint(nodes: Node[], index: number) {
  return index === -1 ? new THREE.Vector3(0, 0, 0) : nodes[index].pos;
}

function Graph({ skills, reduced, labelRefs, palette }: { skills: GraphSkill[]; reduced: boolean; labelRefs: RefObject<(HTMLSpanElement | null)[]>; palette: Palette }) {
  const { nodes, edges } = useMemo(() => buildGraph(skills), [skills]);
  const [hovered, setHovered] = useState<number | null>(null);
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulses = useRef<THREE.Points>(null);
  const born = useRef<number | null>(null);
  const { camera, pointer } = useThree();
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const linked = useMemo(() => {
    if (hovered === null) return null;
    const set = new Set<number>([hovered]);
    edges.forEach((e) => {
      if (e.a === hovered) set.add(e.b);
      if (e.b === hovered) set.add(e.a);
    });
    return set;
  }, [hovered, edges]);

  const pulsePositions = useMemo(() => new Float32Array(edges.length * 3), [edges.length]);
  const pulseOffsets = useMemo(() => edges.map((e, i) => rand(`${e.a}-${e.b}`, i)), [edges]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    born.current ??= t;
    const age = t - born.current;

    // Gentle parallax toward the pointer, on top of the orbit controls.
    if (group.current && !reduced) {
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.18, 3, delta);
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, pointer.x * 0.08, 3, delta);
    }
    if (core.current) {
      core.current.rotation.y += reduced ? 0 : delta * 0.4;
      core.current.rotation.x += reduced ? 0 : delta * 0.15;
      core.current.scale.setScalar(reduced ? 1 : 1 + Math.sin(t * 1.6) * 0.06);
    }

    const camDir = tmp.copy(camera.position).normalize();
    nodes.forEach((n, i) => {
      const mesh = nodeRefs.current[i];
      if (mesh) {
        // One staggered entrance, then a slow breathing scale.
        const appear = reduced ? 1 : THREE.MathUtils.smoothstep(age - i * 0.035, 0, 0.7);
        const focus = hovered === i ? 1.7 : linked && !linked.has(i) ? 0.75 : 1;
        mesh.scale.setScalar(Math.max(0.0001, appear * focus * (1 + Math.sin(t * 1.2 + i) * 0.05)));
      }
      const label = labelRefs.current[i];
      if (label && group.current) {
        const world = n.pos.clone().applyMatrix4(group.current.matrixWorld);
        // Project onto the canvas to place the DOM label just under its node.
        const screen = world.clone().project(camera);
        const x = ((screen.x + 1) / 2) * state.size.width;
        const y = ((1 - screen.y) / 2) * state.size.height + 10 + n.size * 60;
        label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translateX(-50%)`;
        label.style.fontWeight = hovered === i ? "600" : "500";
        const facing = world.normalize().dot(camDir); // 1 = front, -1 = back
        const base = 0.18 + 0.82 * THREE.MathUtils.smoothstep(facing, -0.6, 0.6);
        const dim = linked && !linked.has(i) ? 0.25 : 1;
        const appear = reduced ? 1 : THREE.MathUtils.smoothstep(age - 0.4 - i * 0.035, 0, 0.6);
        label.style.opacity = String(base * dim * appear);
      }
    });

    if (pulses.current) {
      edges.forEach((e, i) => {
        const phase = reduced ? 0.5 : (t * 0.22 + pulseOffsets[i]) % 1;
        const p = endpoint(nodes, e.a).clone().lerp(endpoint(nodes, e.b), phase);
        pulsePositions.set([p.x, p.y, p.z], i * 3);
      });
      pulses.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshBasicMaterial color={palette.ink} wireframe transparent opacity={0.55} />
      </mesh>

      {edges.map((e, i) => {
        const active = linked ? linked.has(e.a) && linked.has(e.b) : false;
        const color = active ? palette.cats[nodes[hovered!].category] : e.cross ? palette.muted : palette.cats[nodes[e.a].category];
        return (
          <Line
            key={i}
            points={[endpoint(nodes, e.a), endpoint(nodes, e.b)]}
            color={color}
            lineWidth={active ? 2.2 : 1}
            transparent
            opacity={linked ? (active ? 1 : 0.08) : e.cross ? 0.35 : 0.5}
            dashed={e.cross && !active}
            dashSize={0.08}
            gapSize={0.06}
          />
        );
      })}

      <points ref={pulses}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pulsePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color={palette.accent} transparent opacity={0.9} sizeAttenuation />
      </points>

      {nodes.map((n, i) => (
        <group key={n.name} position={n.pos}>
          <mesh
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            onPointerOver={(ev) => {
              ev.stopPropagation();
              setHovered(i);
            }}
            onPointerOut={() => setHovered((h) => (h === i ? null : h))}
          >
            <sphereGeometry args={[n.size, 24, 24]} />
            <meshBasicMaterial color={palette.cats[n.category]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function SkillGraph({ skills, label }: { skills: GraphSkill[]; label: string }) {
  const reduced = usePrefersReducedMotion();
  const [wrapper, inView] = useInView<HTMLDivElement>();
  const [coarse, setCoarse] = useState(false);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const palette = usePalette();

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return (
    <div ref={wrapper} className="relative h-full w-full cursor-grab active:cursor-grabbing" role="img" aria-label={label}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 7.8], fov: 42 }}
        frameloop={inView ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
        // Let the page scroll on touch screens: rotation is a desktop nicety.
        style={{ touchAction: coarse ? "pan-y" : "none" }}
      >
        <Graph skills={skills} reduced={reduced} labelRefs={labelRefs} palette={palette} />
        <OrbitControls
          enabled={!coarse}
          enableZoom={false}
          enablePan={false}
          autoRotate={!reduced}
          autoRotateSpeed={0.7}
          enableDamping
          minPolarAngle={Math.PI / 2 - 0.45}
          maxPolarAngle={Math.PI / 2 + 0.45}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {skills.map((s, i) => (
          <span
            key={s.name}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 whitespace-nowrap text-[11px] leading-none text-ink will-change-transform"
            style={{ opacity: 0 }}
          >
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
