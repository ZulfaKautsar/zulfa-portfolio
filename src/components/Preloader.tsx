import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "@/styles/Container.module.css";

/* Framer motion variants */
const opacity = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: { duration: 0.6, delay: 0.2 },
  },
};

const slideUp = {
  initial: {
    top: 0,
  },
  exit: {
    top: "-100vh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.4 },
  },
};

export default function Preloader() {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height}  L0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height}  L0 0`;

  const curve = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 },
    },
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      className={styles.introduction}
    >
      {dimension.width > 0 && (
        <>
          <motion.div
            variants={opacity}
            initial="initial"
            animate="enter"
            className="loaderScene"
          >
            <div className="loaderOrbit">
              <div className="loaderRing loaderRing--x" />
              <div className="loaderRing loaderRing--y" />
              <div className="loaderRing loaderRing--z" />
              <div className="loaderCore" />
            </div>
            <span className="loaderLabel">zulfa.</span>
          </motion.div>
          <svg>
            <motion.path
              variants={curve}
              initial="initial"
              exit="exit"
            ></motion.path>
          </svg>
        </>
      )}

      <style jsx>{`
        .loaderScene {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          perspective: 900px;
        }

        .loaderOrbit {
          position: relative;
          width: 96px;
          height: 96px;
          transform-style: preserve-3d;
          animation: loaderTumble 4.5s infinite linear;
        }

        .loaderRing {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid transparent;
        }

        .loaderRing--x {
          border-top-color: hsl(var(--primary));
          border-bottom-color: hsl(var(--primary));
          box-shadow: 0 0 18px hsl(var(--primary) / 0.45);
          transform: rotateX(70deg);
          animation: loaderSpinX 2.4s infinite linear;
        }

        .loaderRing--y {
          border-left-color: hsl(var(--secondary));
          border-right-color: hsl(var(--secondary));
          box-shadow: 0 0 18px hsl(var(--secondary) / 0.45);
          transform: rotateY(70deg);
          animation: loaderSpinY 3.1s infinite linear reverse;
        }

        .loaderRing--z {
          border-top-color: hsl(var(--foreground) / 0.6);
          border-bottom-color: hsl(var(--foreground) / 0.6);
          transform: rotateX(70deg) rotateY(70deg);
          animation: loaderSpinZ 3.8s infinite linear;
        }

        .loaderCore {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 16px;
          margin: -8px 0 0 -8px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 35% 35%,
            hsl(var(--primary)),
            hsl(var(--secondary))
          );
          box-shadow: 0 0 24px hsl(var(--primary) / 0.7);
          animation: loaderPulse 1.6s infinite ease-in-out;
        }

        .loaderLabel {
          font-family: var(--font-clash-grotesk, inherit);
          letter-spacing: 0.08em;
          text-transform: lowercase;
          color: hsl(var(--foreground));
          opacity: 0.75;
          font-size: 1.1rem;
        }

        @keyframes loaderTumble {
          from {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          to {
            transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
          }
        }

        @keyframes loaderSpinX {
          from {
            transform: rotateX(70deg) rotateZ(0deg);
          }
          to {
            transform: rotateX(70deg) rotateZ(360deg);
          }
        }

        @keyframes loaderSpinY {
          from {
            transform: rotateY(70deg) rotateZ(0deg);
          }
          to {
            transform: rotateY(70deg) rotateZ(360deg);
          }
        }

        @keyframes loaderSpinZ {
          from {
            transform: rotateX(70deg) rotateY(70deg) rotateZ(0deg);
          }
          to {
            transform: rotateX(70deg) rotateY(70deg) rotateZ(360deg);
          }
        }

        @keyframes loaderPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.8;
          }
        }
      `}</style>
    </motion.div>
  );
}
