import Sidebar from "@/components/layout/sidebar";
import { useApp } from "@/lib/data";
import { TaskCard } from "@/components/tasks/task-card";
import { HabitCard } from "@/components/habits/habit-card";
import { format, isToday, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Smile, Star, Coffee, CloudRain, Sun, ChevronRight, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Dashboard() {
  const { tasks, habits, addTask, exportData, importData, saveDailyLog, getDailyLog } = useApp();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  
  // Daily Review Form
  const { register: registerReview, handleSubmit: handleSubmitReview, reset: resetReview } = useForm();

  const todayTasks = tasks.filter(t => isToday(new Date(t.dueDate)) && t.status !== 'done');
  const focusTasks = todayTasks.filter(t => t.isFocus || t.priority === 'high').slice(0, 3);
  
  const todayLog = getDailyLog(new Date().toISOString().split('T')[0]);

  const onSubmitTask = (data: any) => {
    addTask({
      title: data.title,
      category: data.category,
      priority: data.priority,
      dueDate: new Date().toISOString(),
      status: 'todo',
      color: data.category === 'Работа' ? '#6366f1' : data.category === 'Личное' ? '#10b981' : '#ec4899',
      isFocus: data.isFocus === 'yes'
    });
    setIsOpen(false);
    reset();
  };

  const onSubmitReview = (data: any) => {
    saveDailyLog({
      date: new Date().toISOString().split('T')[0],
      rating: parseInt(data.rating),
      notes: data.notes
    });
    setIsReviewOpen(false);
    resetReview();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          importData(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const isCalm = theme === 'calm';

  return (
    <div className={cn(
      "flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 pb-24 md:pb-0 transition-colors duration-500",
      isCalm ? "bg-[#f8f7f4]" : ""
    )}>
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-10 max-w-5xl mx-auto w-full">
        {/* Header */}
        <header className="mb-8 md:mb-12 relative pt-2">
          {!isCalm && <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />}
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center justify-between md:block">
              <div>
                <p className="text-muted-foreground font-medium mb-1 capitalize text-sm md:text-lg">
                  {format(new Date(), 'EEEE, d MMMM', { locale: ru })}
                </p>
                <h1 className={cn(
                  "font-bold tracking-tight text-foreground transition-all duration-500 leading-tight",
                  isCalm ? "text-3xl md:text-4xl font-serif text-slate-800" : "text-3xl md:text-5xl font-heading"
                )}>
                  {isCalm ? "Главное на сегодня" : "Доброе утро"}
                </h1>
              </div>
              
              {/* Mobile Backup/Import Controls - Hidden on Desktop */}
              <div className="flex items-center gap-1 md:hidden">
                 <Button variant="ghost" size="icon" onClick={exportData} title="Скачать бэкап" className="h-10 w-10">
                    <Download className="w-5 h-5 text-muted-foreground" />
                 </Button>
              </div>
            </div>
            
            <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-3">
               {/* Desktop Backup/Import Controls */}
              <div className="hidden md:flex items-center gap-1 mr-4">
                 <Button variant="ghost" size="icon" onClick={exportData} title="Скачать бэкап">
                    <Download className="w-4 h-4 text-muted-foreground" />
                 </Button>
                 <label className="cursor-pointer inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-secondary/10">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                 </label>
              </div>

              <div className="grid grid-cols-2 md:flex gap-3">
                {/* Daily Review Button */}
                <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className={cn(
                      "rounded-full transition-all h-12 md:h-10",
                      todayLog ? "bg-green-50 border-green-200 text-green-700" : isCalm ? "bg-white border-border shadow-sm" : ""
                    )}>
                      {todayLog ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Smile className="w-4 h-4 mr-2" />}
                      {todayLog ? "Оценено" : "Оценка дня"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Как прошел день?</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitReview(onSubmitReview)} className="space-y-4 py-4">
                       <div className="space-y-2">
                         <Label>Настроение (1-10)</Label>
                         <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl touch-none">
                            <CloudRain className="w-6 h-6 text-slate-400" />
                            <input 
                              type="range" 
                              min="1" 
                              max="10" 
                              className="w-full mx-4 accent-primary h-6"
                              {...registerReview("rating", { required: true })} 
                            />
                            <Sun className="w-6 h-6 text-orange-400" />
                         </div>
                       </div>
                       <div className="space-y-2">
                         <Label>Заметки / Инсайты</Label>
                         <Textarea 
                           placeholder="Сегодня я понял, что..." 
                           className="h-32 text-base"
                           {...registerReview("notes")} 
                         />
                       </div>
                       <DialogFooter>
                         <Button type="submit" size="lg" className="w-full">Сохранить</Button>
                       </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button className={cn(
                      "rounded-full shadow-lg transition-all h-12 md:h-10",
                      isCalm ? "bg-slate-800 text-white hover:bg-slate-700 shadow-slate-200" : "bg-primary hover:bg-primary/90 shadow-primary/20"
                    )}>
                      <Plus className="w-4 h-4 mr-2" />
                      Задача
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Новая задача</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmitTask)} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Название</Label>
                        <Input {...register("title")} placeholder="Например: Сдать отчет" required className="h-12 text-base" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Фокус задача?</Label>
                        <Select onValueChange={(v) => reset({ ...register("isFocus"), isFocus: v })}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Нет" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Да, это важно</SelectItem>
                            <SelectItem value="no">Нет, обычная задача</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Категория</Label>
                          <Select onValueChange={(v) => reset({ ...register("category"), category: v })}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Выбрать" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Работа">Работа</SelectItem>
                              <SelectItem value="Личное">Личное</SelectItem>
                              <SelectItem value="Здоровье">Здоровье</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Приоритет</Label>
                          <Select onValueChange={(v) => reset({ ...register("priority"), priority: v })}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Выбрать" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Низкий</SelectItem>
                              <SelectItem value="medium">Средний</SelectItem>
                              <SelectItem value="high">Высокий</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" size="lg" className="w-full mt-4">Создать</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Guiding Focus Section - The Core "Morning" Experience */}
        <section className="mb-8 md:mb-12">
           <div className="flex items-center gap-2 mb-4 text-muted-foreground">
             <Star className={cn("w-4 h-4", isCalm ? "fill-slate-300 stroke-slate-300" : "fill-primary/20 stroke-primary")} />
             <span className="text-sm font-medium tracking-wide uppercase">Фокус дня</span>
           </div>
           
           <div className="space-y-4">
             {focusTasks.length > 0 ? (
               focusTasks.map(task => (
                 <div key={task.id} className={cn(
                   "group relative p-5 md:p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4 active:scale-[0.99]",
                   isCalm 
                     ? "bg-white border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-slate-200" 
                     : "bg-white border-primary/10 shadow-sm hover:shadow-md hover:border-primary/20"
                 )}>
                   <div 
                     className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 touch-target",
                        isCalm ? "border-slate-300 hover:border-slate-500" : "border-primary/30 hover:border-primary hover:bg-primary/5"
                     )}
                     // In a real app, this would mark complete with a nice animation
                   >
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <h3 className={cn("text-lg md:text-xl font-medium truncate", isCalm ? "text-slate-800" : "text-foreground")}>{task.title}</h3>
                     {task.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>}
                   </div>

                   {/* Quick Actions (Swipe simulation) */}
                   <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-10 px-3">
                        Завтра
                      </Button>
                   </div>
                 </div>
               ))
             ) : (
               <div className={cn(
                 "p-8 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center",
                 isCalm ? "border-slate-200 bg-white/50" : "border-slate-200 bg-slate-50"
               )}>
                 <Coffee className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
                 <p className="text-muted-foreground">Фокус-задачи не выбраны</p>
                 <Button variant="link" onClick={() => setIsOpen(true)} className="text-primary h-12">Добавить главную задачу</Button>
               </div>
             )}
           </div>
        </section>

        {/* Other Tasks Summary */}
        <section>
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-semibold text-muted-foreground">Остальные задачи</h2>
             <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{todayTasks.length - focusTasks.length}</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {todayTasks.filter(t => !focusTasks.includes(t)).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
           </div>
        </section>

      </main>
    </div>
  );
}

import { CheckCircle2 } from "lucide-react";
