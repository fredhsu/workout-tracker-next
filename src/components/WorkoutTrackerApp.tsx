'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, ExerciseEntry } from '@/lib/types';
import ExerciseForm from '@/components/ExerciseForm';
import ImportModal from '@/components/ImportModal';
import FormInput from '@/components/FormInput';

interface ExerciseProps {
  name: string;
  sets: number;
  reps: string;
  note: string;
}

type WeekData = Record<number, ExerciseProps[]>;

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

export default function WorkoutTrackerApp(): JSX.Element {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workouts, setWorkouts] = useState<Record<number, Record<number, ExerciseEntry[]>>>({});
  
  // For exercise editing
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState<boolean>(false);
  const [currentExercise, setCurrentExercise] = useState<ExerciseEntry | undefined>(undefined);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentDay, setCurrentDay] = useState<number>(1);
  
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
        
        // If there are workouts and no current week, set current week to the latest one
        if (!currentWeek) {
          const latestWeek = Math.max(...Object.keys(formattedWorkouts).map(Number));
          console.log('No current week set, setting to latest:', latestWeek);
          setCurrentWeek(latestWeek);
        } else {
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
  const saveWorkout = async (day: number, exercises: ExerciseEntry[]) => {
    if (!user) return;
    
    try {
      console.log('Saving workout:', { 
        userId: user.id, 
        weekNumber: currentWeek, 
        dayNumber: day,
        exerciseCount: exercises.length
      });
      
      const payload = {
        userId: user.id,
        weekNumber: currentWeek,
        dayNumber: day,
        exercises: exercises.map(({ id, workoutId, ...rest }) => rest)
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
        [currentWeek]: {
          ...prev[currentWeek],
          [day]: savedWorkout.exercises,
        },
      }));
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  // Store the timeout ID at component level to manage debounced saves
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveDataRef = useRef<{ day: number; exercises: ExerciseEntry[] } | null>(null);
  
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
    // Store pending data
    pendingSaveDataRef.current = { day, exercises: updatedExercises };
    
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingSaveDataRef.current) {
        saveWorkout(pendingSaveDataRef.current.day, pendingSaveDataRef.current.exercises);
        pendingSaveDataRef.current = null;
      }
      saveTimeoutRef.current = null;
    }, 1000);
  };

  const flushPendingSave = () => {
    if (pendingSaveDataRef.current && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveWorkout(pendingSaveDataRef.current.day, pendingSaveDataRef.current.exercises);
      pendingSaveDataRef.current = null;
      saveTimeoutRef.current = null;
      console.log('Flushed pending save.');
    }
  };

  // Effect for handling visibility change and beforeunload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPendingSave();
      }
    };

    const handleBeforeUnload = () => {
      flushPendingSave();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  const addWeek = async () => {
    if (!user) return;
    
    const next = currentWeek + 1;
    console.log('Adding new week:', next);
    
    // Create empty workouts for the new week with the default template
    const newWeekWorkouts: Record<number, ExerciseEntry[]> = {};
    
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
        // Save each day to the database
        await saveWorkout(day, exercises);
      } catch (error) {
        console.error(`Error saving workout for day ${day}:`, error);
      }
    }
    
    // Update local state immediately to ensure UI shows exercises
    setWorkouts(prev => ({
      ...prev,
      [next]: newWeekWorkouts,
    }));
    
    setCurrentWeek(next);
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

  // For debugging:
  console.log('Current state:', { 
    isLoading, 
    hasUser: !!user, 
    currentWeek,
    workoutKeys: Object.keys(workouts),
    hasCurrentWeekWorkouts: !!workouts[currentWeek],
    daysInCurrentWeek: workouts[currentWeek] ? Object.keys(workouts[currentWeek]) : []
  });

  if (isLoading) {
    return <div className="p-4 max-w-md mx-auto">Loading workout data...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeek(w => Math.max(1, w - 1))}
        >
          Prev
        </Button>
        <h1 className="text-2xl font-bold">Week {currentWeek}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeek(w => w + 1)}
        >
          Next
        </Button>
      </header>

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

      <Tabs defaultValue="day1">
        <TabsList className="grid grid-cols-3 mb-4">
          {Array.from({ length: 6 }, (_, i) => (
            <TabsTrigger value={`day${i+1}`} key={i}>
              Day {i+1}
            </TabsTrigger>
          ))}
        </TabsList>

        {Array.from({ length: 6 }, (_, i) => (
          <TabsContent value={`day${i+1}`} key={i}>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-medium">Day {i+1} Exercises</h2>
              <Button
                size="sm"
                onClick={() => handleAddExercise(i+1)}
              >
                + Add Exercise
              </Button>
            </div>
            
            {/* Placeholder message when no exercises are available */}
            {!workouts[currentWeek]?.[i+1] && !isLoading && (
              <div className="p-4 border rounded-md mb-4 text-center">
                <p className="mb-2">No exercises for this day yet.</p>
                <Button 
                  size="sm" 
                  onClick={() => {
                    const defaultExs = getDefaultExercises(i+1);
                    saveWorkout(i+1, defaultExs);
                    // Update local state immediately
                    setWorkouts(prev => ({
                      ...prev,
                      [currentWeek]: {
                        ...prev[currentWeek],
                        [i+1]: defaultExs
                      }
                    }));
                  }}
                >
                  Add Default Exercises
                </Button>
              </div>
            )}
            
            {/* Debug output */}
            <div className="text-xs text-gray-500 mb-2">
              Day {i+1}: {workouts[currentWeek]?.[i+1] ? 
                `${workouts[currentWeek][i+1].length} exercises` : 
                'No exercises yet'}
            </div>
            
            {workouts[currentWeek]?.[i+1]?.map((ex, idx) => (
              <Card key={idx} className="mb-4">
                <CardContent>
                  <div className="flex justify-between pt-4">
                    <div className="font-medium">{ex.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {ex.sets} × {ex.reps}
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div>
                      <Label>Weight / Time</Label>
                      <FormInput
                        value={ex.weight ?? ''}
                        onValueChange={(value) =>
                          handleChange(i+1, idx, 'weight', value)
                        }
                        placeholder="e.g., 100 lbs or 30 min"
                      />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <FormInput
                        value={ex.note}
                        onValueChange={(value) =>
                          handleChange(i+1, idx, 'note', value)
                        }
                        placeholder="RIR / form cues"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditExercise(i+1, ex)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteExercise(i+1, ex.id as string)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
      
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
        />
      )}
    </div>
  );
}