import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Particles mesh ──────────────────────────────────────────────── */
function Particles({
  count,
  mouse,
}: {
  count: number;
  mouse: React.MutableRefObject<[number, number]>;
}) {
  const mesh = useRef<THREE.Points>(null!);
  const { viewport } = useThree();

  // Generate random positions once
  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * viewport.width * 2.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      sz[i] = Math.random() * 2.5 + 0.5;
    }
    return [pos, sz];
  }, [count, viewport]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    // Gentle drift + mouse parallax
    mesh.current.rotation.y = t * 0.03 + mouse.current[0] * 0.04;
    mesh.current.rotation.x = t * 0.015 + mouse.current[1] * 0.025;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#7b82ff"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Secondary accent particles ─────────────────────────────────── */
function AccentParticles({ count }: { count: number }) {
  const mesh = useRef<THREE.Points>(null!);
  const { viewport } = useThree();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * viewport.width * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 2.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return pos;
  }, [count, viewport]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = clock.getElapsedTime() * -0.02;
    mesh.current.rotation.z = clock.getElapsedTime() * 0.01;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#5d83ff"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Main export (wrapped in its own Canvas) ────────────────────── */
export default function ParticleField() {
  const mouse = useRef<[number, number]>([0, 0]);
  // Reduce particle count on mobile for performance
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const primaryCount = isMobile ? 60 : 180;
  const accentCount = isMobile ? 30 : 80;

  return (
    <div
      className="particle-canvas"
      onMouseMove={(e) => {
        mouse.current = [
          (e.clientX / window.innerWidth - 0.5) * 2,
          -(e.clientY / window.innerHeight - 0.5) * 2,
        ];
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: false, alpha: true }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        style={{ background: "transparent" }}
      >
        <Particles count={primaryCount} mouse={mouse} />
        <AccentParticles count={accentCount} />
      </Canvas>
    </div>
  );
}
