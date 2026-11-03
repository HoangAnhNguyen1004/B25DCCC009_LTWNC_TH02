import { create } from 'zustand';
import type { Exercise } from '../../types';

export interface SessionState {
  queue: Exercise[];
  currentIndex: number;
  isRunning: boolean;
  elapsed: number;
  startSession: (exercises: Exercise[], startIndex: number) => void;
  toggleRun: () => void;
  next: () => void;
  prev: () => void;
  addToSession: (exercise: Exercise) => void;
  tick: () => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  queue: [],
  currentIndex: -1,
  isRunning: false,
  elapsed: 0,

  startSession: (exercises, startIndex) => {
    const validIndex = Number.isInteger(startIndex) && startIndex >= 0 && startIndex < exercises.length;
    set({
      queue: [...exercises],
      currentIndex: validIndex ? startIndex : -1,
      isRunning: validIndex,
      elapsed: 0,
    });
  },

  toggleRun: () => {
    const { queue, currentIndex, isRunning, elapsed } = get();
    if (queue.length === 0) return;

    if (currentIndex === -1) {
      set({ currentIndex: 0, elapsed: 0, isRunning: true });
      return;
    }

    set({
      isRunning: !isRunning,
      elapsed: elapsed >= queue[currentIndex].duration ? 0 : elapsed,
    });
  },

  next: () => {
    const { queue, currentIndex } = get();
    if (currentIndex === -1) return;

    if (currentIndex >= queue.length - 1) {
      set({ isRunning: false, elapsed: queue[currentIndex].duration });
      return;
    }

    set({ currentIndex: currentIndex + 1, elapsed: 0 });
  },

  prev: () => {
    const { currentIndex, elapsed } = get();
    if (currentIndex === -1) return;
    set({ currentIndex: elapsed > 3 ? currentIndex : Math.max(0, currentIndex - 1), elapsed: 0 });
  },

  addToSession: (exercise) => {
    if (get().queue.some((item) => item.id === exercise.id)) return;
    set((state) => ({ queue: [...state.queue, exercise] }));
  },

  tick: () => {
    const { queue, currentIndex, isRunning, elapsed } = get();
    if (!isRunning || currentIndex === -1) return;

    if (elapsed + 1 >= queue[currentIndex].duration) {
      get().next();
      return;
    }

    set({ elapsed: elapsed + 1 });
  },
}));
