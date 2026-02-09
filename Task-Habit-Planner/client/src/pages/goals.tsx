import Sidebar from "@/components/layout/sidebar";
import { useApp } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Plus, Target, Calendar as CalendarIcon, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function GoalsPage() {
  const { goals, addGoal, deleteGoal, tasks, habits } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    addGoal({
      title: data.title,
      description: data.description,
      color: data.color || '#6366f1',
      deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined
    });
    setIsOpen(false);
    reset();
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-10 max-w-6xl mx-auto w-full">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-1">Мои Цели</h1>
            <p className="text-muted-foreground">Долгосрочное планирование и видение</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Добавить цель
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новая цель</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input {...register("title")} placeholder="Например: Выучить испанский" required />
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Input {...register("description")} placeholder="Краткое описание" />
                </div>
                <div className="space-y-2">
                   <Label>Дедлайн</Label>
                   <Input {...register("deadline")} type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Цвет</Label>
                  <div className="flex gap-2">
                    {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'].map(color => (
                      <div key={color} className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform" 
                           style={{ backgroundColor: color }}
                           onClick={() => reset({ color })}
                      />
                    ))}
                  </div>
                  <Input {...register("color")} type="hidden" defaultValue="#6366f1" />
                </div>
                <DialogFooter>
                  <Button type="submit">Создать цель</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const linkedTasks = tasks.filter(t => t.goalId === goal.id);
            const linkedHabits = habits.filter(h => h.goalId === goal.id);
            const totalItems = linkedTasks.length + linkedHabits.length;
            
            // Calculate pseudo-progress if dynamic
            const completedTasks = linkedTasks.filter(t => t.status === 'done').length;
            const progress = totalItems > 0 ? Math.round((completedTasks / totalItems) * 100) : goal.progress;

            return (
              <div key={goal.id} className="bg-white rounded-2xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: goal.color }} />
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                     <h3 className="text-xl font-bold font-heading mb-1">{goal.title}</h3>
                     <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteGoal(goal.id)} className="text-destructive">Удалить</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-6">
                   <div className="flex justify-between text-xs font-medium">
                     <span>Прогресс</span>
                     <span>{progress}%</span>
                   </div>
                   <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                   {goal.deadline && (
                     <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                       <CalendarIcon className="w-3 h-3" />
                       {format(new Date(goal.deadline), 'd MMM yyyy', { locale: ru })}
                     </div>
                   )}
                   <div className="flex items-center gap-1">
                     <Target className="w-3 h-3" />
                     {linkedTasks.length} задач
                   </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Связанные задачи</h4>
                  <div className="space-y-2">
                     {linkedTasks.slice(0, 3).map(task => (
                       <div key={task.id} className="flex items-center gap-2 text-sm">
                          <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", task.status === 'done' ? "bg-green-100 border-green-500" : "border-slate-300")}>
                            {task.status === 'done' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                          </div>
                          <span className={cn(task.status === 'done' && "line-through text-muted-foreground")}>{task.title}</span>
                       </div>
                     ))}
                     {linkedTasks.length === 0 && <p className="text-xs text-muted-foreground italic">Нет связанных задач</p>}
                     
                     <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-7 border-dashed">
                       <Plus className="w-3 h-3 mr-1" /> Добавить задачу к цели
                     </Button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
