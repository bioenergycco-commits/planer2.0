import Sidebar from "@/components/layout/sidebar";
import { useApp } from "@/lib/data";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid, PieChart, Pie } from "recharts";
import { TrendingUp, CheckCircle2, Zap, Target, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalysisPage() {
  const { tasks, habits, goals } = useApp();

  // Mock data calculations (in a real app, calculate from history)
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const highPriorityCompleted = tasks.filter(t => t.status === 'done' && t.priority === 'high').length;
  
  // Activity Data (Mock for "Analysis" feel)
  const activityData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      name: format(date, 'EEE', { locale: ru }),
      tasks: Math.floor(Math.random() * 8) + 2, // Mock random data
      focus: Math.floor(Math.random() * 5),
    };
  });

  const pieData = [
    { name: 'Работа', value: tasks.filter(t => t.category === 'Работа').length, color: '#6366f1' },
    { name: 'Личное', value: tasks.filter(t => t.category === 'Личное').length, color: '#10b981' },
    { name: 'Здоровье', value: tasks.filter(t => t.category === 'Здоровье').length, color: '#ec4899' },
  ].filter(d => d.value > 0);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Аналитика</h1>
          <p className="text-muted-foreground">Обзор продуктивности за {format(new Date(), 'MMMM', { locale: ru })}</p>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
           <KpiCard 
             title="Завершено задач" 
             value={completedTasks.toString()} 
             subtitle="Всего задач" 
             trend="+12%" 
             icon={CheckCircle2}
             color="text-primary"
           />
           <KpiCard 
             title="Часы фокуса" 
             value="24ч" 
             subtitle="За эту неделю" 
             trend="+5%" 
             icon={Zap}
             color="text-amber-500"
           />
           <KpiCard 
             title="Стрик привычек" 
             value="5 дней" 
             subtitle="Лучшая серия" 
             trend="stable" 
             icon={Activity}
             color="text-emerald-500"
           />
           <KpiCard 
             title="Прогресс целей" 
             value={`${Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / (goals.length || 1))}%`} 
             subtitle="Средний прогресс" 
             trend="+8%" 
             icon={Target}
             color="text-rose-500"
           />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
           {/* Activity Chart */}
           <Card className="lg:col-span-2 p-6 card-premium border-none shadow-sm">
             <div className="flex items-center justify-between mb-6">
               <div>
                 <h3 className="font-semibold text-lg">Активность за неделю</h3>
                 <p className="text-sm text-muted-foreground">Выполненные задачи vs Фокус</p>
               </div>
             </div>
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                   />
                   <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                   <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                   <Area type="monotone" dataKey="focus" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </Card>

           {/* Category Distribution */}
           <Card className="p-6 card-premium border-none shadow-sm flex flex-col">
             <h3 className="font-semibold text-lg mb-2">Распределение</h3>
             <p className="text-sm text-muted-foreground mb-6">По категориям задач</p>
             <div className="flex-1 min-h-[200px] relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                   <span className="text-3xl font-bold text-slate-800">{totalTasks}</span>
                   <p className="text-xs text-muted-foreground uppercase">Всего</p>
                 </div>
               </div>
             </div>
             <div className="mt-4 space-y-2">
               {pieData.map(d => (
                 <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-medium">{d.value}</span>
                 </div>
               ))}
             </div>
           </Card>
        </div>

        {/* Insights Section */}
        <h2 className="text-xl font-heading font-bold mb-4">Инсайты недели</h2>
        <div className="grid md:grid-cols-3 gap-4">
           <InsightCard 
             type="positive"
             title="Высокая продуктивность"
             description="Вы завершили на 15% больше задач, чем на прошлой неделе. Так держать!"
           />
           <InsightCard 
             type="neutral"
             title="Баланс работы"
             description="60% ваших задач связаны с работой. Не забывайте про отдых и здоровье."
           />
           <InsightCard 
             type="tip"
             title="Совет"
             description="Попробуйте перенести сложные задачи на утро для большей эффективности."
           />
        </div>

      </main>
    </div>
  );
}

function KpiCard({ title, value, subtitle, trend, icon: Icon, color }: any) {
  const isPositive = trend.includes('+');
  return (
    <Card className="p-5 card-premium border-none shadow-sm flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <div className={cn("p-2 rounded-lg bg-slate-50", color)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== 'stable' && (
          <div className={cn("flex items-center text-xs font-medium px-2 py-0.5 rounded-full", isPositive ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50")}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <h4 className="text-2xl font-bold font-heading text-slate-800">{value}</h4>
        <p className="text-xs text-muted-foreground font-medium">{title}</p>
      </div>
    </Card>
  );
}

function InsightCard({ type, title, description }: any) {
  const styles: Record<string, string> = {
    positive: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 text-green-800",
    neutral: "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-100 text-slate-800",
    tip: "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 text-indigo-800",
  };
  
  return (
    <div className={cn("p-5 rounded-xl border", styles[type])}>
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        {type === 'positive' && <CheckCircle2 className="w-4 h-4" />}
        {type === 'tip' && <Zap className="w-4 h-4" />}
        {title}
      </h4>
      <p className="text-sm opacity-90 leading-relaxed">{description}</p>
    </div>
  );
}
