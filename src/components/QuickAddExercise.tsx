'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Zap } from 'lucide-react';
import { ExerciseEntry } from '@/lib/types';

interface QuickAddExerciseProps {
  onAddExercise: (exercise: ExerciseEntry) => void;
  onClose: () => void;
}

const commonExercises = [
  { name: 'Push-ups', sets: 3, reps: '10-15' },
  { name: 'Squats', sets: 3, reps: '12-15' },
  { name: 'Plank', sets: 3, reps: '30-60s' },
  { name: 'Jumping Jacks', sets: 3, reps: '20-30' },
  { name: 'Lunges', sets: 3, reps: '10 per leg' },
  { name: 'Mountain Climbers', sets: 3, reps: '15-20' },
  { name: 'Burpees', sets: 3, reps: '5-10' },
  { name: 'Bench Press', sets: 3, reps: '8-10' },
  { name: 'Deadlift', sets: 3, reps: '5-8' },
  { name: 'Pull-ups', sets: 3, reps: 'AMRAP 5-10' },
];

export default function QuickAddExercise({ onAddExercise, onClose }: QuickAddExerciseProps) {
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleQuickAdd = (template: { name: string; sets: number; reps: string }) => {
    const exercise: ExerciseEntry = {
      name: template.name,
      sets: template.sets,
      reps: template.reps,
      weight: '',
      note: ''
    };
    onAddExercise(exercise);
    onClose();
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;
    
    const exercise: ExerciseEntry = {
      name: customName.trim(),
      sets: 3,
      reps: '8-10',
      weight: '',
      note: ''
    };
    onAddExercise(exercise);
    onClose();
  };

  return (
    <Card className="mb-4 border-dashed border-2 border-blue-200 bg-blue-50/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-900">Quick Add Exercise</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {!showCustom ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {commonExercises.map((exercise, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(exercise)}
                  className="justify-start h-auto py-2 text-left"
                >
                  <div>
                    <div className="font-medium text-xs">{exercise.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {exercise.sets} × {exercise.reps}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustom(true)}
              className="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Custom Exercise
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Exercise name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
                className="text-sm"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleCustomAdd}
                disabled={!customName.trim()}
              >
                Add
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustom(false)}
              className="text-xs text-gray-500"
            >
              ← Back to templates
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}