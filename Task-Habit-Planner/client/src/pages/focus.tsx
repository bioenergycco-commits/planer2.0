import Sidebar from "@/components/layout/sidebar";
import { useApp } from "@/lib/data";
import { TaskCard } from "@/components/tasks/task-card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function FocusPage() {
  const { tasks } = useApp();
  const [fullscreen, setFullscreen] = useState(false);
  
  // Tasks that are either marked as focus OR are high priority today/overdue
  // For this specific request, we'll filter by a hypothetical isFocus flag we added or just high priority for now if not set
  const focusTasks = tasks.filter(t => t.status !== 'done' && (t.isFocus || t.priority === 'high'));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  return (
    <div className={cn(
      "flex min-h-screen bg-background text-foreground font-sans transition-all duration-500",
      fullscreen && "items-center justify-center bg-zinc-900 text-zinc-100"
    )}>
      {!fullscreen && <Sidebar />}
      
      <main className={cn(
        "flex-1 p-6 md:p-10 transition-all duration-500",
        !fullscreen ? "md:ml-64 max-w-4xl mx-auto w-full" : "w-full max-w-2xl"
      )}>
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className={cn("font-heading font-bold mb-2", fullscreen ? "text-4xl text-white" : "text-3xl")}>
              Режим Фокуса
            </h1>
            <p className={cn("text-lg", fullscreen ? "text-zinc-400" : "text-muted-foreground")}>
              {format(new Date(), 'd MMMM, EEEE', { locale: ru })}
            </p>
          </div>
          
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className={cn(fullscreen && "text-white hover:bg-zinc-800")}>
            {fullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </Button>
        </header>

        <div className="space-y-6">
          {focusTasks.length > 0 ? (
            focusTasks.map(task => (
              <div key={task.id} className={cn(
                "group p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4",
                fullscreen 
                  ? "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600" 
                  : "bg-white border-border/50 shadow-sm hover:shadow-md"
              )}>
                <div className={cn(
                  "w-2 h-16 rounded-full",
                  task.priority === 'high' ? "bg-rose-500" : "bg-indigo-500"
                )} />
                
                <div className="flex-1">
                  <h3 className={cn("text-xl font-medium mb-1", fullscreen ? "text-zinc-100" : "text-foreground")}>
                    {task.title}
                  </h3>
                  <div className={cn("flex items-center gap-2 text-sm", fullscreen ? "text-zinc-400" : "text-muted-foreground")}>
                    <span className="uppercase tracking-wider text-xs font-bold">{task.category}</span>
                    <span>•</span>
                    <span>{task.priority === 'high' ? 'Высокий приоритет' : 'Обычный'}</span>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <TaskCard task={task} /> {/* Reusing card logic for actions, but hidden visually mostly */}
                </div>
                
                {/* Custom giant checkbox for focus mode */}
                <div className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-primary/20 hover:border-primary transition-all">
                   <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-20">
               <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 className="w-10 h-10 text-primary" />
               </div>
               <h2 className={cn("text-2xl font-bold mb-2", fullscreen && "text-white")}>Отличная работа!</h2>
               <p className={cn(fullscreen ? "text-zinc-400" : "text-muted-foreground")}>Все важные задачи выполнены.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
