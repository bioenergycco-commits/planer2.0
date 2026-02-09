import { useApp, Habit } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Check, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSameDay, subDays, format, isToday as isTodayFns } from "date-fns";
import { ru } from "date-fns/locale";

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const { toggleHabitCompletion } = useApp();
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

  // Calculate efficiency mock
  const efficiency = Math.round((habit.completedDates.length / Math.max(1, habit.completedDates.length + 2)) * 100);

  return (
    <div className="bg-white rounded-2xl border border-border/60 p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-slate-200"
            style={{ backgroundColor: habit.color }}
          >
            {habit.title[0]}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">{habit.title}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span className="font-medium text-slate-600">{habit.streak} дней</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                <span>{habit.goal} / нед</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-0.5">
            <span className="text-2xl font-bold font-heading text-slate-800">{efficiency}</span>
            <span className="text-xs font-bold text-slate-400">%</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
        {last7Days.map((date, i) => {
          const isCompleted = habit.completedDates.some(d => isSameDay(new Date(d), date));
          const isTodayDate = isTodayFns(date);

          return (
            <div key={i} className="flex flex-col items-center gap-2 group/day cursor-pointer" onClick={() => toggleHabitCompletion(habit.id, date.toISOString())}>
              <span className={cn(
                "text-[10px] font-medium uppercase",
                isTodayDate ? "text-primary" : "text-slate-400"
              )}>
                {format(date, 'EEEEE', { locale: ru })}
              </span>
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                  isCompleted 
                    ? "text-white scale-100 shadow-sm" 
                    : "bg-white border border-slate-200 text-transparent hover:border-primary/30",
                  isTodayDate && !isCompleted && "ring-2 ring-primary/20 ring-offset-1 border-primary/40"
                )}
                style={{ backgroundColor: isCompleted ? habit.color : undefined }}
              >
                <Check className={cn("w-4 h-4 stroke-[3px] transition-transform", isCompleted ? "scale-100" : "scale-50")} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
