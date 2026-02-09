import React, { createContext, useContext, useEffect, useState } from 'react';
import { addDays, format, isSameDay, startOfWeek, addWeeks, subDays } from 'date-fns';

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  status: Status;
  dueDate: string; // ISO date string
  description?: string;
  color?: string; // Hex color for category
  goalId?: string; // Link to a goal
  isFocus?: boolean; // Focus mode flag
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedDates: string[]; // ISO date strings
  color: string;
  goal: number; // days per week
  goalId?: string; // Link to a goal
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  color: string;
  deadline?: string;
  progress: number; // 0-100 (calculated or manual)
}

export interface DailyLog {
  date: string; // ISO date string (YYYY-MM-DD)
  rating: number; // 1-5 or 1-10
  notes: string;
}

interface AppContextType {
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  dailyLogs: DailyLog[];
  
  // Tasks
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  reorderTasks: (newTasks: Task[]) => void;
  deleteTask: (id: string) => void;
  
  // Habits
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => void;
  toggleHabitCompletion: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'progress'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Daily Logs
  saveDailyLog: (log: DailyLog) => void;
  getDailyLog: (date: string) => DailyLog | undefined;

  // Data Management
  exportData: () => void;
  importData: (jsonData: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Обзор целей на квартал', category: 'Работа', priority: 'high', status: 'todo', dueDate: new Date().toISOString(), color: '#6366f1', isFocus: true },
  { id: '2', title: 'Купить продукты', category: 'Личное', priority: 'medium', status: 'done', dueDate: new Date().toISOString(), color: '#10b981' },
  { id: '3', title: 'Позвонить маме', category: 'Личное', priority: 'low', status: 'todo', dueDate: addDays(new Date(), 1).toISOString(), color: '#10b981' },
  { id: '4', title: 'Закончить проект X', category: 'Работа', priority: 'high', status: 'in-progress', dueDate: addDays(new Date(), 3).toISOString(), color: '#6366f1', goalId: '1' },
  { id: '5', title: 'Записаться к врачу', category: 'Здоровье', priority: 'high', status: 'todo', dueDate: addDays(new Date(), 5).toISOString(), color: '#ec4899' },
];

const MOCK_HABITS: Habit[] = [
  { id: '1', title: 'Утренняя пробежка', streak: 5, completedDates: [subDays(new Date(), 1).toISOString(), subDays(new Date(), 2).toISOString()], color: 'hsl(160 60% 45%)', goal: 3, goalId: '2' },
  { id: '2', title: 'Чтение 30 мин', streak: 12, completedDates: [new Date().toISOString()], color: 'hsl(250 80% 60%)', goal: 7 },
  { id: '3', title: 'Пить воду', streak: 2, completedDates: [], color: 'hsl(30 80% 55%)', goal: 7, goalId: '2' },
];

const MOCK_GOALS: Goal[] = [
  { id: '1', title: 'Запуск стартапа', description: 'Релиз MVP к концу квартала', color: '#6366f1', deadline: addWeeks(new Date(), 4).toISOString(), progress: 45 },
  { id: '2', title: 'Марафон 42км', description: 'Подготовка к летнему марафону', color: '#10b981', deadline: addWeeks(new Date(), 12).toISOString(), progress: 20 },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('flow_tasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('flow_habits');
    return saved ? JSON.parse(saved) : MOCK_HABITS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('flow_goals');
    return saved ? JSON.parse(saved) : MOCK_GOALS;
  });

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('flow_daily_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence Effects
  useEffect(() => { localStorage.setItem('flow_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('flow_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('flow_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('flow_daily_logs', JSON.stringify(dailyLogs)); }, [dailyLogs]);

  // Notifications logic
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // --- Tasks ---
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9) };
    setTasks([...tasks, newTask]);
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Новая задача: ${task.title}`, {
        body: `Срок: ${format(new Date(task.dueDate), 'dd.MM.yyyy')}`,
      });
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const reorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // --- Habits ---
  const addHabit = (habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => {
    const newHabit = { ...habit, id: Math.random().toString(36).substr(2, 9), streak: 0, completedDates: [] };
    setHabits([...habits, newHabit]);
  };

  const toggleHabitCompletion = (id: string, date: string) => {
    setHabits(habits.map(h => {
      if (h.id !== id) return h;
      
      const exists = h.completedDates.some(d => isSameDay(new Date(d), new Date(date)));
      let newDates = exists 
        ? h.completedDates.filter(d => !isSameDay(new Date(d), new Date(date)))
        : [...h.completedDates, date];
      
      // Calculate streak (simplified for robust logic see previous implementation, keeping it short here)
      const sortedDates = [...newDates].map(d => new Date(d).getTime()).sort((a, b) => b - a);
      let currentStreak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      const todayCompleted = newDates.some(d => isSameDay(new Date(d), checkDate));
      if (!todayCompleted) checkDate.setDate(checkDate.getDate() - 1);

      for (let i = 0; i < 365; i++) {
        if (newDates.some(d => isSameDay(new Date(d), checkDate))) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
      }

      return { ...h, completedDates: newDates, streak: currentStreak };
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  // --- Goals ---
  const addGoal = (goal: Omit<Goal, 'id' | 'progress'>) => {
    const newGoal = { ...goal, id: Math.random().toString(36).substr(2, 9), progress: 0 };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  // --- Daily Logs ---
  const saveDailyLog = (log: DailyLog) => {
    const existingIndex = dailyLogs.findIndex(l => l.date === log.date);
    if (existingIndex >= 0) {
      const newLogs = [...dailyLogs];
      newLogs[existingIndex] = log;
      setDailyLogs(newLogs);
    } else {
      setDailyLogs([...dailyLogs, log]);
    }
  };

  const getDailyLog = (date: string) => {
    return dailyLogs.find(l => l.date === date);
  };

  // --- Export / Import ---
  const exportData = () => {
    const data = {
      tasks,
      habits,
      goals,
      dailyLogs,
      version: 1,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.tasks) setTasks(data.tasks);
      if (data.habits) setHabits(data.habits);
      if (data.goals) setGoals(data.goals);
      if (data.dailyLogs) setDailyLogs(data.dailyLogs);
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{ 
      tasks, habits, goals, dailyLogs,
      addTask, updateTask, reorderTasks, deleteTask,
      addHabit, toggleHabitCompletion, deleteHabit,
      addGoal, updateGoal, deleteGoal,
      saveDailyLog, getDailyLog,
      exportData, importData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
