import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * useScrollAnimation
 *
 * Sets up smooth scrolling with Lenis and synchronizes it with GSAP
 * ScrollTrigger, then wires up all scroll-reveal animations for the
 * portfolio sections.
 *
 * Integration flow:
 *   lenis scroll        → ScrollTrigger.update   (position sync)
 *   gsap.ticker tick    → lenis.raf(time)         (drive lenis' RAF loop)
 *
 * @param scrollContainerRef  kept for API compatibility; not used by Lenis
 *                            directly since Lenis smooth-scrolls the window.
 */
export function useScrollAnimation(
  scrollContainerRef: React.RefObject<HTMLElement>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenisRef = useRef<any>(null);
  const tickerFnRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    // Guard: must be in browser
    if (typeof window === "undefined") return;

    let mm = gsap.matchMedia();

    function init() {
      // ── Lenis: smooth scroll on the window ────────────────────────────────
      const lenis = new Lenis({
        duration: 1.2,
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      // ── Two-way sync with GSAP ─────────────────────────────────────────────
      // 1. lenis scroll event → update all ScrollTrigger positions
      lenis.on("scroll", ScrollTrigger.update);

      // 2. drive lenis' internal raf loop from GSAP's ticker (single rAF loop)
      const tickerFn = (time: number) => {
        lenis.raf(time * 1000);
      };
      tickerFnRef.current = tickerFn;
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      // ── Reveal animations: sections fade + slide up ────────────────────────
      const revealEls = document.querySelectorAll(".reveal-section");
      revealEls.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              end: "top 50%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // ── Stagger for skill badges ───────────────────────────────────────────
      const skillBadges = document.querySelectorAll(".skill-badge");
      if (skillBadges.length) {
        gsap.fromTo(
          skillBadges,
          { opacity: 0, scale: 0.7, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            ease: "back.out(1.5)",
            stagger: 0.06,
            scrollTrigger: {
              trigger: skillBadges[0]!.parentElement,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // ── Stagger for project cards ──────────────────────────────────────────
      const projectCards = document.querySelectorAll(".project-card-item");
      if (projectCards.length) {
        gsap.fromTo(
          projectCards,
          { opacity: 0, y: 60, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: "#projects",
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // ── Service cards stagger ──────────────────────────────────────────────
      const serviceCards = document.querySelectorAll(".service-card-item");
      if (serviceCards.length) {
        gsap.fromTo(
          serviceCards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: "#services",
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // ── Hero text reveal (runs immediately, no scroll trigger) ─────────────
      mm.add("(min-width: 1px)", () => {
        const heroWords = document.querySelectorAll(".hero-word");
        if (heroWords.length) {
          gsap.fromTo(
            heroWords,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.12,
              delay: 0.3,
            },
          );
        }
      });

      // ── Final refresh to ensure correct positions ──────────────────────────
      ScrollTrigger.refresh();
    }

    init();

    return () => {
      // Cleanup on unmount
      mm.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
      }
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}