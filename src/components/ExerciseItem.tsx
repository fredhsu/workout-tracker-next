import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { ExerciseEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExerciseItemProps {
    exercise: ExerciseEntry;
    isCompleted: boolean;
    onToggleComplete: (id: string) => void;
    onEdit: (exercise: ExerciseEntry) => void;
    onDelete: (id: string) => void;
}

export default function ExerciseItem({
    exercise,
    isCompleted,
    onToggleComplete,
    onEdit,
    onDelete
}: ExerciseItemProps) {
    return (
        <div className={cn(
            "group flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
            isCompleted
                ? "bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-800"
                : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm dark:bg-gray-800 dark:border-gray-700"
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

                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Sets:</span> {exercise.sets}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Reps:</span> {exercise.reps}
                    </span>
                    {exercise.weight && (
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Weight:</span> {exercise.weight}
                        </span>
                    )}
                </div>

                {exercise.note && (
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 italic">
                        {exercise.note}
                    </p>
                )}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(exercise)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exercise.id && onDelete(exercise.id)} className="text-red-600 focus:text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
