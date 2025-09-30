import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/workouts
export async function GET(request: NextRequest) {
  try {
    // Parse userId and weekNumber from query params
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const weekNumber = searchParams.get('weekNumber');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const where = { 
      userId,
      ...(weekNumber ? { weekNumber: parseInt(weekNumber) } : {})
    };

    const workouts = await prisma.workout.findMany({
      where,
      include: {
        exercises: true,
      },
      orderBy: [
        { weekNumber: 'asc' },
        { dayNumber: 'asc' },
      ],
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}

// POST /api/workouts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, weekNumber, dayNumber, exercises } = body;

    if (!userId || weekNumber === undefined || dayNumber === undefined || !exercises) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if workout already exists for this user, week and day
    const existingWorkout = await prisma.workout.findUnique({
      where: {
        userId_weekNumber_dayNumber: {
          userId,
          weekNumber,
          dayNumber,
        },
      },
    });

    // If workout exists, update it
    if (existingWorkout) {
      // Delete existing exercises
      await prisma.exercise.deleteMany({
        where: { workoutId: existingWorkout.id },
      });

      // Update workout and create new exercises
      const updatedWorkout = await prisma.workout.update({
        where: { id: existingWorkout.id },
        data: {
          exercises: {
            create: exercises.map(({ id, workoutId, ...rest }: any) => rest),
          },
        },
        include: {
          exercises: true,
        },
      });

      return NextResponse.json(updatedWorkout);
    }

    // Otherwise, create new workout
    const workout = await prisma.workout.create({
      data: {
        userId,
        weekNumber,
        dayNumber,
        exercises: {
          create: exercises.map(({ id, workoutId, ...rest }: any) => rest),
        },
      },
      include: {
        exercises: true,
      },
    });

    return NextResponse.json(workout);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}