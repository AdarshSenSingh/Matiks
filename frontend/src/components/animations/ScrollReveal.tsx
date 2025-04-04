import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface ScrollRevealProps {
  children: ReactNode;
  threshold?: number;
  triggerOnce?: boolean;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
}

const ScrollReveal = ({
  children,
  threshold = 0.1,
  triggerOnce = true,
  direction = "up",
  distance = 50,
  delay = 0,
  duration = 0.6,
  className = "",
}: ScrollRevealProps) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  });

  // Set initial values based on direction
  let initial: { opacity: number; x?: number; y?: number } = { opacity: 0 };

  if (direction === "up") {
    initial = { ...initial, y: distance };
  } else if (direction === "down") {
    initial = { ...initial, y: -distance };
  } else if (direction === "left") {
    initial = { ...initial, x: distance };
  } else if (direction === "right") {
    initial = { ...initial, x: -distance };
  }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier for a smooth easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
