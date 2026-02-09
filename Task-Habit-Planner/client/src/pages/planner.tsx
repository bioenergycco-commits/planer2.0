import Sidebar from "@/components/layout/sidebar";
import { useApp } from "@/lib/data";
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, addMonths } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function PlannerPage() {
  const { tasks, updateTask } = useApp();
  const [view, setView] = useState<'week' | 'month'>('week');
  
  // Week View State
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Month View State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const monthDays = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: endOfWeek(monthEnd, { weekStartsOn: 1 }) });

  // Navigation Handlers
  const next = () => view === 'week' ? setCurrentWeekStart(addDays(currentWeekStart, 7)) : setCurrentMonth(addMonths(currentMonth, 1));
  const prev = () => view === 'week' ? setCurrentWeekStart(addDays(currentWeekStart, -7)) : setCurrentMonth(subMonths(currentMonth, 1));

  // Drag End Handler
  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    // destination.droppableId contains the ISO date string of the day dropped onto
    const newDate = destination.droppableId;
    
    updateTask(draggableId, { dueDate: newDate });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans pb-24 md:pb-0">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-3 md:p-10 max-w-[1600px] mx-auto w-full h-auto md:h-screen flex flex-col">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-1">Планер</h1>
            <p className="text-muted-foreground capitalize">
              {view === 'week' 
                ? `${format(currentWeekStart, 'd MMM', { locale: ru })} - ${format(addDays(currentWeekStart, 6), 'd MMM', { locale: ru })}`
                : format(currentMonth, 'LLLL yyyy', { locale: ru })
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-1 rounded-lg flex items-center">
              <Button 
                variant={view === 'week' ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setView('week')}
                className="h-8 px-3 rounded-md"
              >
                <List className="w-4 h-4 mr-2" /> Неделя
              </Button>
              <Button 
                variant={view === 'month' ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setView('month')}
                className="h-8 px-3 rounded-md"
              >
                <LayoutGrid className="w-4 h-4 mr-2" /> Месяц
              </Button>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border shadow-sm">
              <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          {view === 'week' ? (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 flex-1 overflow-auto pb-4">
              {weekDays.map((day, i) => {
                const dateKey = day.toISOString();
                const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), day));
                const isTodayDate = isSameDay(new Date(), day);

                return (
                  <Droppable key={dateKey} droppableId={dateKey}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex flex-col h-auto md:h-full min-h-[120px] md:min-h-[500px] rounded-2xl border p-3 transition-colors",
                          isTodayDate ? "bg-primary/5 border-primary/20" : "bg-white border-border/50",
                          snapshot.isDraggingOver && "bg-primary/10 border-primary/40 ring-2 ring-primary/20"
                        )}
                      >
                        <div className="text-center mb-4 pb-4 border-b border-border/40">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 capitalize">
                            {format(day, 'EEE', { locale: ru })}
                          </p>
                          <p className={cn(
                            "text-xl font-heading font-bold w-8 h-8 rounded-full flex items-center justify-center mx-auto",
                            isTodayDate ? "bg-primary text-white shadow-md shadow-primary/30" : "text-foreground"
                          )}>
                            {format(day, 'd')}
                          </p>
                        </div>

                        <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                          {dayTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{ ...provided.draggableProps.style }}
                                  className={cn(
                                    "p-3 rounded-xl border text-sm group hover:shadow-md transition-all duration-200 cursor-pointer bg-white relative overflow-hidden",
                                    task.status === 'done' ? "opacity-50 line-through bg-slate-50" : "border-border/60",
                                    snapshot.isDragging && "shadow-xl rotate-2 scale-105 z-50 ring-2 ring-primary"
                                  )}
                                >
                                   {task.color && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: task.color }} />}
                                  <p className="font-medium truncate mb-1 pl-2">{task.title}</p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pl-2">
                                    <span>{task.category}</span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-7 grid-rows-[auto_1fr] h-full gap-px bg-slate-200 border rounded-2xl overflow-hidden shadow-sm">
               {/* Weekday Headers */}
               {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => (
                  <div key={i} className="bg-slate-50 p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {d}
                  </div>
               ))}
               
               {/* Month Grid */}
               {monthDays.map((day, i) => {
                  const dateKey = day.toISOString();
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isTodayDate = isSameDay(new Date(), day);
                  const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), day));

                  return (
                    <Droppable key={dateKey} droppableId={dateKey}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "bg-white p-2 min-h-[100px] flex flex-col gap-1 transition-colors",
                            !isCurrentMonth && "bg-slate-50/30 text-muted-foreground/50",
                            isTodayDate && "bg-primary/5 ring-1 ring-inset ring-primary/20",
                            snapshot.isDraggingOver && "bg-primary/10 ring-2 ring-inset ring-primary/40"
                          )}
                        >
                          <span className={cn(
                            "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ml-auto mb-1",
                            isTodayDate ? "bg-primary text-white" : "text-muted-foreground"
                          )}>
                            {format(day, 'd')}
                          </span>
                          
                          <div className="space-y-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                            {dayTasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{ ...provided.draggableProps.style }}
                                    className={cn(
                                       "text-[10px] truncate px-1.5 py-0.5 rounded border border-transparent select-none",
                                       task.status === 'done' ? "line-through opacity-50 bg-slate-100" : "bg-white border-slate-100 shadow-sm",
                                       snapshot.isDragging && "shadow-lg z-50 ring-1 ring-primary"
                                     )}
                                     // We can't use style prop for borderLeftColor here because draggableProps.style overwrites it. 
                                     // Instead we use an inner element or just keep it simple for month view dnd
                                  >
                                    <div className="flex items-center gap-1">
                                      {task.color && <div className="w-1 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.color }} />}
                                      <span className="truncate">{task.title}</span>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  );
               })}
            </div>
          )}
        </DragDropContext>
      </main>
    </div>
  );
}

// Helper to get end of week consistent with start of week
import { endOfWeek } from "date-fns";
