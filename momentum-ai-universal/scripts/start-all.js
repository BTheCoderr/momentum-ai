const { spawn } = require('child_process');
const path = require('path');

// Start AI service
const aiService = spawn('python', ['react_native_integration.py'], {
  cwd: path.join(__dirname, '../ai-service'),
  stdio: 'inherit',
  shell: true
});

// Start Expo app
const expoApp = spawn('npx', ['expo', 'start', '--go'], {
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  aiService.kill();
  expoApp.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  aiService.kill();
  expoApp.kill();
  process.exit();
});

// Handle child process errors
aiService.on('error', (error) => {
  console.error('AI Service Error:', error);
});

expoApp.on('error', (error) => {
  console.error('Expo App Error:', error);
});

// Log when processes exit
aiService.on('exit', (code) => {
  console.log(`AI Service exited with code ${code}`);
});

expoApp.on('exit', (code) => {
  console.log(`Expo App exited with code ${code}`);
}); 