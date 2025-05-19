export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ExerciseEntry {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  note: string;
}

export interface WorkoutData {
  id?: string;
  userId: string;
  weekNumber: number;
  dayNumber: number;
  exercises: ExerciseEntry[];
}