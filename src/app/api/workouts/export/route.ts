import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { WorkoutImportData } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const weekNumber = searchParams.get('weekNumber');

    if (!userId || !weekNumber) {
      return NextResponse.json(
        { error: 'User ID and Week Number are required' },
        { status: 400 }
      );
    }

    const weekNum = parseInt(weekNumber, 10);
    if (isNaN(weekNum)) {
      return NextResponse.json(
        { error: 'Week Number must be a valid number' },
        { status: 400 }
      );
    }

    // Fetch all workouts for the specified user and week
    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        weekNumber: weekNum,
      },
      include: {
        exercises: {
          select: {
            id: true,
            name: true,
            sets: true,
            reps: true,
            weight: true,
            note: true,
          },
        },
      },
    });

    // Format the data for export
    const exportData: WorkoutImportData = {
      weekNumber: weekNum,
      days: {},
    };

    // Organize exercises by day
    workouts.forEach((workout) => {
      const { dayNumber, exercises } = workout;
      
      // Format exercises to match import format (omitting workoutId and timestamps)
      const formattedExercises = exercises.map(({ id, name, sets, reps, weight, note }) => ({
        name,
        sets,
        reps,
        weight: weight || '',
        note: note || '',
      }));
      
      exportData.days[dayNumber] = formattedExercises;
    });

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export workouts' },
      { status: 500 }
    );
  }
}