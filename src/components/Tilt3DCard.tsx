import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;      // degrees, default 12
  scale?: number;        // hover scale, default 1.02
  glareOpacity?: number; // 0–1, default 0.15
}

export default function Tilt3DCard({
  children,
  className = "",
  maxTilt = 12,
  scale = 1.02,
  glareOpacity = 0.15,
}: Tilt3DCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Raw mouse values
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smoothed with spring
  const x = useSpring(rawX, { stiffness: 180, damping: 22 });
  const y = useSpring(rawY, { stiffness: 180, damping: 22 });

  // Map to rotateY / rotateX
  const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);

  // Glare position
  const glareX = useTransform(x, [-0.5, 0.5], ["-30%", "130%"]);
  const glareY = useTransform(y, [-0.5, 0.5], ["-30%", "130%"]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <div
      className={`card-3d-wrapper ${className}`}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="card-3d relative h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {children}

        {/* Glare overlay */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,${glareOpacity}), transparent 60%)`,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      </motion.div>
    </div>
  );
}
