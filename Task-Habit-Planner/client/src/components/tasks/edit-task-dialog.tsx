import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp, Task } from "@/lib/data";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const { updateTask } = useApp();
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      color: task.color
    }
  });

  // Reset form when task changes
  useEffect(() => {
    reset({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      color: task.color
    });
  }, [task, reset]);

  const onSubmit = (data: any) => {
    updateTask(task.id, {
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : task.dueDate,
      color: data.category === 'Работа' ? '#6366f1' : data.category === 'Личное' ? '#10b981' : '#ec4899' // Keep logic simple for now
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать задачу</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input {...register("title")} required />
          </div>
          
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea {...register("description")} placeholder="Детали задачи..." className="resize-none h-20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select onValueChange={(v) => setValue("category", v)} defaultValue={task.category}>
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
              <Select onValueChange={(v) => setValue("priority", v as any)} defaultValue={task.priority}>
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

          <div className="space-y-2">
             <Label>Срок выполнения</Label>
             <Input type="date" {...register("dueDate")} required />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
