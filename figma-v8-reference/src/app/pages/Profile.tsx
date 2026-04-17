import { motion } from "motion/react";
import {
  User,
  Settings,
  ChevronRight,
  Shield,
  Bell,
  Palette,
  HelpCircle,
  LogOut,
  Award,
  TrendingUp,
  Heart,
  MessageCircle,
} from "lucide-react";

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

const StatsCard = ({ icon: Icon, label, value, color }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex-1 p-4 bg-card border border-border/50 rounded-2xl"
  >
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-2xl font-bold mb-1">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  value?: string;
  onClick?: () => void;
  color?: string;
}

const MenuItem = ({ icon: Icon, label, value, onClick, color }: MenuItemProps) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 bg-card border border-border/50 rounded-2xl hover:border-border transition-colors text-left"
  >
    <div
      className={`w-10 h-10 rounded-xl ${
        color || "bg-accent"
      } flex items-center justify-center`}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <p className="font-medium">{label}</p>
      {value && <p className="text-xs text-muted-foreground">{value}</p>}
    </div>
    <ChevronRight className="w-5 h-5 text-muted-foreground" />
  </motion.button>
);

export const Profile = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 lg:pb-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-6 bg-gradient-to-br from-card via-card to-accent/20 border border-border/50 rounded-3xl mb-6"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--accent-gradient-start)]/20 to-[var(--accent-gradient-end)]/20 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">투자왕</h2>
            <p className="text-sm text-muted-foreground">@investor_king</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-card/50 border border-border/50 flex items-center justify-center hover:bg-card transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="relative grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">142</p>
            <p className="text-xs text-muted-foreground">팔로워</p>
          </div>
          <div>
            <p className="text-2xl font-bold">89</p>
            <p className="text-xs text-muted-foreground">팔로잉</p>
          </div>
          <div>
            <p className="text-2xl font-bold">24</p>
            <p className="text-xs text-muted-foreground">게시물</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatsCard
          icon={TrendingUp}
          label="총 수익률"
          value="+18.5%"
          color="bg-[var(--gain)]/20 text-[var(--gain)]"
        />
        <StatsCard
          icon={Award}
          label="랭킹"
          value="#142"
          color="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatsCard
          icon={Heart}
          label="받은 좋아요"
          value="1,234"
          color="bg-red-500/20 text-red-500"
        />
        <StatsCard
          icon={MessageCircle}
          label="댓글"
          value="567"
          color="bg-blue-500/20 text-blue-500"
        />
      </div>

      {/* Settings Menu */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground px-2">설정</h3>
        <MenuItem
          icon={Bell}
          label="알림"
          value="활성화됨"
          color="bg-blue-500/20 text-blue-500"
        />
        <MenuItem
          icon={Shield}
          label="개인정보 및 보안"
          color="bg-green-500/20 text-green-500"
        />
        <MenuItem
          icon={Palette}
          label="테마"
          value="다크 모드"
          color="bg-purple-500/20 text-purple-500"
        />
      </div>

      {/* Support Menu */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground px-2">지원</h3>
        <MenuItem
          icon={HelpCircle}
          label="도움말 및 지원"
          color="bg-orange-500/20 text-orange-500"
        />
      </div>

      {/* Logout */}
      <MenuItem
        icon={LogOut}
        label="로그아웃"
        color="bg-red-500/20 text-red-500"
        onClick={() => {
          console.log("Logout clicked");
        }}
      />

      {/* App Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">FinGram v1.0.0</p>
        <p className="text-xs text-muted-foreground mt-1">
          Financial Social Network
        </p>
      </div>
    </div>
  );
};
