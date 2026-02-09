import Sidebar from "@/components/layout/sidebar";
import { useApp } from "@/lib/data";
import { HabitCard } from "@/components/habits/habit-card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Card } from "@/components/ui/card";

export default function HabitsPage() {
  const { habits, addHabit } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    addHabit({
      title: data.title,
      color: data.color || '#6366f1',
      goal: 7
    });
    setIsOpen(false);
    reset();
  };

  // Mock data for charts
  const completionData = habits.map(h => ({
    name: h.title,
    completion: Math.round((h.completedDates.length / 14) * 100), // simplistic last 2 weeks calc
    color: h.color
  }));

  const totalCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-10 max-w-6xl mx-auto w-full">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-1">Трекер привычек</h1>
            <p className="text-muted-foreground">Создавайте лучшие рутины день за днем</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-secondary hover:bg-secondary/90 text-white">
                <Plus className="w-4 h-4 mr-2" /> Новая привычка
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать привычку</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input {...register("title")} placeholder="Например: Медитация" required />
                </div>
                <div className="space-y-2">
                  <Label>Цвет</Label>
                  <div className="flex gap-2">
                    {['#6366f1', '#ec4899', '#10b981', '#f59e0b'].map(color => (
                      <div key={color} className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform" 
                           style={{ backgroundColor: color }}
                           onClick={() => reset({ color })}
                      />
                    ))}
                  </div>
                  <Input {...register("color")} type="hidden" defaultValue="#6366f1" />
                </div>
                <DialogFooter>
                  <Button type="submit">Начать трекинг</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
           <Card className="p-6 border-border/50 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Общий прогресс</p>
                <h3 className="text-3xl font-bold font-heading">{totalCompletions}</h3>
                <p className="text-xs text-muted-foreground">выполнений всего</p>
              </div>
              <div className="mt-4 h-[60px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData}>
                    <Bar dataKey="completion" radius={[4, 4, 0, 0]}>
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.5} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </Card>

           <Card className="p-6 border-border/50 shadow-sm col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Эффективность по привычкам</p>
                  <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Аналитика
                  </h3>
                </div>
              </div>
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData} layout="vertical" margin={{ left: 40 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="completion" barSize={20} radius={[0, 4, 4, 0]}>
                       {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </Card>
        </div>

        <h2 className="text-xl font-heading font-semibold mb-6">Ваши привычки</h2>
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {habits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      </main>
    </div>
  );
}
