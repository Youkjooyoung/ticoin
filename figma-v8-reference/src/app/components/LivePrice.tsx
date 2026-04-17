import { motion, useAnimation } from "motion/react";
import { useEffect } from "react";

interface LivePriceProps {
  price: string;
  className?: string;
}

export const LivePrice = ({ price, className = "" }: LivePriceProps) => {
  const controls = useAnimation();

  useEffect(() => {
    const interval = setInterval(() => {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.3 },
      });
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [controls]);

  return (
    <motion.p animate={controls} className={className}>
      {price}
      <span className="inline-block ml-1 w-1.5 h-1.5 rounded-full bg-[var(--gain)] animate-pulse" />
    </motion.p>
  );
};
