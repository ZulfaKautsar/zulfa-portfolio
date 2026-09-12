import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

/* ─── Glow ring ──────────────────────────────────────────────────── */
function GlowRing() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    ref.current.rotation.z = clock.getElapsedTime() * 0.4;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.3;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.65, 0.008, 8, 120]} />
      <meshBasicMaterial color="#7b82ff" transparent opacity={0.35} />
    </mesh>
  );
}

function GlowRing2() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    ref.current.rotation.z = -clock.getElapsedTime() * 0.25;
    ref.current.rotation.y = clock.getElapsedTime() * 0.2;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[2.1, 0.005, 8, 100]} />
      <meshBasicMaterial color="#5d83ff" transparent opacity={0.2} />
    </mesh>
  );
}

/* ─── Core TorusKnot ─────────────────────────────────────────────── */
function TorusKnotMesh({
  scrollY,
}: {
  scrollY: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();
    const scroll = scrollY.current;

    // Ambient rotation + mouse parallax
    meshRef.current.rotation.x = t * 0.12 + mouse.y * 0.15 + scroll * 0.002;
    meshRef.current.rotation.y = t * 0.18 + mouse.x * 0.2;

    // Wireframe follows solid
    wireRef.current.rotation.copy(meshRef.current.rotation);

    // Subtle scale breathe
    const s = 1 + Math.sin(t * 0.6) * 0.025;
    meshRef.current.scale.setScalar(s);
    wireRef.current.scale.setScalar(s * 1.002);
  });

  return (
    <>
      {/* Solid core with glass-like material */}
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[0.85, 0.28, 128, 16, 2, 3]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.3}
          roughness={0.05}
          transmission={0.95}
          ior={1.5}
          chromaticAberration={0.04}
          color="#8b8fff"
          distortionScale={0.2}
          temporalDistortion={0.1}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wireRef}>
        <torusKnotGeometry args={[0.85, 0.28, 80, 12, 2, 3]} />
        <meshBasicMaterial
          color="#a0a8ff"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </>
  );
}

/* ─── Scene ──────────────────────────────────────────────────────── */
function Scene({
  scrollY,
}: {
  scrollY: React.MutableRefObject<number>;
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={1.2} color="#7b82ff" />
      <pointLight position={[-3, -2, 2]} intensity={0.7} color="#5d83ff" />
      <pointLight position={[0, 0, 4]} intensity={0.5} color="#ffffff" />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <TorusKnotMesh scrollY={scrollY} />
        <GlowRing />
        <GlowRing2 />
      </Float>
    </>
  );
}

/* ─── Export ─────────────────────────────────────────────────────── */
export default function FloatingGeometry({
  scrollY,
}: {
  scrollY: React.MutableRefObject<number>;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 420,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)}
        style={{ background: "transparent" }}
      >
        <Scene scrollY={scrollY} />
      </Canvas>
    </div>
  );
}
