import Sidebar from "@/components/layout/sidebar";
import { useApp, Task, Status, Priority } from "@/lib/data";
import { TaskCard } from "@/components/tasks/task-card";
import { format, isToday, isThisWeek, isFuture } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function TasksPage() {
  const { tasks, addTask, updateTask, reorderTasks } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    addTask({
      title: data.title,
      category: data.category,
      priority: data.priority,
      dueDate: new Date().toISOString(),
      status: 'todo',
      color: data.category === 'Работа' ? '#6366f1' : data.category === 'Личное' ? '#10b981' : '#ec4899'
    });
    setIsOpen(false);
    reset();
  };

  // Group tasks for display logic
  const todayTasks = tasks.filter(t => isToday(new Date(t.dueDate)));
  const weekTasks = tasks.filter(t => isThisWeek(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)));
  const futureTasks = tasks.filter(t => isFuture(new Date(t.dueDate)) && !isThisWeek(new Date(t.dueDate)));

  // DND Handlers
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    // Moving between lists logic or reordering within list
    // For simplicity in this demo, we'll just handle reordering visually or moving due dates if dropped in other columns
    // But since `tasks` is a single flat list in context, dragging between "derived" lists (today/week) 
    // actually implies changing the dueDate.
    
    // To implement "drag to change date", we need to know which container maps to which date range.
    const destId = destination.droppableId;
    const taskId = result.draggableId;
    
    let newDate = new Date(); // default today
    if (destId === 'week') {
      newDate.setDate(newDate.getDate() + 1); // move to tomorrow/this week
    } else if (destId === 'future') {
      newDate.setDate(newDate.getDate() + 8); // move to next week
    }
    
    // Only update if changed columns
    if (source.droppableId !== destination.droppableId) {
      updateTask(taskId, { dueDate: newDate.toISOString() });
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans pb-20 md:pb-0">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-10 max-w-[1600px] mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-1">Мои задачи</h1>
            <p className="text-muted-foreground">Управляйте приоритетами</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Добавить задачу
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить задачу</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input {...register("title")} placeholder="Например: Сдать отчет" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Категория</Label>
                    <Select onValueChange={(v) => reset({ ...register("category"), category: v })}>
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                  <Button type="submit">Создать</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:h-[calc(100vh-200px)]">
            
            {/* Today Column */}
            <div className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Сегодня</h3>
                <span className="text-xs bg-white px-2 py-1 rounded-full border text-slate-500 font-medium">{todayTasks.length}</span>
              </div>
              <Droppable droppableId="today">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 space-y-3 transition-colors rounded-xl p-1 ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                  >
                    {todayTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <TaskCard task={task} isDragging={snapshot.isDragging} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* This Week Column */}
            <div className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">На неделе</h3>
                <span className="text-xs bg-white px-2 py-1 rounded-full border text-slate-500 font-medium">{weekTasks.length}</span>
              </div>
              <Droppable droppableId="week">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 space-y-3 transition-colors rounded-xl p-1 ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                  >
                    {weekTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <TaskCard task={task} isDragging={snapshot.isDragging} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Future Column */}
            <div className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Будущее</h3>
                <span className="text-xs bg-white px-2 py-1 rounded-full border text-slate-500 font-medium">{futureTasks.length}</span>
              </div>
              <Droppable droppableId="future">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 space-y-3 transition-colors rounded-xl p-1 ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                  >
                    {futureTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <TaskCard task={task} isDragging={snapshot.isDragging} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

          </div>
        </DragDropContext>
      </main>
    </div>
  );
}
