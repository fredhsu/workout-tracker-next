import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Dumbbell, Activity } from 'lucide-react';

interface StatsOverviewProps {
    totalWorkouts: number;
    totalExercises: number;
    completedExercises: number;
}

export default function StatsOverview({
    totalWorkouts,
    totalExercises,
    completedExercises
}: StatsOverviewProps) {
    const completionPercentage = totalExercises > 0
        ? Math.round((completedExercises / totalExercises) * 100)
        : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                        <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Days Planned</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalWorkouts}</h3>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                        <Dumbbell className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300">Total Exercises</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalExercises}</h3>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                        <CheckCircle2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-violet-600 dark:text-violet-300">Completion</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completionPercentage}%</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">({completedExercises}/{totalExercises})</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
