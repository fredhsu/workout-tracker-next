import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { ExerciseEntry } from '@/lib/types';
import ExerciseItem from './ExerciseItem';
import { cn } from '@/lib/utils';

interface DayCardProps {
    dayNumber: number;
    dayName: string;
    exercises: ExerciseEntry[];
    isExpanded: boolean;
    onToggleExpand: (day: number) => void;
    onAddExercise: (day: number) => void;
    onQuickAdd: (day: number) => void;
    onEditExercise: (day: number, exercise: ExerciseEntry) => void;
    onDeleteExercise: (day: number, id: string) => void;
    onToggleComplete: (id: string, current: boolean) => void;
}

export default function DayCard({
    dayNumber,
    dayName,
    exercises,
    isExpanded,
    onToggleExpand,
    onAddExercise,
    onQuickAdd,
    onEditExercise,
    onDeleteExercise,
    onToggleComplete
}: DayCardProps) {
    const completedCount = exercises.filter(ex => ex.completed).length;
    const totalCount = exercises.length;
    const isComplete = totalCount > 0 && completedCount === totalCount;

    return (
        <Card className={cn(
            "transition-all duration-300 border-transparent",
            isExpanded
                ? "shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                : "shadow-sm hover:shadow-md bg-white/50 dark:bg-gray-800/50"
        )}>
            <div
                className="p-4 cursor-pointer select-none"
                onClick={() => onToggleExpand(dayNumber)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-xl font-bold text-lg transition-colors",
                            isComplete
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : totalCount > 0
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                            {dayNumber}
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{dayName}</h3>
                            {totalCount > 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {completedCount}/{totalCount} completed
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isExpanded && (
                            <div className="flex gap-1 mr-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onQuickAdd(dayNumber);
                                    }}
                                    className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                    <Zap className="h-4 w-4 mr-1.5" />
                                    Quick
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddExercise(dayNumber);
                                    }}
                                    className="h-8 px-2"
                                >
                                    <Plus className="h-4 w-4 mr-1.5" />
                                    Add
                                </Button>
                            </div>
                        )}
                        <div className={cn(
                            "p-1 rounded-full transition-transform duration-300",
                            isExpanded ? "rotate-180 bg-gray-100 dark:bg-gray-800" : ""
                        )}>
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                    {exercises.length > 0 ? (
                        <div className="space-y-2 mt-2">
                            {exercises.map((exercise, idx) => (
                                <ExerciseItem
                                    key={exercise.id || idx}
                                    exercise={exercise}
                                    isCompleted={!!exercise.completed}
                                    onToggleComplete={(id) => onToggleComplete(id, !!exercise.completed)}
                                    onEdit={(ex) => onEditExercise(dayNumber, ex)}
                                    onDelete={(id) => onDeleteExercise(dayNumber, id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg mt-2">
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No exercises planned for this day</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddExercise(dayNumber)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Exercise
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
