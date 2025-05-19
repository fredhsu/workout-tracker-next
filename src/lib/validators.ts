import { ExerciseEntry } from '@/lib/types';

// Object to define a week of workouts
export interface WorkoutImportData {
  weekNumber: number;
  days: {
    [key: number]: ExerciseEntry[];
  };
}

// Function to validate the workout import data structure
export function validateWorkoutImport(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push('Invalid JSON format: must be an object');
    return { valid: false, errors };
  }

  // Try to cast the data to our expected format
  const importData = data as Partial<WorkoutImportData>;

  // Check required fields
  if (typeof importData.weekNumber !== 'number') {
    errors.push('weekNumber is required and must be a number');
  }

  if (!importData.days || typeof importData.days !== 'object') {
    errors.push('days field is required and must be an object');
    return { valid: false, errors };
  }

  // Validate each day's data
  Object.entries(importData.days).forEach(([dayKey, exercises]) => {
    const dayNumber = parseInt(dayKey, 10);
    
    // Check if day number is valid
    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 7) {
      errors.push(`Invalid day number: ${dayKey}. Must be between 1 and 7`);
    }
    
    // Check if exercises is an array
    if (!Array.isArray(exercises)) {
      errors.push(`Exercises for day ${dayKey} must be an array`);
      return;
    }
    
    // Validate each exercise
    exercises.forEach((exercise, index) => {
      if (!validateExercise(exercise, index, dayNumber, errors)) {
        return;
      }
    });
  });

  return { valid: errors.length === 0, errors };
}

// Function to validate an exercise object
function validateExercise(
  exercise: unknown, 
  index: number, 
  day: number, 
  errors: string[]
): boolean {
  if (!exercise || typeof exercise !== 'object') {
    errors.push(`Exercise at index ${index} in day ${day} is not a valid object`);
    return false;
  }

  const ex = exercise as Partial<ExerciseEntry>;

  // Validate required fields
  if (!ex.name || typeof ex.name !== 'string') {
    errors.push(`Exercise at index ${index} in day ${day} must have a name property`);
  }

  if (typeof ex.sets !== 'number') {
    errors.push(`Exercise at index ${index} in day ${day} must have a valid sets property (number)`);
  }

  if (!ex.reps || typeof ex.reps !== 'string') {
    errors.push(`Exercise at index ${index} in day ${day} must have a valid reps property (string)`);
  }

  // Weight is optional, but must be a string if present
  if (ex.weight !== undefined && typeof ex.weight !== 'string') {
    errors.push(`Exercise at index ${index} in day ${day} has invalid weight property (must be string)`);
  }

  // Note is required but can be empty
  if (ex.note === undefined || typeof ex.note !== 'string') {
    errors.push(`Exercise at index ${index} in day ${day} must have a note property (string)`);
  }

  return true;
}

// Generate a sample import template
export function generateImportTemplate(): WorkoutImportData {
  return {
    weekNumber: 1,
    days: {
      1: [
        { name: 'Back Squat', sets: 3, reps: '8-10', weight: '', note: '' },
        { name: 'Bench Press', sets: 3, reps: '8-10', weight: '', note: '' }
      ],
      2: [
        { name: 'Zone 2 Cardio', sets: 1, reps: '30-45 min', weight: '', note: '' }
      ],
      3: [
        { name: 'Deadlift', sets: 3, reps: '5-6', weight: '', note: '' },
        { name: 'Overhead Press', sets: 3, reps: '6-8', weight: '', note: '' }
      ]
    }
  };
}