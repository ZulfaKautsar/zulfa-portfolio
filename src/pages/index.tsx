import Container from "@/components/Container";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/Home.module.css";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Code2,
  Frame,
  SearchCheck,
  Eye,
  MonitorSmartphone,
  Gamepad2,
  MapPinned,
  Sprout,
  Users,
  Zap,
  ClipboardCheck,
  Footprints,
  Award,
  ExternalLink,
  Mail,
  Download,
  GitBranch,
} from "lucide-react";
import { TriangleDownIcon } from "@radix-ui/react-icons";
import {
  SiHtml5,
  SiCss,
  SiBootstrap,
  SiPhp,
  SiLaravel,
  SiJavascript,
  SiPython,
  SiMysql,
  SiFigma,
  SiGithub,
  SiApache,
} from "react-icons/si";
import { FaJava, FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import { cn, scrollTo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Badge3D from "@/components/Badge3D";
import dynamic from "next/dynamic";
import Tilt3DCard from "@/components/Tilt3DCard";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/* ── Dynamic imports (SSR: false) for Three.js components ─────────── */
const ParticleField = dynamic(
  () => import("@/components/three/ParticleField"),
  { ssr: false },
);
const FloatingGeometry = dynamic(
  () => import("@/components/three/FloatingGeometry"),
  { ssr: false },
);

/* ─── ProjectSlideshow ───────────────────────────────────────────── */
function ProjectSlideshow({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2200);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="relative aspect-video h-full w-full overflow-hidden rounded-t-md bg-gradient-to-br from-primary/30 to-secondary/20">
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-2 pt-6">
        <span className="clash-grotesk text-center text-sm tracking-tight text-white">
          {title}
        </span>
      </div>
    </div>
  );
}

/* ─── ProjectDetailModal ─────────────────────────────────────────── */
function ProjectDetailModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = project ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-white/10 bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              ✕
            </button>
            <div className="overflow-y-auto min-h-0">
              {project.images && project.images.length > 0 ? (
                <div className="grid grid-cols-1 gap-1 bg-black/20 sm:grid-cols-2">
                  {project.images.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/30 to-secondary/20">
                  <project.icon className="h-12 w-12 text-primary" />
                </div>
              )}
              <div className="p-6">
                <h3 className="clash-grotesk text-2xl tracking-tight text-foreground">
                  {project.title}
                </h3>
                <p className="mt-3 tracking-tight text-muted-foreground">
                  {project.description}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CertificationDetailModal({
  cert,
  onClose,
}: {
  cert: (typeof certifications)[0] | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = cert ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [cert, onClose]);

  return (
    <AnimatePresence>
      {cert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-white/10 bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              ✕
            </button>
            <div className="flex flex-col overflow-hidden">
              <div className="flex max-h-[55vh] w-full items-center justify-center bg-black/20">
                <img
                  src={cert.image}
                  alt={cert.name}
                  className="max-h-[55vh] w-full object-contain"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start gap-2">
                  <Award className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <h3 className="clash-grotesk text-2xl tracking-tight text-foreground">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {cert.issuer} &middot; {cert.issueDate}
                    </p>
                  </div>
                </div>
                {cert.credentialId && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    ID Kredensial: {cert.credentialId}
                  </p>
                )}
                {"credentialUrl" in cert && cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Verifikasi sertifikat →
                  </a>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {cert.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── MagneticButton ─────────────────────────────────────────────── */
function MagneticButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.3);
    y.set((e.clientY - cy) * 0.3);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={`btn-magnetic inline-flex ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ───────────────────────────────────────────────────────── */
const skills = [
  { name: "HTML", icon: SiHtml5, color: "#E34F26" },
  { name: "CSS", icon: SiCss, color: "#1572B6" },
  { name: "Bootstrap", icon: SiBootstrap, color: "#7952B3" },
  { name: "PHP", icon: SiPhp, color: "#777BB4" },
  { name: "Laravel", icon: SiLaravel, color: "#FF2D20" },
  { name: "Java", icon: FaJava, color: "#EA2D2E" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "MySQL", icon: SiMysql, color: "#4479A1" },
  { name: "Figma", icon: SiFigma, color: "#F24E1E" },
  { name: "GitHub", icon: SiGithub, color: "#FFFFFF" },
  { name: "Apache", icon: SiApache, color: "#D22128" },
];

const certifications = [
  {
    name: "SQL (Intermediate)",
    issuer: "HackerRank",
    issueDate: "September 2026",
    credentialId: "3F34ODE695E6",
    image: "/assets/certificates/sql-intermediate-hackerrank.png",
    skills: ["SQL"],
  },
  {
    name: "CCNA: Introduction to Networks",
    issuer: "Cisco Networking Academy",
    issueDate: "Januari 2024",
    credentialId: "",
    credentialUrl: "",
    image: "/assets/certificates/cisco-ccna-intro-networks.png",
    skills: [
      "Computer Networking",
      "Networking",
      "Cisco Systems Products",
      "Network Administration",
      "Internet Protocol Suite (TCP/IP)",
      "IP Addressing",
    ],
  },
  {
    name: "Web Development Fundamentals",
    issuer: "IBM SkillsBuild",
    issueDate: "September 2026",
    credentialId: "",
    credentialUrl:
      "https://www.credly.com/badges/8284a6fe-86cc-421a-982a-f903fd37d54b",
    image: "/assets/certificates/ibm-web-development-fundamentals.png",
    skills: [
      "HTML",
      "Cascading Style Sheets (CSS)",
      "JavaScript",
      "Pengembangan Web",
      "Pengembangan Front-End",
      "Pengembangan Back-End",
      "Desain Responsif",
      "Pengujian",
      "System Deployment",
    ],
  },
];

type Project = {
  title: string;
  description: string;
  icon: typeof Code2;
  href: string;
  images?: string[];
};

const projects: Project[] = [
  {
    title: "Desain UI/UX Absensi Online ASN",
    description:
      "Rancangan antarmuka aplikasi mobile presensi ASN berbasis lokasi (GPS) dan foto verifikasi, dibuat di Figma sebagai tugas kelompok mata kuliah UI/UX Design.",
    icon: ClipboardCheck,
    href: "#",
    images: [
      "/assets/asn/splash-login.jpeg",
      "/assets/asn/beranda-absensi.jpeg",
    ],
  },
  {
    title: "UI/UX Nike Shoe E-Commerce App",
    description:
      "Konsep desain UI/UX aplikasi e-commerce sepatu bertema Nike (latihan mandiri, bukan proyek resmi/afiliasi Nike), mencakup onboarding, login, beranda, hingga detail produk di Figma.",
    icon: Footprints,
    href: "#",
    images: [
      "/assets/sepatu/onboarding.jpeg",
      "/assets/sepatu/katalog.jpeg",
      "/assets/sepatu/detail-produk.jpeg",
    ],
  },
  {
    title: "Aplikasi Booking Futsal",
    description:
      "Aplikasi desktop pemesanan lapangan futsal (Java Swing & MySQL) dengan fitur booking, cek jadwal, pembayaran, dan pembatalan.",
    icon: Gamepad2,
    href: "#",
    images: [
      "/assets/booking-futsal/form-pemesanan.jpeg",
      "/assets/booking-futsal/laporan-pemesanan.jpeg",
    ],
  },
  {
    title: 'Mangga Siaga',
    description:
      "Konsep aplikasi mobile pelaporan masalah lingkungan (jalan rusak, sampah, lampu mati) lengkap dengan pemantauan status laporan.",
    icon: MapPinned,
    href: "#",
    images: [
      "/assets/mangga-siaga/beranda.jpeg",
      "/assets/mangga-siaga/daftar-laporan.jpeg",
      "/assets/mangga-siaga/detail-laporan.jpeg",
    ],
  },
  {
    title: "Website PATANI",
    description:
      "Platform website yang dikembangkan bersama petani sebagai mitra lapangan.",
    icon: Sprout,
    href: "#",
    images: [
      "/assets/patani/halaman-utama.jpeg",
      "/assets/patani/dashboard.jpeg",
      "/assets/patani/chatbot-ai.jpeg",
      "/assets/patani/prediksi.jpeg",
    ],
  },
  {
    title: "Website HIMATIF",
    description:
      "Pengembangan website untuk Himpunan Mahasiswa Informatika (HIMATIF).",
    icon: Users,
    href: "#",
    images: ["/assets/himatif/beranda.jpeg"],
  },
  {
    title: "Website PLN Indramayu Kota",
    description:
      "Kolaborasi pengembangan website bersama PLN Indramayu Kota.",
    icon: Zap,
    href: "#",
    images: [
      "/assets/pln/menu-utama.jpeg",
      "/assets/pln/monitor-antrian.jpeg",
      "/assets/pln/panggilan-antrian.jpeg",
    ],
  },
];

const services = [
  {
    service: "Web Development",
    description:
      "Membangun website dan sistem informasi menggunakan HTML, CSS, Bootstrap, PHP (Laravel), dan MySQL.",
    icon: Code2,
  },
  {
    service: "UI/UX Design",
    description:
      "Merancang alur pengguna dan tampilan antarmuka yang intuitif menggunakan Figma.",
    icon: Frame,
  },
  {
    service: "Database Design",
    description:
      "Merancang dan mengelola basis data MySQL untuk mendukung sistem yang skalabel.",
    icon: SearchCheck,
  },
  {
    service: "Responsive Design",
    description:
      "Membuat tampilan website yang rapi dan berfungsi baik di berbagai perangkat.",
    icon: MonitorSmartphone,
  },
  {
    service: "Integrasi & Deployment",
    description:
      "Menggabungkan (merge) kode dari tim dan melakukan deployment ke server produksi.",
    icon: Eye,
  },
  {
    service: "Version Control",
    description:
      "Mengelola kode dengan Git & GitHub agar kerja tim tetap rapi dan terhindar dari konflik.",
    icon: GitBranch,
  },
];

/* ─── Hero word-by-word animation variant ───────────────────────── */
const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};
const heroWordVariants = {
  hidden: { opacity: 0, y: 32, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function Home() {
  const refScrollContainer = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCert, setSelectedCert] = useState<(typeof certifications)[0] | null>(null);

  // Scroll Y ref for passing to FloatingGeometry
  const scrollY = useRef(0);

  // Setup GSAP ScrollTrigger + locomotive proxy
  useScrollAnimation(refScrollContainer as React.RefObject<HTMLElement>);

  // Track scroll for nav active state + badge scroll data
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    let ticking = false;

    function handleScroll() {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        let current = "";
        scrollY.current = window.scrollY;
        setIsScrolled(window.scrollY > 0);

        sections.forEach((section) => {
          const sectionTop = section.offsetTop;
          if (window.scrollY >= sectionTop - 250) {
            current = section.getAttribute("id") ?? "";
          }
        });

        navLinks.forEach((li) => {
          li.classList.remove("nav-active");

          if (li.getAttribute("href") === `#${current}`) {
            li.classList.add("nav-active");
          }
        });

        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Carousel
  useEffect(() => {
    if (!carouselApi) return;

    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap() + 1);

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1);
    });
  }, [carouselApi]);

  return (
    <Container>
      {/* ── Particle field fixed behind everything ─────────────── */}
      <ParticleField />

      <div ref={refScrollContainer}>
        <Gradient />

        {/* ══════════════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════════════ */}
        <section
          id="home"
          data-scroll-section
          className="mt-40 flex w-full flex-col items-center lg:mt-0 lg:min-h-screen lg:flex-row lg:items-start lg:justify-between lg:pt-32"
        >
          {/* — Left: Text content — */}
          <motion.div
            className={`${styles.intro} order-2 lg:order-1 lg:pl-6 xl:pl-16`}
            initial="hidden"
            animate="visible"
            variants={heroContainerVariants}
          >
            <div>
              <h1
                data-scroll
                data-scroll-enable-touch-speed
                data-scroll-speed=".06"
                data-scroll-direction="horizontal"
              >
                <span className="flex flex-wrap gap-x-4 text-6xl tracking-tighter text-foreground lg:text-7xl 2xl:text-9xl">
                  {["Hello,", "I'm"].map((word) => (
                    <motion.span key={word} variants={heroWordVariants} className="hero-word inline-block">
                      {word}
                    </motion.span>
                  ))}
                  <br />
                </span>
                <motion.span
                  variants={heroWordVariants}
                  className="clash-grotesk text-gradient hero-word inline-block text-6xl lg:text-7xl 2xl:text-9xl"
                >
                  Zulfa.
                </motion.span>
              </h1>

              <motion.p
                variants={heroWordVariants}
                data-scroll
                data-scroll-enable-touch-speed
                data-scroll-speed=".06"
                className="mt-2 max-w-xl tracking-tight text-muted-foreground lg:text-lg 2xl:text-2xl"
              >
                Web Developer Intern di CV Grobmart &amp; Mahasiswa S1 Terapan
                Sistem Informasi Kota Cerdas, Politeknik Negeri Indramayu.
              </motion.p>
            </div>

            {/* CTA buttons */}
            <motion.span
              variants={heroWordVariants}
              data-scroll
              data-scroll-enable-touch-speed
              data-scroll-speed=".06"
              className="flex flex-row items-center space-x-3 pt-8"
            >
              <Link
                href="https://www.linkedin.com/in/zulfa-adzin-kautsar-b9b0723b2"
                target="_blank"
                passHref
              >
                <MagneticButton>
                  <Button size="lg" className="text-base animate-glow">
                    Get in touch <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </MagneticButton>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-base"
                onClick={() => scrollTo(document.querySelector("#about"))}
              >
                Learn more
              </Button>
            </motion.span>

            {/* Social links */}
            <motion.div
              variants={heroWordVariants}
              data-scroll
              data-scroll-enable-touch-speed
              data-scroll-speed=".06"
              className="flex flex-row items-center space-x-4 pt-8"
            >
              <Link
                href="https://www.linkedin.com/in/zulfa-adzin-kautsar-b9b0723b2"
                target="_blank"
                aria-label="LinkedIn"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-input bg-background text-muted-foreground transition duration-300 hover:-translate-y-1 hover:border-primary hover:text-primary"
              >
                <FaLinkedin className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:zulfakautsar028@gmail.com"
                aria-label="Email"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-input bg-background text-muted-foreground transition duration-300 hover:-translate-y-1 hover:border-primary hover:text-primary"
              >
                <Mail className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com/ZulfaKautsar"
                target="_blank"
                aria-label="GitHub"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-input bg-background text-muted-foreground transition duration-300 hover:-translate-y-1 hover:border-primary hover:text-primary"
              >
                <SiGithub className="h-5 w-5" />
              </Link>
              <Link
                href="/cv/CV_Zulfa_Adzin_Kautsar.pdf"
                target="_blank"
                className="ml-1 flex items-center gap-2 rounded-full border border-input bg-background px-5 py-3 text-base text-muted-foreground transition duration-300 hover:-translate-y-1 hover:border-primary hover:text-primary"
              >
                <Download className="h-5 w-5" />
                Download CV
              </Link>
            </motion.div>

            <div
              className={cn(
                styles.scroll,
                isScrolled && styles["scroll--hidden"],
              )}
            >
              Scroll to discover{" "}
              <TriangleDownIcon className="mt-1 animate-bounce" />
            </div>
          </motion.div>

          {/* — Right: 3D visuals — */}
          <div
            data-scroll
            data-scroll-speed="-.01"
            id={styles["canvas-container"]}
            className="relative order-1 mt-6 flex w-full flex-col items-start justify-center lg:order-2 lg:-mt-64"
          >
            {/* Glow blobs */}
            <div className="absolute -left-10 top-1/4 h-64 w-64 rounded-full bg-primary/30 blur-[100px]" />
            <div className="absolute -right-10 bottom-1/4 h-64 w-64 rounded-full bg-secondary/30 blur-[100px]" />

            {/* FloatingGeometry 3D — sits behind Badge3D on mobile, beside on desktop */}
            <div className="absolute inset-0 -z-0 opacity-90 pointer-events-none hidden lg:block">
              <FloatingGeometry scrollY={scrollY} />
            </div>

            {/* Badge3D card — preserved 100% */}
            <div className="relative z-10 flex flex-col items-center w-full">
              <Badge3D />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            ABOUT SECTION
        ══════════════════════════════════════════════════════════ */}
        <section id="about" data-scroll-section className="reveal-section">
          <div
            data-scroll
            data-scroll-speed=".4"
            data-scroll-position="top"
            className="my-20 flex max-w-6xl flex-col justify-start space-y-10"
          >
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="pt-8 pb-2 text-3xl font-light leading-normal tracking-tighter text-foreground xl:text-[40px]"
            >
              Mahasiswa semester 7 Program Studi{" "}
              <Link
                href="https://www.linkedin.com/in/zulfa-adzin-kautsar-b9b0723b2"
                target="_blank"
                className="underline decoration-primary/50 underline-offset-4 transition hover:decoration-primary"
              >
                S1 Terapan Sistem Informasi Kota Cerdas
              </Link>{" "}
              di Politeknik Negeri Indramayu. Saat ini
              menjalani magang sebagai Web Developer di CV Grobmart, dengan
              fokus pada pengembangan sistem informasi, perancangan aplikasi,
              serta desain UI/UX. Memiliki dasar kuat di HTML, CSS, Bootstrap,
              PHP (Laravel), Java, Python, JavaScript, MySQL, serta desain
              UI/UX menggunakan Figma.
            </motion.h2>

            {/* Skills */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Skill yang dikuasai
              </h3>
              <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-6">
                {skills.map((skill, i) => (
                  <motion.div
                    key={skill.name}
                    className="skill-badge group flex flex-col items-center gap-2 rounded-lg border border-muted/40 bg-muted/10 p-4 transition-all duration-300 hover:border-primary/60 hover:bg-muted/20 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                    whileHover={{ y: -4, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <skill.icon
                        size={36}
                        style={{ color: skill.color }}
                      />
                    </motion.div>
                    <span className="text-center text-sm tracking-tight text-muted-foreground">
                      {skill.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Lisensi &amp; Sertifikasi
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {certifications.map((cert) => (
                  <Tilt3DCard key={cert.name} maxTilt={8} className="h-full">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedCert(cert)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setSelectedCert(cert);
                      }}
                      className="flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-muted/40 bg-muted/10 transition-colors hover:border-primary/50 hover:bg-muted/20"
                    >
                      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden border-b border-muted/40 bg-black/20">
                        <img
                          src={cert.image}
                          alt={cert.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-start gap-2">
                          <Award className="mt-1 h-5 w-5 shrink-0 text-primary" />
                          <div>
                            <h4 className="clash-grotesk text-lg tracking-tight text-foreground">
                              {cert.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {cert.issuer} &middot; {cert.issueDate}
                            </p>
                          </div>
                        </div>
                        {cert.credentialId && (
                          <p className="mt-3 text-xs text-muted-foreground">
                            ID Kredensial: {cert.credentialId}
                          </p>
                        )}
                        <div className="mt-auto flex flex-wrap gap-2 pt-3">
                          {cert.skills.map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Tilt3DCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            PROJECTS SECTION
        ══════════════════════════════════════════════════════════ */}
        <section id="projects" data-scroll-section className="reveal-section">
          {/* Gradient accent */}
          <div className="relative isolate -z-10">
            <div
              className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-[100px] sm:-top-80 lg:-top-60"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary via-primary to-secondary opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              />
            </div>
          </div>

          <div className="my-20 xl:my-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-gradient clash-grotesk text-sm font-semibold tracking-tighter">
                ✨ Projects
              </span>
              <h2 className="mt-3 text-4xl font-semibold tracking-tighter xl:text-6xl">
                Proyek yang pernah saya kerjakan.
              </h2>
              <p className="mt-1.5 text-base tracking-tight text-muted-foreground xl:text-lg">
                Mulai dari aplikasi desktop, konsep aplikasi mobile, hingga
                website bersama berbagai mitra. Berikut beberapa di antaranya:
              </p>
            </motion.div>

            {/* Carousel with 3D tilt cards */}
            <div className="mt-14">
              <Carousel
                setApi={setCarouselApi}
                opts={{ align: "start" }}
                className="w-full"
              >
                <CarouselContent className="items-stretch">
                  {projects.map((project) => (
                    <CarouselItem
                      key={project.title}
                      className="project-card-item flex md:basis-1/2"
                    >
                      <Tilt3DCard className="w-full" maxTilt={10} glareOpacity={0.12}>
                        <Card
                          onClick={() => setSelectedProject(project)}
                          className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden border-white/5 bg-background/60 backdrop-blur transition duration-300 hover:border-primary/50"
                        >
                          <CardHeader className="relative p-0">
                            {project.images ? (
                              <ProjectSlideshow
                                images={project.images}
                                title={project.title}
                              />
                            ) : (
                              <div className="flex aspect-video h-full w-full flex-col items-center justify-center gap-3 rounded-t-md bg-gradient-to-br from-primary/30 to-secondary/20 object-cover">
                                <project.icon className="h-10 w-10 text-primary" />
                                <span className="clash-grotesk px-4 text-center text-lg tracking-tight text-foreground">
                                  {project.title}
                                </span>
                              </div>
                            )}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition duration-300 group-hover:opacity-100">
                              <span className="rounded-full bg-white/10 px-4 py-2 text-sm tracking-tight text-white backdrop-blur">
                                Lihat detail
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="flex w-full flex-1 flex-col bg-background/50 backdrop-blur shimmer-bg">
                            <CardTitle className="line-clamp-3 flex-1 border-t border-white/5 p-4 text-base font-normal leading-relaxed tracking-tighter">
                              {project.description}
                            </CardTitle>
                          </CardContent>
                        </Card>
                      </Tilt3DCard>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              <div className="py-2 text-center text-sm text-muted-foreground">
                <span className="font-semibold">
                  {current} / {count}
                </span>{" "}
                proyek
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SERVICES SECTION
        ══════════════════════════════════════════════════════════ */}
        <section id="services" data-scroll-section className="reveal-section">
          <div
            data-scroll
            data-scroll-speed=".4"
            data-scroll-position="top"
            className="my-20 flex flex-col justify-start space-y-10"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col"
            >
              <h2 className="text-4xl font-medium tracking-tight">
                Butuh info lebih?{" "}
                <span className="text-gradient clash-grotesk tracking-normal">
                  Saya siap bantu.
                </span>
              </h2>
              <p className="mt-2 max-w-xl tracking-tighter text-secondary-foreground">
                Berikut beberapa hal yang bisa saya kerjakan. Kalau ada
                pertanyaan, jangan ragu untuk menghubungi saya.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service, i) => (
                <Tilt3DCard key={service.service} maxTilt={8} scale={1.03}>
                  <motion.div
                    className="service-card-item flex h-full flex-col items-start rounded-md border border-white/5 bg-white/5 p-8 shadow-md backdrop-blur shimmer-bg"
                    whileHover={{ borderColor: "hsl(237 99% 74% / 0.4)" }}
                  >
                    <motion.div
                      whileHover={{ y: -4, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <service.icon className="mb-4 mt-2 text-primary" size={20} />
                    </motion.div>
                    <span className="text-lg tracking-tight text-foreground">
                      {service.service}
                    </span>
                    <span className="mt-2 tracking-tighter text-muted-foreground">
                      {service.description}
                    </span>
                  </motion.div>
                </Tilt3DCard>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            CONTACT SECTION
        ══════════════════════════════════════════════════════════ */}
        <section
          id="contact"
          data-scroll-section
          className="my-20 xl:my-28 reveal-section"
        >
          <div
            data-scroll
            data-scroll-speed=".4"
            data-scroll-position="top"
            className="relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-gradient-to-br from-primary/[6.5%] to-white/5 px-8 py-16 text-center xl:py-24"
          >
            {/* Animated background blobs */}
            <motion.div
              className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-primary/20 blur-[80px]"
              animate={{ scale: [1, 1.3, 1], x: [0, 20, 0], y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-secondary/20 blur-[80px]"
              animate={{ scale: [1, 1.2, 1], x: [0, -15, 0], y: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[60px]"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-4xl font-medium tracking-tighter xl:text-6xl">
                Mari{" "}
                <span className="text-gradient clash-grotesk">berkolaborasi.</span>
              </h2>
              <p className="mt-1.5 text-base tracking-tight text-muted-foreground xl:text-lg">
                Terbuka untuk kolaborasi, magang, dan proyek pengembangan web
                maupun UI/UX. Yuk terhubung di LinkedIn.
              </p>
              <Link
                href="https://www.linkedin.com/in/zulfa-adzin-kautsar-b9b0723b2"
                target="_blank"
                passHref
              >
                <MagneticButton className="mt-6">
                  <Button className="animate-glow">Get in touch</Button>
                </MagneticButton>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <CertificationDetailModal
        cert={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </Container>
  );
}

/* ─── Background Gradient (unchanged) ───────────────────────────── */
function Gradient() {
  return (
    <>
      {/* Upper gradient */}
      <div className="absolute -top-40 right-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <svg
          className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
            fillOpacity=".1"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#7980fe" />
              <stop offset={1} stopColor="#f0fff7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Lower gradient */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <svg
          className="relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#ecb5b0c9-546c-4772-8c71-4d3f06d544bc)"
            fillOpacity=".1"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="ecb5b0c9-546c-4772-8c71-4d3f06d544bc"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9A70FF" />
              <stop offset={1} stopColor="#838aff" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
}
