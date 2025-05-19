import WorkoutTrackerApp from '@/components/WorkoutTrackerApp.tsx'
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Workout Tracker</h1>
      <WorkoutTrackerApp />
    </main>
  );
}
