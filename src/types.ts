export interface Food {
  id: number;
  name: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  servingSize: number;
  servingUnit: string;
  cholesterol?: number;
  sodium?: number;
  potassium?: number;
  isCustom: boolean;
  isPinned?: boolean;
}

export type MealTime = 'breakfast' | 'amSnack' | 'lunch' | 'pmSnack' | 'dinner' | 'lateSnack';

export interface CartItem {
  foodId?: number;
  recipeId?: number;
  amount: number;
  timeOfDay: MealTime;
}

export interface Recipe {
  id: number;
  name: string;
  items: {
    foodId: number;
    amount: number;
  }[];
  totalCalories: number;
  totalFat: number;
  totalCarbs: number;
  totalProtein: number;
  isPinned?: boolean;
}

export interface FoodLog {
  id?: number;
  foodId?: number;
  recipeId?: number;
  date: string;
  amount: number;
  timeLogged: string;
  timeOfDay: MealTime;
}

export interface DailyGoals {
  calories: number;
  fatPercentage: number;
  carbsPercentage: number;
  proteinPercentage: number;
}

export interface DayNutrients {
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  name: string;
  amount: number;
  servingUnit: string;
  timeLogged: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}
