import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Edit2, Trash2, MoreHorizontal, Save, X } from 'lucide-react';
import { ExerciseEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';

interface ExerciseItemProps {
    exercise: ExerciseEntry;
    isCompleted: boolean;
    onToggleComplete: (exerciseId: string) => void;
    onEdit: (updatedExercise: ExerciseEntry) => void;
    onInlineSave?: (updatedExercise: ExerciseEntry) => void;
    onDelete: (exerciseId: string) => void;
}

export default function ExerciseItem({
    exercise,
    isCompleted,
    onToggleComplete,
    onEdit,
    onInlineSave,
    onDelete
}: ExerciseItemProps) {
    const [isInlineEditing, setIsInlineEditing] = useState(false);
    const [editedSets, setEditedSets] = useState(exercise.sets.toString());
    const [editedReps, setEditedReps] = useState(exercise.reps);
    const [editedWeight, setEditedWeight] = useState(exercise.weight || '');

    const handleSaveInline = () => {
        const updatedExercise = {
            ...exercise,
            sets: parseInt(editedSets) || exercise.sets,
            reps: editedReps,
            weight: editedWeight,
        };
        // Use onInlineSave if available, otherwise fall back to onEdit
        if (onInlineSave) {
            onInlineSave(updatedExercise);
        } else {
            onEdit(updatedExercise);
        }
        setIsInlineEditing(false);
    };

    const handleCancelInline = () => {
        setEditedSets(exercise.sets.toString());
        setEditedReps(exercise.reps);
        setEditedWeight(exercise.weight || '');
        setIsInlineEditing(false);
    };

    const handleStartInlineEdit = () => {
        setEditedSets(exercise.sets.toString());
        setEditedReps(exercise.reps);
        setEditedWeight(exercise.weight || '');
        setIsInlineEditing(true);
    };

    return (
        <div className={cn(
            "group flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
            isCompleted
                ? "bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-800"
                : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700",
            isInlineEditing && "ring-2 ring-blue-300 border-blue-300"
        )}>
            <button
                onClick={() => exercise.id && onToggleComplete(exercise.id)}
                className={cn(
                    "mt-1 flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                    isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 text-transparent hover:border-green-500"
                )}
            >
                <Check className="h-3 w-3" strokeWidth={3} />
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className={cn(
                        "font-medium text-sm truncate pr-2",
                        isCompleted ? "text-gray-500 line-through" : "text-gray-900 dark:text-gray-100"
                    )}>
                        {exercise.name}
                    </h4>
                </div>

                {!isInlineEditing ? (
                    <>
                        <div
                            className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={handleStartInlineEdit}
                            title="Click to edit sets, reps, and weight"
                        >
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Sets:</span> {exercise.sets}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Reps:</span> {exercise.reps}
                            </span>
                            {exercise.weight ? (
                                <span className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Weight:</span> {exercise.weight}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-blue-500">
                                    <span className="font-medium">+ Add weight</span>
                                </span>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="mt-2 space-y-2">
                        <div className="flex gap-2 flex-wrap">
                            <div className="flex items-center gap-1">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Sets:</label>
                                <Input
                                    type="number"
                                    value={editedSets}
                                    onChange={(e) => setEditedSets(e.target.value)}
                                    className="h-7 w-16 text-xs"
                                    min="1"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Reps:</label>
                                <Input
                                    type="text"
                                    value={editedReps}
                                    onChange={(e) => setEditedReps(e.target.value)}
                                    className="h-7 w-20 text-xs"
                                    placeholder="8-10"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Weight:</label>
                                <Input
                                    type="text"
                                    value={editedWeight}
                                    onChange={(e) => setEditedWeight(e.target.value)}
                                    className="h-7 w-24 text-xs"
                                    placeholder="e.g. 135 lbs"
                                />
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="default"
                                onClick={handleSaveInline}
                                className="h-7 px-2 text-xs"
                            >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelInline}
                                className="h-7 px-2 text-xs"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {exercise.note && !isInlineEditing && (
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 italic">
                        {exercise.note}
                    </p>
                )}
            </div>

            {!isInlineEditing && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleStartInlineEdit}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Quick Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(exercise)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Full Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exercise.id && onDelete(exercise.id)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}
