// @ts-nocheck – meshline ships CommonJS; Rapier WASM types covered by @dimforge/rapier3d-compat
"use client";

/**
 * Badge3DPhysics — v2 (texture-based, no Html portal)
 * ──────────────────────────────────────────────────────────────────────────────
 * Badge image rendered sebagai THREE.js textured plane (useTexture) — bukan
 * <Html transform>, sehingga TIDAK ada HTML element yang bisa bocor keluar
 * canvas dan menutupi navbar.
 *
 * Ukuran kartu dikontrol langsung via planeGeometry args (world units),
 * kamera di-tune agar kartu mengisi ~90 % lebar canvas (≈ sama dengan Badge3D lama).
 *
 * Drag: kinematicPosition selama grab, kembali dynamic saat release.
 * Rope: MeshLine curve dari anchor → 6 RigidBody segmen → card top.
 *
 * Harus di-lazy-load: dynamic(() => import(...), { ssr: false })
 */

import { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  useSphericalJoint,
} from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – meshline has no bundled TS declarations
import { MeshLineGeometry, MeshLineMaterial } from "meshline";

/* ─────────────────────────────────────────────────────────────────────────────
   SCENE CONSTANTS
   Camera: z = 4, fov = 50  →  visible width @z=0 ≈ 3.73 world units
   Canvas: 420 × 680 px     →  visible height ≈ 3.73 × (680/420) ≈ 6.04 units

   CARD_W = 3.4 → 3.4 / 3.73 ≈ 91 % canvas width ≈ 383 px  (≈ Badge3D lama)
   CARD_H = 4.8 → portrait ratio ~0.71 (typical ID badge)
   Card centre rests at y = –0.3  →  top 2.1, bottom –2.7  (within visible ±3.02)
───────────────────────────────────────────────────────────────────────────── */
const ROPE_SEGMENTS = 6;
const ANCHOR_Y      = 2.8;        // fixed anchor (world Y)
const CARD_W        = 3.4;        // card plane width  (world units)
const CARD_H        = 4.8;        // card plane height (world units)
const CARD_INIT_Y   = -0.3;       // card centre at spawn
const CARD_TOP_LOC  = CARD_H / 2; // top of card in local space = 2.4
const CARD_TOP_WORLD = CARD_INIT_Y + CARD_TOP_LOC; // ≈ 2.1
const ROPE_COLOR    = "#2a1f14";
const ROPE_WIDTH    = 0.04;

/** Even Y positions for rope segments (anchor → card top) */
function buildSegmentPositions(): [number, number, number][] {
  return Array.from({ length: ROPE_SEGMENTS }, (_, i) => {
    const t = (i + 1) / (ROPE_SEGMENTS + 1);
    const y = ANCHOR_Y + (CARD_TOP_WORLD - ANCHOR_Y) * t;
    return [0, y, 0] as [number, number, number];
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   SPHERICAL JOINT HELPER
───────────────────────────────────────────────────────────────────────────── */
function RopeJoint({
  a,
  b,
  aOff = [0, -0.06, 0] as [number, number, number],
  bOff = [0,  0.06, 0] as [number, number, number],
}: {
  a: React.RefObject<RapierRigidBody>;
  b: React.RefObject<RapierRigidBody>;
  aOff?: [number, number, number];
  bOff?: [number, number, number];
}) {
  useSphericalJoint(a, b, [aOff, bOff]);
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROPE RENDERER  (MeshLine — reads body positions every frame)
───────────────────────────────────────────────────────────────────────────── */
function RopeRenderer({
  anchorPos,
  segRefs,
  cardRef,
}: {
  anchorPos: THREE.Vector3;
  segRefs: React.RefObject<RapierRigidBody>[];
  cardRef: React.MutableRefObject<RapierRigidBody | null>;
}) {
  const geo = useMemo(() => {
    const g = new MeshLineGeometry();
    // initialise with two coincident points so Three.js is happy on first frame
    g.setPoints([0, ANCHOR_Y, 0, 0, ANCHOR_Y - 0.01, 0]);
    return g;
  }, []);

  const mat = useMemo(
    () =>
      new MeshLineMaterial({
        color: new THREE.Color(ROPE_COLOR),
        lineWidth: ROPE_WIDTH,
        sizeAttenuation: 1,
        depthWrite: false,
        transparent: true,
        opacity: 0.95,
      }),
    [],
  );

  useFrame(() => {
    if (!cardRef.current) return;

    const pts: number[] = [anchorPos.x, anchorPos.y, anchorPos.z];

    for (const r of segRefs) {
      if (!r.current) continue;
      const t = r.current.translation();
      pts.push(t.x, t.y, t.z);
    }

    // Attach rope end to top-centre of card (world)
    const ct = cardRef.current.translation();
    pts.push(ct.x, ct.y + CARD_TOP_LOC, ct.z);

    geo.setPoints(pts);
  });

  return <mesh geometry={geo} material={mat} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   BADGE MESH  (texture-based plane + drag via Three.js pointer events)
   Pointer capture keeps the drag alive even when pointer leaves the mesh.
───────────────────────────────────────────────────────────────────────────── */
function BadgeMesh({
  cardRef,
}: {
  cardRef: React.MutableRefObject<RapierRigidBody | null>;
}) {
  const texture = useTexture("/badge/id-badge-zulfa.png");
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const [hovered, setHovered] = useState(false);

  // Plane for z=0 raycasting
  const dragPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    [],
  );
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // Auto-swing on mount (replaces the old framer-motion keyframe animation)
  useEffect(() => {
    const id = setTimeout(() => {
      cardRef.current?.applyImpulse({ x: -0.9, y: 0, z: 0 }, true);
    }, 400);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Convert client (window) coordinates → world position on z = 0 plane */
  function screenToWorld(clientX: number, clientY: number): THREE.Vector3 {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left)  / rect.width)  *  2 - 1;
    const y = ((clientY - rect.top)   / rect.height) * -2 + 1;
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const pt = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, pt);
    return pt;
  }

  function onPointerDown(e) {
    e.stopPropagation();
    try { gl.domElement.setPointerCapture(e.nativeEvent.pointerId); } catch (_) { /* ignore */ }
    isDragging.current = true;
    document.body.style.cursor = "grabbing";
    // ① switch to kinematic so physics doesn't fight the joint constraints
    cardRef.current?.setBodyType(2 /* KinematicPositionBased */, true);
  }

  function onPointerMove(e) {
    if (!isDragging.current) return;
    const pt = screenToWorld(e.nativeEvent.clientX, e.nativeEvent.clientY);
    // ② move via kinematic translation (zero jitter)
    cardRef.current?.setNextKinematicTranslation({ x: pt.x, y: pt.y, z: 0 });
  }

  function onPointerUp(e) {
    try { gl.domElement.releasePointerCapture(e.nativeEvent.pointerId); } catch (_) { /* ignore */ }
    isDragging.current = false;
    document.body.style.cursor = hovered ? "grab" : "";
    // ③ hand control back to physics engine
    cardRef.current?.setBodyType(0 /* Dynamic */, true);
    cardRef.current?.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }

  return (
    <mesh
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerEnter={() => {
        setHovered(true);
        if (!isDragging.current) document.body.style.cursor = "grab";
      }}
      onPointerLeave={() => {
        setHovered(false);
        if (!isDragging.current) document.body.style.cursor = "";
      }}
    >
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PHYSICS SCENE
   All refs at top level — no hooks inside loops.
───────────────────────────────────────────────────────────────────────────── */
function PhysicsScene({ isMobile }: { isMobile: boolean }) {
  const anchorRef = useRef<RapierRigidBody>(null!);
  const cardRef   = useRef<RapierRigidBody | null>(null);

  // Six rope-segment refs, declared individually (Rules of Hooks)
  const s0 = useRef<RapierRigidBody>(null!);
  const s1 = useRef<RapierRigidBody>(null!);
  const s2 = useRef<RapierRigidBody>(null!);
  const s3 = useRef<RapierRigidBody>(null!);
  const s4 = useRef<RapierRigidBody>(null!);
  const s5 = useRef<RapierRigidBody>(null!);

  const segRefs     = useMemo(() => [s0, s1, s2, s3, s4, s5], []);
  const segPos      = useMemo(() => buildSegmentPositions(), []);
  const anchorWorld = useMemo(() => new THREE.Vector3(0, ANCHOR_Y, 0), []);

  const iters = isMobile ? 4 : 8;

  return (
    <Physics
      gravity={[0, -9.81, 0]}
      maxVelocityIterations={iters}
      maxVelocityFrictionIterations={iters}
      maxStabilizationIterations={iters}
    >
      {/* ── Fixed anchor (klip kerah) ─────────────────────────────── */}
      <RigidBody
        ref={anchorRef}
        type="fixed"
        position={[0, ANCHOR_Y, 0]}
        colliders={false}
      >
        {/* Small metallic pin visual */}
        <mesh>
          <cylinderGeometry args={[0.07, 0.07, 0.22, 10]} />
          <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.15} />
        </mesh>
      </RigidBody>

      {/* ── Rope segments ─────────────────────────────────────────── */}
      <RigidBody ref={s0} type="dynamic" position={segPos[0]} colliders={false} linearDamping={0.8} angularDamping={1.5} gravityScale={0.2}>
        <mesh visible={false}><sphereGeometry args={[0.04, 4, 4]} /><meshBasicMaterial /></mesh>
      </RigidBody>
      <RigidBody ref={s1} type="dynamic" position={segPos[1]} colliders={false} linearDamping={0.8} angularDamping={1.5} gravityScale={0.2}>
        <mesh visible={false}><sphereGeometry args={[0.04, 4, 4]} /><meshBasicMaterial /></mesh>
      </RigidBody>
      <RigidBody ref={s2} type="dynamic" position={segPos[2]} colliders={false} linearDamping={0.8} angularDamping={1.5} gravityScale={0.2}>
        <mesh visible={false}><sphereGeometry args={[0.04, 4, 4]} /><meshBasicMaterial /></mesh>
      </RigidBody>
      <RigidBody ref={s3} type="dynamic" position={segPos[3]} colliders={false} linearDamping={0.8} angularDamping={1.5} gravityScale={0.2}>
        <mesh visible={false}><sphereGeometry args={[0.04, 4, 4]} /><meshBasicMaterial /></mesh>
      </RigidBody>
      <RigidBody ref={s4} type="dynamic" position={segPos[4]} colliders={false} linearDamping={0.8} angularDamping={1.5} gravityScale={0.2}>
        <mesh visible={false}><sphereGeometry args={[0.04, 4, 4]} /><meshBasicMaterial /></mesh>
      </RigidBody>
      <RigidBody ref={s5} type="dynamic" position={segPos[5]} colliders={false} linearDamping={0.8} angularDamping={1.5} gravityScale={0.2}>
        <mesh visible={false}><sphereGeometry args={[0.04, 4, 4]} /><meshBasicMaterial /></mesh>
      </RigidBody>

      {/* ── Card (draggable) ─────────────────────────────────────── */}
      <RigidBody
        ref={cardRef}
        type="dynamic"
        position={[0, CARD_INIT_Y, 0]}
        colliders={false}
        linearDamping={2.0}
        angularDamping={3.0}
        gravityScale={1}
      >
        {/* Invisible thin box so Rapier tracks the body */}
        <mesh visible={false}>
          <boxGeometry args={[CARD_W, CARD_H, 0.06]} />
          <meshBasicMaterial />
        </mesh>

        <BadgeMesh cardRef={cardRef} />
      </RigidBody>

      {/* ── Joints: anchor → s0 → s1 → s2 → s3 → s4 → s5 → card ─ */}
      <RopeJoint a={anchorRef} b={s0} />
      <RopeJoint a={s0}  b={s1} />
      <RopeJoint a={s1}  b={s2} />
      <RopeJoint a={s2}  b={s3} />
      <RopeJoint a={s3}  b={s4} />
      <RopeJoint a={s4}  b={s5} />
      {/*
        Last joint attaches s5's bottom to the TOP of the card.
        aOff = [0, -0.06, 0]  → bottom of s5 in its own local space
        bOff = [0, CARD_TOP_LOC, 0]  → top of card in card's local space
      */}
      <RopeJoint
        a={s5}
        b={cardRef as React.MutableRefObject<RapierRigidBody>}
        aOff={[0, -0.06, 0]}
        bOff={[0, CARD_TOP_LOC, 0]}
      />

      {/* ── MeshLine rope visual ─────────────────────────────────── */}
      <RopeRenderer
        anchorPos={anchorWorld}
        segRefs={segRefs}
        cardRef={cardRef}
      />

      {/* Lighting */}
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 6, 4]} intensity={1.0} castShadow={false} />
      <pointLight position={[-3, 4, 3]} intensity={0.55} color="#7b82ff" />
      <pointLight position={[3, -2, 2]} intensity={0.3} color="#ffffff" />
    </Physics>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   EXPORT — Badge3DPhysics
   Container: identical outer sizing to Badge3D (maxWidth 420, margin auto).
   overflow: hidden ensures the canvas NEVER bleeds outside this box.
   Height 680px gives room for anchor + rope above the card.
───────────────────────────────────────────────────────────────────────────── */
export default function Badge3DPhysics() {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;
  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio : 1,
    isMobile ? 1.5 : 2,
  );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        // Extra height above the old Badge3D so the anchor + rope show above card
        height: 680,
        position: "relative",
        // Critical: clip the canvas so it can NEVER overflow and cover the navbar
        overflow: "hidden",
        // Isolate stacking context so z-index is self-contained
        isolation: "isolate",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={dpr}
        style={{
          background: "transparent",
          // Ensure canvas fills container exactly — no overflow
          width: "100%",
          height: "100%",
          display: "block",
        }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = "none";
        }}
      >
        <PhysicsScene isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
