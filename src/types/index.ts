export interface Food {
  id: number;
  name: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  servingSize: number;
  servingUnit: string;
  // Optional nutrients
  cholesterol?: number;
  sodium?: number;
  potassium?: number;
  vitamins?: Record<string, number>;
  isCustom?: boolean;
}

export interface DailyGoals {
  calories: number;
  fatPercentage: number;
  carbsPercentage: number;
  proteinPercentage: number;
}

export interface FoodLog {
  id: number;
  foodId: number;
  date: string;
  amount: number;
  timeLogged: string;
}

export interface DayNutrients {
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  foods: Array<{
    name: string;
    amount: number;
    timeLogged: string;
  }>;
}
