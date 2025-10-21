'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Plus, Check, Calendar, Dumbbell, Zap } from 'lucide-react';
import { User, ExerciseEntry } from '@/lib/types';
import ExerciseForm from '@/components/ExerciseForm';
import ImportModal from '@/components/ImportModal';
import FormInput from '@/components/FormInput';
import QuickAddExercise from '@/components/QuickAddExercise';

interface ExerciseProps {
  name: string;
  sets: number;
  reps: string;
  note: string;
}


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
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  
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
      console.log('User or week changed, loading workouts for user:', user.id, 'week:', currentWeek);
      loadWorkouts();
    }
  }, [user, currentWeek]);
  
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
        console.log('Processing workout:', { weekNumber, dayNumber, exerciseCount: exercises?.length });
        
        if (!formattedWorkouts[weekNumber]) {
          formattedWorkouts[weekNumber] = {};
        }
        
        formattedWorkouts[weekNumber][dayNumber] = exercises;
      });
      
      console.log('Found weeks:', Object.keys(formattedWorkouts).join(', '));
      
      // Only update the state if we found some workouts
      if (Object.keys(formattedWorkouts).length > 0) {
        console.log('Setting workouts state with', Object.keys(formattedWorkouts).length, 'weeks');
        
        // Complete replacement of the state to ensure clean update
        setWorkouts(formattedWorkouts);
        
        // If there are workouts, set current week to the latest one unless we're adding a week
        const latestWeek = Math.max(...Object.keys(formattedWorkouts).map(Number));
        if (!isAddingWeek) {
          console.log('Setting current week to latest (reverse order):', latestWeek);
          setCurrentWeek(latestWeek);
        }
        
        if (currentWeek !== latestWeek) {
          // Check if the imported week exists and automatically switch to it if needed
          const importedWeek = Object.keys(formattedWorkouts).find(week => 
            !workouts[Number(week)] || Object.keys(formattedWorkouts[Number(week)]).length > 
            Object.keys(workouts[Number(week)] || {}).length
          );
          
          if (importedWeek && Number(importedWeek) !== currentWeek) {
            console.log('Detected newly imported week:', importedWeek, 'switching to it');
            setCurrentWeek(Number(importedWeek));
          }
        }
      } else {
        console.log('No workouts found from API, will initialize defaults after loading');
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
      console.log('Saving workout:', { 
        userId: user.id, 
        weekNumber: targetWeek, 
        dayNumber: day,
        exerciseCount: exercises.length
      });
      
      const payload = {
        userId: user.id,
        weekNumber: targetWeek,
        dayNumber: day,
        exercises: exercises.map(({ id, workoutId, ...rest }: any) => rest)
      };
      
      console.log('Payload:', payload);
      
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to save workout: ${response.status} ${errorText}`);
      }
      
      const savedWorkout = await response.json();
      console.log('Saved workout response:', savedWorkout);
      
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

  // Store the timeout ID at component level to manage debounced saves
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const handleChange = (
    day: number,
    idx: number,
    field: keyof Omit<ExerciseEntry, 'name' | 'sets' | 'reps'>,
    value: string
  ) => {
    const exercises = workouts[currentWeek]?.[day] ?? getDefaultExercises(day);
    const updatedExercises = exercises.map((e, i) => i === idx ? { ...e, [field]: value } : e);
    
    // Update local state immediately for responsive UI
    setWorkouts(prev => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        [day]: updatedExercises,
      },
    }));
    
    // Clear any existing timeout to prevent multiple saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounced save to prevent too many API calls
    saveTimeoutRef.current = setTimeout(() => {
      saveWorkout(day, updatedExercises);
      saveTimeoutRef.current = null;
    }, 1000);
  };

  const addWeek = async () => {
    if (!user) return;

    // Find the maximum week number and add 1 to ensure we create a new unique week
    const maxWeek = Math.max(...Object.keys(workouts).map(Number), 0);
    const next = maxWeek + 1;
    console.log('Adding new week:', next, '(max existing week:', maxWeek, ')');
    
    // Set flag to prevent loadWorkouts from interfering
    setIsAddingWeek(true);
    
    // Create empty workouts for the new week with the default template
    const newWeekWorkouts: Record<number, ExerciseEntry[]> = {};
    
    // First update the current week immediately
    setCurrentWeek(next);
    
    // For each day, set up default exercises
    for (let day = 1; day <= 6; day++) {
      console.log('Setting up day', day, 'for week', next);
      if (!defaultTemplate[day]) {
        console.warn(`No default template for day ${day}, skipping`);
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
    
    console.log('Week added successfully:', next);
  };

  const getDefaultExercises = (day: number): ExerciseEntry[] => {
    console.log('Getting default exercises for day', day);
    // Make sure day is a valid key in the defaultTemplate
    if (!defaultTemplate[day]) {
      console.warn(`No default template for day ${day}, falling back to day 1`);
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
    
    console.log('Initializing default workouts for week', currentWeek);
    const defaultWorkouts: Record<number, ExerciseEntry[]> = {};
    
    // Use default template for each day
    for (let day = 1; day <= 6; day++) {
      const exercises = getDefaultExercises(day);
      console.log(`Day ${day}: Adding ${exercises.length} default exercises`);
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
  
  const toggleExerciseComplete = (exerciseId: string) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };
  
  const getDayName = (day: number): string => {
    const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[day] || `Day ${day}`;
  };
  
  const getExerciseCount = (day: number): number => {
    return workouts[currentWeek]?.[day]?.length || 0;
  };
  
  const getCompletedCount = (day: number): number => {
    const dayExercises = workouts[currentWeek]?.[day] || [];
    return dayExercises.filter(ex => ex.id && completedExercises.has(ex.id)).length;
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
      <div className="p-4 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="flex space-x-4 mb-6">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
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

  return (
    <div 
      className="p-4 max-w-4xl mx-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove} 
      onTouchEnd={handleTouchEnd}
    >
      <header className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const currentIndex = availableWeeks.indexOf(currentWeek);
            if (currentIndex < availableWeeks.length - 1) {
              const olderWeek = availableWeeks[currentIndex + 1];
              console.log('Going to older week:', olderWeek);
              setCurrentWeek(olderWeek);
            }
          }}
          disabled={availableWeeks.length <= 1 || availableWeeks.indexOf(currentWeek) >= availableWeeks.length - 1}
        >
          ← Older
        </Button>
        <h1 className="text-2xl font-bold">Week {currentWeek}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const currentIndex = availableWeeks.indexOf(currentWeek);
            if (currentIndex > 0) {
              const newerWeek = availableWeeks[currentIndex - 1];
              console.log('Going to newer week:', newerWeek);
              setCurrentWeek(newerWeek);
            }
          }}
          disabled={availableWeeks.length <= 1 || availableWeeks.indexOf(currentWeek) <= 0}
        >
          Newer →
        </Button>
      </header>

      {/* Week selector dropdown showing weeks in reverse order */}
      {availableWeeks.length > 1 && (
        <div className="mb-4">
          <Label className="text-sm text-muted-foreground">Jump to Week:</Label>
          <select 
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {availableWeeks.map(week => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex space-x-2 mb-6">
        <Button className="flex-1" onClick={addWeek}>
          + New Week
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsImportModalOpen(true)}
          >
            Import
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Week Overview */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Week Overview</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(workouts[currentWeek] || {}).length}
            </div>
            <div className="text-gray-600">Days Planned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(workouts[currentWeek] || {}).reduce((total, day) => total + day.length, 0)}
            </div>
            <div className="text-gray-600">Total Exercises</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {completedExercises.size}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      {/* Expandable Day Cards */}
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, i) => {
          const day = i + 1;
          const isExpanded = expandedDays.has(day);
          const exerciseCount = getExerciseCount(day);
          const completedCount = getCompletedCount(day);
          const hasExercises = exerciseCount > 0;
          
          return (
            <Card key={day} className={`transition-all duration-200 ${
              isExpanded ? 'shadow-md' : 'shadow-sm hover:shadow-md'
            }`}>
              <CardContent className="p-0">
                {/* Day Header */}
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggleDayExpansion(day)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getDayName(day)}
                      </h3>
                    </div>
                    {hasExercises && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {exerciseCount} exercises
                        </span>
                        {completedCount > 0 && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {completedCount} completed
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQuickAdd(prev => ({ ...prev, [day]: !prev[day] }));
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Zap className="h-4 w-4" />
                        Quick
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddExercise(day);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Custom
                      </Button>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Day Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t bg-gray-50/50">
                    {/* Quick Add Exercise */}
                    {showQuickAdd[day] && (
                      <div className="mt-4">
                        <QuickAddExercise
                          onAddExercise={(exercise) => handleQuickAddExercise(day, exercise)}
                          onClose={() => setShowQuickAdd(prev => ({ ...prev, [day]: false }))}
                        />
                      </div>
                    )}
                    {/* No exercises placeholder */}
                    {!hasExercises && (
                      <div className="py-8 text-center">
                        <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-3">No exercises planned for this day</p>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            size="sm" 
                            onClick={() => {
                              const defaultExs = getDefaultExercises(day);
                              saveWorkout(day, defaultExs);
                              setWorkouts(prev => ({
                                ...prev,
                                [currentWeek]: {
                                  ...prev[currentWeek],
                                  [day]: defaultExs
                                }
                              }));
                            }}
                          >
                            Add Default Exercises
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAddExercise(day)}
                          >
                            Create Custom
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Exercise List */}
                    {hasExercises && (
                      <div className="mt-4 space-y-3">
                        {workouts[currentWeek]?.[day]?.map((ex, idx) => {
                          const exerciseId = ex.id || `${day}-${idx}`;
                          const isCompleted = completedExercises.has(exerciseId);
                          
                          return (
                            <Card key={idx} className={`transition-all ${
                              isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => toggleExerciseComplete(exerciseId)}
                                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                        isCompleted 
                                          ? 'bg-green-500 border-green-500 text-white' 
                                          : 'border-gray-300 hover:border-green-400'
                                      }`}
                                    >
                                      {isCompleted && <Check className="h-3 w-3" />}
                                    </button>
                                    <div>
                                      <div className={`font-medium ${
                                        isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                                      }`}>
                                        {ex.name}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {ex.sets} × {ex.reps}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditExercise(day, ex)}
                                      className="h-8 w-8 p-0"
                                    >
                                      ✏️
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteExercise(day, ex.id as string)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      🗑️
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600 mb-1 block">
                                      Weight / Time
                                    </Label>
                                    <FormInput
                                      value={ex.weight ?? ''}
                                      onValueChange={(value) => handleChange(day, idx, 'weight', value)}
                                      placeholder="e.g., 100 lbs or 30 min"
                                      className="text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600 mb-1 block">
                                      Notes
                                    </Label>
                                    <FormInput
                                      value={ex.note}
                                      onValueChange={(value) => handleChange(day, idx, 'note', value)}
                                      placeholder="RIR / form cues"
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Exercise edit modal */}
      {isExerciseModalOpen && (
        <ExerciseForm
          isOpen={isExerciseModalOpen}
          onClose={() => setIsExerciseModalOpen(false)}
          exercise={currentExercise}
          onSave={handleSaveExercise}
          isEditing={isEditing}
        />
      )}
      
      {/* Import modal */}
      {isImportModalOpen && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={() => {
            console.log('Import complete, reloading workouts...');
            loadWorkouts();
          }}
          user={user}
          currentWeek={currentWeek}
        />
      )}
    </div>
  );
}