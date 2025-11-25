#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up database...\n');

const prismaDir = path.join(__dirname, '..', 'prisma');
const dbPath = path.join(prismaDir, 'dev.db');

// Check if prisma directory exists
if (!fs.existsSync(prismaDir)) {
  console.error('❌ Error: prisma directory not found');
  process.exit(1);
}

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated\n');

  // Step 2: Run migrations
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations completed\n');

  // Step 3: Check database file
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log(`✅ Database file exists: ${dbPath}`);
    console.log(`   Size: ${stats.size} bytes`);
    console.log(`   Writable: ${(stats.mode & 0o200) !== 0}\n`);
  } else {
    console.log('⚠️  Database file not found, it will be created on first use\n');
  }

  console.log('✅ Database setup complete!');
  console.log('\nYou can now run:');
  console.log('  npm run dev   (for development)');
  console.log('  npm run build (to build for production)');
  console.log('  npm run start (to start production server)');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  console.error('\nTry running these commands manually:');
  console.error('  npx prisma generate');
  console.error('  npx prisma migrate deploy');
  process.exit(1);
}
