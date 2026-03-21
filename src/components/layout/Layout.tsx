import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { FloatingHearts } from "../FloatingHearts";

export function Layout() {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="mesh-bg" />

      {/* Ambient Floating Hearts */}
      <FloatingHearts />
      {/* Reduced from 4 → 2 blobs for mobile GPU savings */}
      <div
        className="fixed top-[10%] left-[-15%] w-[280px] h-[280px] rounded-full blur-[80px] pointer-events-none z-0 animate-float-slow"
        style={{ background: 'radial-gradient(circle, rgba(110,193,228,0.2) 0%, transparent 70%)', willChange: 'transform' }}
      />
      <div
        className="fixed bottom-[20%] right-[-10%] w-[240px] h-[240px] rounded-full blur-[60px] pointer-events-none z-0 animate-float"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)', animationDelay: '2s', willChange: 'transform' }}
      />

      <Header />
      <main className="flex-1 overflow-y-auto no-scrollbar pb-28 relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
