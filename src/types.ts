export interface MealAnalysis {
  nama_makanan: string;
  kalori_estimasi: number;
  protein_gram: number;
  status_gizi: string;
  evaluasi_budget: string;
}

export interface MealLog {
  id: string;
  timestamp: string;
  image?: string;
  harga: number;
  analysis: MealAnalysis;
}

export interface StudentProfile {
  name: string;
  weeklyBudget: number;
  targetDailyProtein: number; // in grams, default e.g. 50g
  targetDailyCalories: number; // in kcal, default e.g. 2000 kcal
}
