import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, Calendar, Sparkles, Target, Zap, BarChart2, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Дашборд", href: "/" },
    { icon: Layout, label: "Обзор", href: "/overview" },
    { icon: CheckSquare, label: "Задачи", href: "/tasks" },
    { icon: Calendar, label: "Планер", href: "/planner" },
    { icon: Sparkles, label: "Привычки", href: "/habits" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-border/50 z-50 md:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex justify-around items-center p-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-full active:scale-95 touch-target",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}>
                <div className={cn(
                  "w-10 h-8 rounded-xl flex items-center justify-center transition-all",
                  isActive ? "bg-primary/10" : "bg-transparent"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
