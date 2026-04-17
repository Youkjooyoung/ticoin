import { Bell, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useLocation } from "react-router";

export const Header = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "피드";
      case "/search":
        return "검색";
      case "/trending":
        return "트렌딩";
      case "/portfolio":
        return "포트폴리오";
      case "/watchlist":
        return "관심목록";
      case "/profile":
        return "프로필";
      default:
        return "FinGram";
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-14">
        <h1 className="lg:hidden text-xl font-bold bg-gradient-to-r from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] bg-clip-text text-transparent">
          FinGram
        </h1>
        <div className="hidden lg:block text-lg font-semibold">{getPageTitle()}</div>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-accent transition-colors"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-accent transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
