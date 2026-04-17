import { Outlet } from "react-router";
import { useEffect } from "react";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { Sidebar } from "../components/Sidebar";

export const RootLayout = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="lg:ml-64">
        <Header />
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
};
