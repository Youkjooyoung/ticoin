import { Home, Search, TrendingUp, User } from "lucide-react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";

export const BottomNav = () => {
  const location = useLocation();

  const tabs = [
    { id: "home", path: "/", icon: Home, label: "홈" },
    { id: "search", path: "/search", icon: Search, label: "검색" },
    { id: "portfolio", path: "/portfolio", icon: TrendingUp, label: "포트폴리오" },
    { id: "profile", path: "/profile", icon: User, label: "프로필" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 px-4 pb-safe z-50">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <Link key={tab.id} to={tab.path} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center justify-center gap-1"
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)]"
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
