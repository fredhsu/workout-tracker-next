import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateWorkoutImport, WorkoutImportData } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, data, targetWeek } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Import data is required' },
        { status: 400 }
      );
    }

    // Validate import data structure
    const validation = validateWorkoutImport(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid import data', details: validation.errors },
        { status: 400 }
      );
    }

    const importData = data as WorkoutImportData;
    const { days } = importData;

    // Calculate the next available week number if targetWeek is not provided
    let weekNumber: number;
    if (targetWeek) {
      weekNumber = targetWeek;
    } else {
      // Find the maximum week number for this user and add 1
      const existingWorkouts = await prisma.workout.findMany({
        where: { userId },
        select: { weekNumber: true },
        orderBy: { weekNumber: 'desc' },
        take: 1,
      });

      const maxWeek = existingWorkouts.length > 0 ? existingWorkouts[0].weekNumber : 0;
      weekNumber = maxWeek + 1;
      console.log('Auto-assigning week number:', weekNumber, '(max existing week:', maxWeek, ')');
    }

    // Process each day's workouts in parallel using Promise.all
    const importPromises = Object.entries(days).map(async ([dayKey, exercises]) => {
      console.log('Processing day:', dayKey, 'with', exercises.length, 'exercises');
      
      // Handle both number and string day keys
      const dayNumber = parseInt(dayKey, 10);
      
      if (isNaN(dayNumber)) {
        console.error('Invalid day key:', dayKey);
        return null;
      }

      // Check if workout already exists for this user, week, and day
      const existingWorkout = await prisma.workout.findUnique({
        where: {
          userId_weekNumber_dayNumber: {
            userId,
            weekNumber,
            dayNumber,
          },
        },
      });

      if (existingWorkout) {
        // Delete existing exercises
        await prisma.exercise.deleteMany({
          where: { workoutId: existingWorkout.id },
        });

        // Update workout with new exercises
        return prisma.workout.update({
          where: { id: existingWorkout.id },
          data: {
            exercises: {
              create: exercises,
            },
          },
          include: {
            exercises: true,
          },
        });
      } else {
        // Create new workout with exercises
        return prisma.workout.create({
          data: {
            userId,
            weekNumber,
            dayNumber,
            exercises: {
              create: exercises,
            },
          },
          include: {
            exercises: true,
          },
        });
      }
    });

    // Wait for all workouts to be processed
    const resultsWithNull = await Promise.all(importPromises);
    const results = resultsWithNull.filter(result => result !== null);
    
    console.log('Import completed with', results.length, 'days processed');

    return NextResponse.json({
      success: true,
      message: 'Workouts imported successfully',
      results,
      weekNumber: weekNumber, // Return the actual imported week number
      dayCount: Object.keys(importData.days).length, // Return number of days imported 
      processedDays: results.length, // How many days were actually processed
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import workouts' },
      { status: 500 }
    );
  }
}