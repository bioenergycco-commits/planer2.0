import Sidebar from "@/components/layout/sidebar";
import { useApp } from "@/lib/data";
import { TaskCard } from "@/components/tasks/task-card";
import { HabitCard } from "@/components/habits/habit-card";
import { format, isToday, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis } from "recharts";
import { CheckCircle2, Zap, Target, ArrowUpRight, TrendingUp } from "lucide-react";

export default function ExtendedDashboard() {
  const { tasks, habits, goals } = useApp();
  const { theme } = useTheme();
  
  const todayTasks = tasks.filter(t => isToday(new Date(t.dueDate)));
  const pendingTasks = todayTasks.filter(t => t.status !== 'done').length;
  const completedTasksCount = tasks.filter(t => t.status === 'done').length;
  
  const totalGoals = goals.length;
  const avgGoalProgress = totalGoals > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals) 
    : 0;

  // Mock activity data for mini-chart
  const activityData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      name: format(date, 'EEE', { locale: ru }),
      value: Math.floor(Math.random() * 10) + 2,
    };
  });

  const isCalm = theme === 'calm';

  return (
    <div className={cn(
      "flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 pb-20 md:pb-0 transition-colors duration-500",
      isCalm ? "bg-[#f8f7f4]" : ""
    )}>
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-10 max-w-[1600px] mx-auto w-full">
        <header className="mb-8">
          <h1 className={cn(
            "font-bold tracking-tight text-foreground mb-2",
            isCalm ? "text-3xl font-serif text-slate-800" : "text-3xl font-heading"
          )}>
            Обзор
          </h1>
          <p className="text-muted-foreground">Полная картина вашей продуктивности</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={cn(
            "p-5 rounded-2xl border flex flex-col justify-between h-32",
            isCalm ? "bg-white border-slate-100 shadow-sm" : "bg-card border-border/50 shadow-sm"
          )}>
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Задачи сегодня</span>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-3xl font-bold">{pendingTasks}</span>
              <span className="text-sm text-muted-foreground ml-2">осталось</span>
            </div>
          </div>

          <div className={cn(
            "p-5 rounded-2xl border flex flex-col justify-between h-32",
            isCalm ? "bg-white border-slate-100 shadow-sm" : "bg-card border-border/50 shadow-sm"
          )}>
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Прогресс целей</span>
              <Target className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <span className="text-3xl font-bold">{avgGoalProgress}%</span>
              <span className="text-sm text-muted-foreground ml-2">общий</span>
            </div>
          </div>

          <div className={cn(
            "p-5 rounded-2xl border flex flex-col justify-between h-32",
            isCalm ? "bg-white border-slate-100 shadow-sm" : "bg-card border-border/50 shadow-sm"
          )}>
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Привычки</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">5</span>
              <span className="text-sm text-muted-foreground mb-1">дней стрик</span>
            </div>
          </div>

          <div className={cn(
            "p-5 rounded-2xl border flex flex-col justify-between h-32 overflow-hidden relative",
            isCalm ? "bg-white border-slate-100 shadow-sm" : "bg-card border-border/50 shadow-sm"
          )}>
            <div className="flex justify-between items-start z-10 relative">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Активность</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 z-0 opacity-20">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={activityData}>
                   <Bar dataKey="value" fill="currentColor" className="text-primary" radius={[2, 2, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="z-10 relative">
               <span className="text-3xl font-bold">{completedTasksCount}</span>
               <span className="text-sm text-muted-foreground ml-2">всего</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Column: Habits & Goals */}
          <div className="lg:col-span-2 space-y-8">
            
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                Цели на квартал
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {goals.map(goal => (
                  <div key={goal.id} className={cn(
                    "p-5 rounded-2xl border relative overflow-hidden group hover:shadow-md transition-all",
                    isCalm ? "bg-white border-slate-100" : "bg-card border-border/50"
                  )}>
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: goal.color }} />
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100">{goal.progress}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{goal.description}</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${goal.progress}%`, backgroundColor: goal.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                Трекер привычек
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {habits.map(habit => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            </section>

          </div>

          {/* Side Column: Tasks List */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Все задачи на сегодня</h2>
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-medium">{todayTasks.length}</span>
            </div>

            <div className="space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed">
                  <p>Всё выполнено! 🎉</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
