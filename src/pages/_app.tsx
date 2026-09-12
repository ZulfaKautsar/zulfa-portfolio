import { type AppType } from "next/dist/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

import "@/styles/globals.css";
import "@/styles/locomotive-scroll.css";

import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  display: "swap",
  subsets: ["latin"],
});

/** Page-level transition variants */
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] },
  },
};

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();

  return (
    <div lang="en" className={dmSans.className}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={router.asPath}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MyApp;
