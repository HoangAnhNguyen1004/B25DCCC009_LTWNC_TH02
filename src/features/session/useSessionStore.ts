import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Exercise } from '../../types';

export interface SessionState {
  queue: Exercise[];
  currentIndex: number;
  isRunning: boolean;
  elapsed: number;
  restDuration: number;
  restRemaining: number;
  setRestDuration: (seconds: number) => void;
  startSession: (exercises: Exercise[], startIndex: number) => void;
  toggleRun: () => void;
  next: () => void;
  prev: () => void;
  addToSession: (exercise: Exercise) => void;
  tick: () => void;
}

export const useSessionStore = create<SessionState>()(devtools((set, get) => ({
  queue: [],
  currentIndex: -1,
  isRunning: false,
  elapsed: 0,
  restDuration: 10,
  restRemaining: 0,

  setRestDuration: (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0 || get().restRemaining > 0) return;
    set({ restDuration: Math.floor(seconds) }, false, 'session/setRestDuration');
  },

  startSession: (exercises, startIndex) => {
    const validIndex = Number.isInteger(startIndex) && startIndex >= 0 && startIndex < exercises.length;
    set({
      queue: [...exercises],
      currentIndex: validIndex ? startIndex : -1,
      isRunning: validIndex,
      elapsed: 0,
      restRemaining: 0,
    }, false, 'session/startSession');
  },

  toggleRun: () => {
    const { queue, currentIndex, isRunning, elapsed, restRemaining } = get();
    if (queue.length === 0) return;

    if (currentIndex === -1) {
      set({ currentIndex: 0, elapsed: 0, restRemaining: 0, isRunning: true }, false, 'session/startQueued');
      return;
    }

    set({
      isRunning: !isRunning,
      elapsed: restRemaining === 0 && elapsed >= queue[currentIndex].duration ? 0 : elapsed,
    }, false, 'session/toggleRun');
  },

  next: () => {
    const { queue, currentIndex } = get();
    if (currentIndex === -1) return;

    if (currentIndex >= queue.length - 1) {
      set({ isRunning: false, elapsed: queue[currentIndex].duration, restRemaining: 0 }, false, 'session/complete');
      return;
    }

    set({ currentIndex: currentIndex + 1, elapsed: 0, restRemaining: 0 }, false, 'session/next');
  },

  prev: () => {
    const { currentIndex, elapsed } = get();
    if (currentIndex === -1) return;
    set({ currentIndex: elapsed > 3 ? currentIndex : Math.max(0, currentIndex - 1), elapsed: 0, restRemaining: 0 }, false, 'session/prev');
  },

  addToSession: (exercise) => {
    if (get().queue.some((item) => item.id === exercise.id)) return;
    set((state) => ({ queue: [...state.queue, exercise] }), false, 'session/addToSession');
  },

  tick: () => {
    const { queue, currentIndex, isRunning, elapsed, restDuration, restRemaining } = get();
    if (!isRunning || currentIndex === -1) return;

    if (restRemaining > 0) {
      if (restRemaining === 1) get().next();
      else set({ restRemaining: restRemaining - 1 }, false, 'session/tickRest');
      return;
    }

    if (elapsed + 1 >= queue[currentIndex].duration) {
      if (restDuration > 0 && currentIndex < queue.length - 1) {
        set({ elapsed: queue[currentIndex].duration, restRemaining: restDuration }, false, 'session/startRest');
      } else get().next();
      return;
    }

    set({ elapsed: elapsed + 1 }, false, 'session/tick');
  },
}), { name: 'Workout session', enabled: import.meta.env.DEV }));
