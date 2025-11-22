'use client';

import React, { useState, useEffect } from 'react';
import { User, ExerciseEntry } from '@/lib/types';
import ExerciseForm from '@/components/ExerciseForm';
import ImportModal from '@/components/ImportModal';
import QuickAddExercise from '@/components/QuickAddExercise';
import WeekNavigation from '@/components/WeekNavigation';
import StatsOverview from '@/components/StatsOverview';
import DayCard from '@/components/DayCard';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';

const defaultTemplate: Record<number, Array<{ name: string; sets: number; reps: string; note: string; }>> = {
  1: [
    { name: 'Back Squat', sets: 3, reps: '8-10', note: '' },
    { name: 'Bench Press', sets: 3, reps: '8-10', note: '' },
    { name: 'Bent-Over Row', sets: 3, reps: '8-10', note: '' },
    { name: 'Plank', sets: 3, reps: '30-45s', note: '' }
  ],
  2: [{ name: 'Zone 2 Cardio', sets: 1, reps: '30-45 min', note: '' }],
  3: [
    { name: 'Deadlift', sets: 3, reps: '5-6', note: '' },
    { name: 'Overhead Press', sets: 3, reps: '6-8', note: '' },
    { name: 'Pull-Ups/Chin-Ups', sets: 3, reps: 'AMRAP 6-10', note: '' },
    { name: 'Walking Lunges', sets: 3, reps: '8-10 per leg', note: '' },
    { name: 'Hanging Leg Raises', sets: 3, reps: '10-15', note: '' }
  ],
  4: [{ name: 'HIIT Intervals', sets: 1, reps: '15-20 min total', note: '' }],
  5: [
    { name: 'Front Squat/Bulgarian Split Squat', sets: 3, reps: '8-10', note: '' },
    { name: 'Incline DB Bench Press', sets: 3, reps: '8-12', note: '' },
    { name: 'Bent-Over Row (Supinated)', sets: 3, reps: '10-12', note: '' },
    { name: 'Barbell/DB Curls', sets: 2, reps: '12', note: '' },
    { name: 'Band Triceps Pushdowns', sets: 2, reps: '15', note: '' },
    { name: 'Side Plank', sets: 2, reps: '20-30s per side', note: '' }
  ],
  6: [{ name: 'Zone 2 Cardio', sets: 1, reps: '45-60 min', note: '' }]
};

export default function WorkoutTrackerApp(): React.JSX.Element {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workouts, setWorkouts] = useState<Record<number, Record<number, ExerciseEntry[]>>>({});
  const [isAddingWeek, setIsAddingWeek] = useState<boolean>(false);

  // For exercise editing
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState<boolean>(false);
  const [currentExercise, setCurrentExercise] = useState<ExerciseEntry | undefined>(undefined);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentDay, setCurrentDay] = useState<number>(1);

  // For expandable day cards
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1])); // Start with day 1 expanded


  // For swipe gestures
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);

  // For quick add exercise
  const [showQuickAdd, setShowQuickAdd] = useState<{ [key: number]: boolean }>({});

  // For importing workouts
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Authenticate user (simple demo)
  useEffect(() => {
    async function authenticateUser() {
      try {
        // Use a default email for demo purposes
        const response = await fetch(`/api/auth?email=demo@example.com`);
        if (!response.ok) throw new Error('Authentication failed');
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Failed to authenticate:', error);
      }
    }

    authenticateUser();
  }, []);

  // Load workout data
  useEffect(() => {
    if (user) {
      console.log('User changed, loading workouts for user:', user.id);
      loadWorkouts();
    }
  }, [user]);

  // This effect will run once when the component mounts to ensure data is loaded
  useEffect(() => {
    if (user) {
      console.log('Initial load of workouts');
      const initialLoadTimeout = setTimeout(() => {
        loadWorkouts();
      }, 500);

      return () => clearTimeout(initialLoadTimeout);
    }
  }, [user]);

  // Initialize with default workouts if user exists but we're still loading
  useEffect(() => {
    if (user && Object.keys(workouts).length === 0 && !isLoading) {
      console.log('No workouts found after loading - initializing defaults');
      initializeDefaultWorkouts();
    }
  }, [user, workouts, isLoading]);

  const loadWorkouts = async () => {
    if (!user) return;

    // Add a small random cache-busting parameter to avoid browser caching
    const cacheBuster = new Date().getTime();

    setIsLoading(true);
    try {
      console.log('Loading workouts for user:', user.id);
      const response = await fetch(`/api/workouts?userId=${user.id}&_=${cacheBuster}`);
      if (!response.ok) throw new Error('Failed to fetch workouts');

      const workoutData = await response.json();
      console.log('Workout data received:', workoutData.length, 'workouts');

      // Convert to expected format
      const formattedWorkouts: Record<number, Record<number, ExerciseEntry[]>> = {};

      workoutData.forEach((workout: any) => {
        const { weekNumber, dayNumber, exercises } = workout;

        if (!formattedWorkouts[weekNumber]) {
          formattedWorkouts[weekNumber] = {};
        }

        formattedWorkouts[weekNumber][dayNumber] = exercises;
      });

      // Only update the state if we found some workouts
      if (Object.keys(formattedWorkouts).length > 0) {
        console.log('Setting workouts state with', Object.keys(formattedWorkouts).length, 'weeks');

        // Complete replacement of the state to ensure clean update
        setWorkouts(formattedWorkouts);

        // If there are workouts, set current week to the latest one unless we're adding a week
        const latestWeek = Math.max(...Object.keys(formattedWorkouts).map(Number));
        if (!isAddingWeek) {
          setCurrentWeek(latestWeek);
        }

        if (currentWeek !== latestWeek) {
          // Check if the imported week exists and automatically switch to it if needed
          const importedWeek = Object.keys(formattedWorkouts).find(week =>
            !workouts[Number(week)] || Object.keys(formattedWorkouts[Number(week)]).length >
            Object.keys(workouts[Number(week)] || {}).length
          );

          if (importedWeek && Number(importedWeek) !== currentWeek) {
            setCurrentWeek(Number(importedWeek));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save workout data
  const saveWorkout = async (day: number, exercises: ExerciseEntry[], weekNumber?: number) => {
    if (!user) return;

    const targetWeek = weekNumber ?? currentWeek;

    try {
      const payload = {
        userId: user.id,
        weekNumber: targetWeek,
        dayNumber: day,
        exercises: exercises.map(({ ...rest }: any) => {
          // Remove id and workoutId if they exist to avoid issues with the API
          const { id, workoutId, ...cleanExercise } = rest;
          return cleanExercise;
        })
      };

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save workout: ${response.status} ${errorText}`);
      }

      const savedWorkout = await response.json();

      // Update local state
      setWorkouts(prev => ({
        ...prev,
        [targetWeek]: {
          ...prev[targetWeek],
          [day]: savedWorkout.exercises,
        },
      }));
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  const addWeek = async () => {
    if (!user) return;

    const next = currentWeek + 1;
    console.log('Adding new week:', next);

    // Set flag to prevent loadWorkouts from interfering
    setIsAddingWeek(true);

    // Create empty workouts for the new week with the default template
    const newWeekWorkouts: Record<number, ExerciseEntry[]> = {};

    // First update the current week immediately
    setCurrentWeek(next);

    // For each day, set up default exercises
    for (let day = 1; day <= 6; day++) {
      if (!defaultTemplate[day]) {
        continue;
      }

      const exercises = defaultTemplate[day].map(e => ({
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        weight: '',
        note: e.note || '',
      }));

      newWeekWorkouts[day] = exercises;

      try {
        // Save each day to the database for the new week
        await saveWorkout(day, exercises, next);
      } catch (error) {
        console.error(`Error saving workout for day ${day}:`, error);
      }
    }

    // Update local state to ensure UI shows exercises
    setWorkouts(prev => ({
      ...prev,
      [next]: newWeekWorkouts,
    }));

    // Clear the adding week flag
    setIsAddingWeek(false);
  };

  const getDefaultExercises = (day: number): ExerciseEntry[] => {
    // Make sure day is a valid key in the defaultTemplate
    if (!defaultTemplate[day]) {
      day = 1;
    }
    return defaultTemplate[day].map(e => ({
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      weight: '',
      note: e.note || '',
    }));
  };

  // Initialize default workouts for current week
  const initializeDefaultWorkouts = async () => {
    if (!user) return;

    const defaultWorkouts: Record<number, ExerciseEntry[]> = {};

    // Use default template for each day
    for (let day = 1; day <= 6; day++) {
      const exercises = getDefaultExercises(day);
      defaultWorkouts[day] = exercises;

      // Also save these defaults to the database for this user
      try {
        await saveWorkout(day, exercises);
      } catch (error) {
        console.error(`Error saving default workout for day ${day}:`, error);
      }
    }

    // Update local state immediately to ensure UI shows exercises
    setWorkouts(prev => ({
      ...prev,
      [currentWeek]: defaultWorkouts,
    }));
  };

  // Add a new exercise to a day
  const handleAddExercise = (day: number) => {
    setCurrentDay(day);
    setCurrentExercise(undefined);
    setIsEditing(false);
    setIsExerciseModalOpen(true);
  };

  // Edit an existing exercise
  const handleEditExercise = (day: number, exercise: ExerciseEntry) => {
    setCurrentDay(day);
    setCurrentExercise(exercise);
    setIsEditing(true);
    setIsExerciseModalOpen(true);
  };

  // Delete an exercise
  const handleDeleteExercise = async (day: number, exerciseId: string) => {
    if (!user) return;

    try {
      // If this is a newly created exercise without an ID yet
      if (!exerciseId) {
        const exercises = workouts[currentWeek]?.[day] ?? [];
        // Find the exercise by matching other properties and filter it out
        const updatedExercises = exercises.filter(e => e !== currentExercise);

        // Save the updated list
        await saveWorkout(day, updatedExercises);
        return;
      }

      // Otherwise delete from the database
      const response = await fetch(`/api/exercises?id=${exerciseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete exercise');

      // Update local state
      const exercises = workouts[currentWeek]?.[day] ?? [];
      const updatedExercises = exercises.filter(e => e.id !== exerciseId);

      setWorkouts(prev => ({
        ...prev,
        [currentWeek]: {
          ...prev[currentWeek],
          [day]: updatedExercises,
        },
      }));

      // Save to ensure consistency
      await saveWorkout(day, updatedExercises);
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };

  // Save a new or edited exercise
  const handleSaveExercise = async (exercise: ExerciseEntry) => {
    if (!user) return;

    try {
      const exercises = workouts[currentWeek]?.[currentDay] ?? getDefaultExercises(currentDay);
      let updatedExercises: ExerciseEntry[];

      if (isEditing && currentExercise?.id) {
        // Update existing exercise
        updatedExercises = exercises.map(e =>
          e.id === currentExercise.id ? { ...exercise, id: e.id } : e
        );

        // Also update in database directly
        await fetch('/api/exercises', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: currentExercise.id,
            ...exercise,
          }),
        });
      } else {
        // Add new exercise
        updatedExercises = [...exercises, exercise];
      }

      // Update local state
      setWorkouts(prev => ({
        ...prev,
        [currentWeek]: {
          ...prev[currentWeek],
          [currentDay]: updatedExercises,
        },
      }));

      // Save to database
      await saveWorkout(currentDay, updatedExercises);
    } catch (error) {
      console.error('Failed to save exercise:', error);
    }
  };

  // Handle inline save without opening modal
  const handleInlineSaveExercise = async (day: number, exercise: ExerciseEntry) => {
    if (!user) return;

    try {
      const exercises = workouts[currentWeek]?.[day] ?? getDefaultExercises(day);

      // Update existing exercise
      const updatedExercises = exercises.map(e =>
        e.id === exercise.id ? { ...exercise, id: e.id } : e
      );

      // Update local state
      setWorkouts(prev => ({
        ...prev,
        [currentWeek]: {
          ...prev[currentWeek],
          [day]: updatedExercises,
        },
      }));

      // Save to database
      await saveWorkout(day, updatedExercises);
    } catch (error) {
      console.error('Failed to save exercise:', error);
    }
  };

  // Helper functions for new UI
  const toggleDayExpansion = (day: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  };

  const toggleExerciseComplete = async (day: number, exerciseId: string, currentCompleted: boolean) => {
    if (!user) return;

    const exercises = workouts[currentWeek]?.[day] ?? [];
    const updatedExercises = exercises.map(e =>
      e.id === exerciseId ? { ...e, completed: !currentCompleted } : e
    );

    // Update local state
    setWorkouts(prev => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        [day]: updatedExercises,
      },
    }));

    // Save to database
    await saveWorkout(day, updatedExercises);
  };

  const getDayName = (day: number): string => {
    const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[day] || `Day ${day}`;
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Swipe left - go to newer week
      const currentIndex = availableWeeks.indexOf(currentWeek);
      if (currentIndex > 0) {
        setCurrentWeek(availableWeeks[currentIndex - 1]);
      }
    }

    if (isRightSwipe) {
      // Swipe right - go to older week  
      const currentIndex = availableWeeks.indexOf(currentWeek);
      if (currentIndex < availableWeeks.length - 1) {
        setCurrentWeek(availableWeeks[currentIndex + 1]);
      }
    }
  };

  // Quick add exercise handler
  const handleQuickAddExercise = (day: number, exercise: ExerciseEntry) => {
    const exercises = workouts[currentWeek]?.[day] || [];
    const updatedExercises = [...exercises, exercise];

    setWorkouts(prev => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        [day]: updatedExercises,
      },
    }));

    saveWorkout(day, updatedExercises);
    setShowQuickAdd(prev => ({ ...prev, [day]: false }));
  };

  // Export week data
  const handleExport = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/workouts/export?userId=${user.id}&weekNumber=${currentWeek}`);

      if (!response.ok) {
        throw new Error('Failed to export workouts');
      }

      const exportData = await response.json();
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', `workouts-week-${currentWeek}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export workouts. Please try again.');
    }
  };


  if (isLoading) {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded-xl w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Get available weeks in reverse order (newest first)
  const availableWeeks = Object.keys(workouts)
    .map(Number)
    .filter(week => workouts[week] && Object.keys(workouts[week]).length > 0)
    .sort((a, b) => b - a); // Sort in descending order

  const currentWeekData = workouts[currentWeek] || {};
  const totalExercises = Object.values(currentWeekData).reduce((total, day) => total + day.length, 0);
  const completedExercisesCount = Object.values(currentWeekData).reduce((total, day) =>
    total + day.filter(e => e.completed).length, 0
  );
  const totalWorkouts = Object.keys(currentWeekData).length;

  return (
    <div
      className="p-4 max-w-4xl mx-auto pb-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <WeekNavigation
        currentWeek={currentWeek}
        availableWeeks={availableWeeks}
        onWeekChange={setCurrentWeek}
        onAddWeek={addWeek}
      />

      <StatsOverview
        totalWorkouts={totalWorkouts}
        totalExercises={totalExercises}
        completedExercises={completedExercisesCount}
      />

      <div className="flex justify-end gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsImportModalOpen(true)}
          className="text-gray-600"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="text-gray-600"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, i) => {
          const day = i + 1;
          const dayExercises = workouts[currentWeek]?.[day] || [];

          return (
            <div key={day} className="relative">
              <DayCard
                dayNumber={day}
                dayName={getDayName(day)}
                exercises={dayExercises}
                isExpanded={expandedDays.has(day)}

                onToggleExpand={toggleDayExpansion}
                onAddExercise={handleAddExercise}
                onQuickAdd={() => setShowQuickAdd(prev => ({ ...prev, [day]: !prev[day] }))}
                onEditExercise={handleEditExercise}
                onInlineSaveExercise={handleInlineSaveExercise}
                onDeleteExercise={handleDeleteExercise}
                onToggleComplete={(id, current) => toggleExerciseComplete(day, id, current)}
              />

              {showQuickAdd[day] && (
                <div className="mt-2 animate-in slide-in-from-top-2">
                  <QuickAddExercise
                    onAddExercise={(exercise) => handleQuickAddExercise(day, exercise)}
                    onClose={() => setShowQuickAdd(prev => ({ ...prev, [day]: false }))}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ExerciseForm
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSave={handleSaveExercise}
        exercise={currentExercise}
        isEditing={isEditing}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          setIsImportModalOpen(false);
          loadWorkouts();
        }}
        user={user}
        currentWeek={currentWeek}
      />
    </div>
  );
}