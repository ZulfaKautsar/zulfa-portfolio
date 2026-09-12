// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * Badge3D — kartu ID lanyard. Titik jepit tali SELALU diam di tempat;
 * yang berayun (rotasi, bukan geser sejajar) hanya kartunya, persis
 * seperti lanyard sungguhan yang digantung di satu titik tetap.
 *
 * Cara pakai:
 *   import Badge3D from "@/components/Badge3D";
 *   <Badge3D />
 *
 * Pastikan gambar badge (id-badge-zulfa.png) ada di /public/badge/
 */
export default function Badge3D() {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0 });

  // Ayunan (rotasi) dari titik jepit di atas — INI yang gerak saat drag
  const swing = useMotionValue(0);
  const springSwing = useSpring(swing, {
    stiffness: 110,
    damping: 7,
    mass: 0.9,
  });

  // Tilt 3D halus mengikuti mouse (hanya aktif saat tidak sedang di-drag)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 120, damping: 15 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 120, damping: 15 });
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);

  // Ayunan otomatis saat pertama kali masuk halaman — dibuat lebih
  // kencang di awal (biar orang sadar kartunya bisa digerakkan/drag),
  // baru berangsur pelan dan diam.
  useEffect(() => {
    const controls = animate(swing, [0, -38, -38, 30, -24, 17, -11, 6, -3, 0], {
      duration: 2.6,
      ease: "easeInOut",
      times: [0, 0.06, 0.14, 0.28, 0.42, 0.55, 0.67, 0.78, 0.89, 1],
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePointerDown(e) {
    setIsDragging(true);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    dragState.current.startX = clientX;
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
  }

  function handlePointerMove(e) {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const delta = clientX - dragState.current.startX;
    const angle = Math.max(-38, Math.min(38, delta / 4));
    swing.set(angle);
  }

  function handlePointerUp() {
    setIsDragging(false);
    swing.set(0); // lepas -> pegas mengayun balik ke tengah sendiri
    window.removeEventListener("mousemove", handlePointerMove);
    window.removeEventListener("mouseup", handlePointerUp);
    window.removeEventListener("touchmove", handlePointerMove);
    window.removeEventListener("touchend", handlePointerUp);
  }

  function handleMouseMove(e) {
    if (isDragging) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1400,
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      {/* Pivot: titik ini DIAM, persis di titik jepit tali paling atas */}
      <motion.div
        style={{
          rotate: springSwing,
          rotateX,
          rotateY,
          transformOrigin: "50% 0%", // titik jepit = anchor tetap
          transformStyle: "preserve-3d",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
        animate={!isDragging ? { y: [0, 8, 0] } : { y: 0 }}
        transition={
          !isDragging
            ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        whileTap={{ scale: 0.99 }}
      >
        <img
          src="/badge/id-badge-zulfa.png"
          alt="Zulfa Adzin Kautsar — Web Developer Intern"
          draggable={false}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.45))",
            userSelect: "none",
          }}
        />
      </motion.div>
    </div>
  );
}