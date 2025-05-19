# Workout Tracker

A Next.js application for tracking workout progress with a database backend.

## Features

- Track exercises, sets, reps, weights, and notes for each workout
- Weekly workout organization with pre-defined templates
- Edit exercise details and customize workouts
- Add and remove exercises from your workout days
- Import and export workouts via JSON
- Data persistence with Prisma ORM and database storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database or SQLite (configured by default for easy development)

### Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. The project is configured to use SQLite by default for easy development. 
   If you want to use PostgreSQL, update the connection string in `.env`

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Importing and Exporting Workouts

This application supports importing and exporting workouts via JSON:

1. **Exporting**: Click the "Export" button to download your current week's workout data as a JSON file
2. **Importing**: Click the "Import" button and select a properly formatted JSON file to bulk-import workout data
3. Need help? Click "Download Template" in the import dialog to get a sample format

## Database Schema

- **User**: Stores user information
- **Workout**: Represents a workout session for a specific day and week
- **Exercise**: Contains the details of each exercise in a workout

## Technologies

- Next.js 15
- React 19
- Prisma ORM
- SQLite/PostgreSQL
- TypeScript
- Tailwind CSS
- shadcn/ui components

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Prisma Documentation](https://www.prisma.io/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.