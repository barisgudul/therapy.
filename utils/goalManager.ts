import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  startDate: string;
  endDate: string;
  completed: boolean;
  reward?: string;
}

const GOALS_KEY = 'user_goals';

export const goalManager = {
  async createGoal(goal: Omit<Goal, 'id' | 'current' | 'completed'>): Promise<Goal> {
    try {
      const storedGoals = await AsyncStorage.getItem(GOALS_KEY);
      const goals: Goal[] = storedGoals ? JSON.parse(storedGoals) : [];

      const newGoal: Goal = {
        ...goal,
        id: Date.now().toString(),
        current: 0,
        completed: false,
      };

      goals.push(newGoal);
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));

      return newGoal;
    } catch (error) {
      console.error('Hedef oluşturulurken hata:', error);
      throw error;
    }
  },

  async updateGoalProgress(goalId: string, progress: number): Promise<Goal> {
    try {
      const storedGoals = await AsyncStorage.getItem(GOALS_KEY);
      const goals: Goal[] = storedGoals ? JSON.parse(storedGoals) : [];

      const goalIndex = goals.findIndex(g => g.id === goalId);
      if (goalIndex === -1) throw new Error('Hedef bulunamadı');

      const goal = goals[goalIndex];
      goal.current = Math.min(goal.current + progress, goal.target);
      goal.completed = goal.current >= goal.target;

      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));

      return goal;
    } catch (error) {
      console.error('Hedef ilerlemesi güncellenirken hata:', error);
      throw error;
    }
  },

  async getActiveGoals(): Promise<Goal[]> {
    try {
      const storedGoals = await AsyncStorage.getItem(GOALS_KEY);
      const goals: Goal[] = storedGoals ? JSON.parse(storedGoals) : [];
      const now = moment();

      return goals.filter(goal => {
        const endDate = moment(goal.endDate);
        return !goal.completed && endDate.isAfter(now);
      });
    } catch (error) {
      console.error('Aktif hedefler alınırken hata:', error);
      throw error;
    }
  },

  async getCompletedGoals(): Promise<Goal[]> {
    try {
      const storedGoals = await AsyncStorage.getItem(GOALS_KEY);
      const goals: Goal[] = storedGoals ? JSON.parse(storedGoals) : [];

      return goals.filter(goal => goal.completed);
    } catch (error) {
      console.error('Tamamlanan hedefler alınırken hata:', error);
      throw error;
    }
  },

  async deleteGoal(goalId: string): Promise<void> {
    try {
      const storedGoals = await AsyncStorage.getItem(GOALS_KEY);
      const goals: Goal[] = storedGoals ? JSON.parse(storedGoals) : [];

      const updatedGoals = goals.filter(g => g.id !== goalId);
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Hedef silinirken hata:', error);
      throw error;
    }
  },

  async resetGoals(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GOALS_KEY);
    } catch (error) {
      console.error('Hedefler sıfırlanırken hata:', error);
      throw error;
    }
  },
}; 