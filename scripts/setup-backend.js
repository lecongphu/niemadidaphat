/**
 * Script để setup backend server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up backend server...\n');

const serverDir = path.join(__dirname, '..', 'server');

// Check if server directory exists
if (!fs.existsSync(serverDir)) {
  console.error('❌ Server directory not found!');
  process.exit(1);
}

// Install dependencies
console.log('📦 Installing backend dependencies...');
try {
  execSync('npm install', { 
    cwd: serverDir, 
    stdio: 'inherit',
    shell: true 
  });
  console.log('✅ Backend dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Check for .env file
const envPath = path.join(serverDir, '.env');
const envTemplatePath = path.join(serverDir, 'env-template.txt');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found in server directory');
  console.log('📝 Please copy env-template.txt to .env and fill in the values:');
  console.log(`   cp ${envTemplatePath} ${envPath}\n`);
} else {
  console.log('✅ .env file found\n');
}

console.log('🎉 Backend setup complete!');
console.log('\nTo start the backend server:');
console.log('  cd server');
console.log('  npm run dev\n');
