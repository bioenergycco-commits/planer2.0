import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, Calendar, Sparkles, Target, Zap, BarChart2, Cloud, Palette, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import MobileNav from "./mobile-nav";
import { useTheme } from "@/lib/theme-context";

export default function Sidebar() {
  const [location] = useLocation();
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navItems = [
    { icon: LayoutDashboard, label: "Дашборд", href: "/" },
    { icon: Layout, label: "Обзор", href: "/overview" },
    { icon: Zap, label: "Фокус", href: "/focus" },
    { icon: BarChart2, label: "Аналитика", href: "/analysis" },
    { icon: CheckSquare, label: "Задачи", href: "/tasks" },
    { icon: Sparkles, label: "Привычки", href: "/habits" },
    { icon: Target, label: "Цели", href: "/goals" },
    { icon: Calendar, label: "Планер", href: "/planner" },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'pro' ? 'calm' : 'pro');
  };

  return (
    <>
      <aside className="w-64 border-r bg-white/80 backdrop-blur-xl h-screen fixed left-0 top-0 hidden md:flex flex-col p-4 z-50 shadow-[1px_0_20px_rgba(0,0,0,0.02)] transition-colors duration-500">
        <div className="flex items-center gap-3 mb-8 px-2 py-2">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 transition-all duration-500">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl tracking-tight leading-none text-foreground transition-colors duration-500">Flow</h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">{theme === 'pro' ? 'Pro' : 'Calm'}</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                  isActive 
                    ? "bg-secondary text-primary" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}>
                  <item.icon className={cn("w-4.5 h-4.5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-border space-y-2">
          
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground group"
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-secondary/80 transition-colors">
               <Palette className="w-4 h-4 text-foreground" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-foreground">Стиль</p>
              <p className="text-[10px] text-muted-foreground">{theme === 'pro' ? 'Активный' : 'Спокойный'}</p>
            </div>
          </button>

          <Dialog open={isSyncOpen} onOpenChange={setIsSyncOpen}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground group">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-secondary/80 transition-colors">
                   <Cloud className="w-4 h-4 text-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground">Облако</p>
                  <p className="text-[10px] text-muted-foreground">Выкл</p>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent>
               <DialogHeader>
                 <DialogTitle>Синхронизация данных</DialogTitle>
                 <DialogDescription>
                   Войдите в аккаунт, чтобы синхронизировать задачи и привычки между устройствами.
                 </DialogDescription>
               </DialogHeader>
               <div className="py-6 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                    <Cloud className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">Для активации облачного хранения требуется обновить тариф до Pro.</p>
                  </div>
                  <Button className="w-full" onClick={() => setIsSyncOpen(false)}>Понятно</Button>
               </div>
            </DialogContent>
          </Dialog>

        </div>
      </aside>
      
      <MobileNav />
    </>
  );
}
