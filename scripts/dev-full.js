/**
 * Script để chạy cả backend và frontend cùng lúc
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting full development environment...\n');

// Start backend server
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'server'),
  shell: true,
  stdio: 'inherit'
});

// Start frontend
console.log('🎨 Starting frontend...\n');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..'),
  shell: true,
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping all processes...');
  backend.kill();
  frontend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping all processes...');
  backend.kill();
  frontend.kill();
  process.exit();
});
