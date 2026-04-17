import { Home, Search, TrendingUp, User, Flame, Star, Settings } from "lucide-react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router";

export const Sidebar = () => {
  const location = useLocation();

  const mainTabs = [
    { id: "home", path: "/", icon: Home, label: "홈" },
    { id: "search", path: "/search", icon: Search, label: "검색" },
    { id: "trending", path: "/trending", icon: Flame, label: "트렌딩" },
    { id: "portfolio", path: "/portfolio", icon: TrendingUp, label: "포트폴리오" },
    { id: "watchlist", path: "/watchlist", icon: Star, label: "관심목록" },
    { id: "profile", path: "/profile", icon: User, label: "프로필" },
  ];

  const bottomTabs = [{ id: "settings", icon: Settings, label: "설정" }];

  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-card/50 backdrop-blur-lg border-r border-border/50 flex-col justify-between p-4 z-40">
      <div>
        <div className="mb-8 px-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] bg-clip-text text-transparent">
            FinGram
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Financial Social Network</p>
        </div>

        <nav className="space-y-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;

            return (
              <Link key={tab.id} to={tab.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[var(--accent-gradient-start)]/10 to-[var(--accent-gradient-end)]/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-tab"
                      className="ml-auto w-1.5 h-8 rounded-full bg-gradient-to-b from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)]"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      <nav className="space-y-2">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
            >
              <Icon className="w-6 h-6" />
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};
