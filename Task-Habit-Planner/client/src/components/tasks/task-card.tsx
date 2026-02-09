import { useApp, Task, Status, Priority } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Calendar as CalendarIcon, MoreHorizontal, Edit2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isPast, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditTaskDialog } from "./edit-task-dialog";
import { useTheme } from "@/lib/theme-context";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const { updateTask, deleteTask } = useApp();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { theme } = useTheme();
  const isCalm = theme === 'calm';

  const priorityColors = {
    'low': isCalm ? 'text-slate-400 bg-slate-50' : 'text-slate-400 bg-slate-50',
    'medium': isCalm ? 'text-slate-600 bg-slate-100' : 'text-amber-600 bg-amber-50',
    'high': isCalm ? 'text-slate-800 bg-slate-200 font-medium' : 'text-rose-600 bg-rose-50',
  };

  const priorityLabels = {
    'low': 'Низкий',
    'medium': 'Средний',
    'high': 'Высокий',
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: Status = task.status === 'done' ? 'todo' : 'done';
    updateTask(task.id, { status: nextStatus });
  };

  const moveToTomorrow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tomorrow = addDays(new Date(), 1).toISOString();
    updateTask(task.id, { dueDate: tomorrow });
  };

  return (
    <>
      <div 
        onClick={() => setIsEditOpen(true)}
        className={cn(
          "group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer",
          isCalm 
            ? "bg-white border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md" 
            : "bg-white border-border/60 hover:shadow-md hover:border-border",
          task.status === 'done' && "opacity-60 bg-slate-50/50 grayscale",
          isDragging && "shadow-xl ring-2 ring-primary rotate-2 scale-105 z-50 bg-white"
        )}
      >
        <div className="flex items-start gap-3.5">
          <button 
            onClick={handleStatusClick}
            className={cn(
              "mt-0.5 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 flex-shrink-0 z-10",
              task.status === 'done' 
                ? "bg-primary border-primary scale-110" 
                : "border-slate-300 hover:border-primary hover:bg-primary/5"
            )}
          >
            {task.status === 'done' && <Check className="w-3 h-3 text-white stroke-[3px]" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1.5">
              <h3 className={cn(
                "font-medium text-sm truncate pr-2 transition-all leading-tight",
                isCalm ? "text-slate-800" : "text-slate-700",
                task.status === 'done' && "line-through text-slate-400"
              )}>
                {task.title}
              </h3>
              
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1">
                 {/* Quick Action: Tomorrow */}
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-6 w-6 text-slate-400 hover:text-primary hover:bg-primary/10"
                   onClick={moveToTomorrow}
                   title="Перенести на завтра"
                 >
                   <ArrowRight className="w-3.5 h-3.5" />
                 </Button>

                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-slate-400 hover:text-slate-600 focus:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                      <Edit2 className="w-4 h-4 mr-2" /> Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive focus:text-destructive">
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
              {isCalm ? (
                 // Calm mode: Less color, text only for category
                 <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{task.category}</span>
              ) : (
                <Badge variant="secondary" 
                  className="font-medium h-5 px-1.5 text-[10px] uppercase tracking-wider border-0"
                  style={{ backgroundColor: task.color ? `${task.color}15` : undefined, color: task.color }}
                >
                  {task.category}
                </Badge>
              )}
              
              {task.priority !== 'low' && (
                <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded-md", priorityColors[task.priority])}>
                  <span className="capitalize font-medium text-[10px]">{priorityLabels[task.priority]}</span>
                </div>
              )}

              <div className="flex items-center gap-1 ml-auto text-slate-400">
                <CalendarIcon className="w-3 h-3" />
                <span className={cn(
                  isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'done' && "text-rose-500 font-medium"
                )}>
                  {isToday(new Date(task.dueDate)) ? 'Сегодня' : 
                   isTomorrow(new Date(task.dueDate)) ? 'Завтра' : 
                   format(new Date(task.dueDate), 'd MMM', { locale: ru })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditTaskDialog 
        task={task} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />
    </>
  );
}
