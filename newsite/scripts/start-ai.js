#!/usr/bin/env node

// AI Agent Start Script
// Serves the AI build from .next-ai directory on port 3001

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function startAIServer() {
  // Check if AI build exists
  if (!fs.existsSync('.next-ai')) {
    console.error('❌ AI build not found. Run "npm run build:ai" first.');
    process.exit(1);
  }

  // Temporarily rename directories to serve from AI build
  const originalNext = '.next';
  const aiNext = '.next-ai';
  const tempNext = '.next-temp';

  try {
    // Backup original .next if it exists
    if (fs.existsSync(originalNext)) {
      fs.renameSync(originalNext, tempNext);
    }

    // Move AI build to be the active build
    fs.renameSync(aiNext, originalNext);

    console.log('🤖 Starting AI server on port 3001...');
    console.log('📁 Serving from .next-ai build artifacts');

    // Start the server
    const serverProcess = spawn('npx', ['next', 'start', '--port', '3001'], {
      stdio: 'inherit',
      shell: true
    });

    // Handle cleanup on exit
    const cleanup = () => {
      try {
        // Restore directories
        if (fs.existsSync(originalNext)) {
          fs.renameSync(originalNext, aiNext);
        }
        if (fs.existsSync(tempNext)) {
          fs.renameSync(tempNext, originalNext);
        }
        console.log('\n🧹 Cleanup completed');
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
      }
    };

    // Handle various exit scenarios
    process.on('SIGINT', () => {
      console.log('\n⏹️  Stopping AI server...');
      serverProcess.kill('SIGINT');
      cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      serverProcess.kill('SIGTERM');
      cleanup();
      process.exit(0);
    });

    serverProcess.on('close', (code) => {
      cleanup();
      process.exit(code);
    });

  } catch (error) {
    console.error('❌ Error starting AI server:', error);
    
    // Attempt cleanup on error
    try {
      if (fs.existsSync(originalNext)) {
        fs.renameSync(originalNext, aiNext);
      }
      if (fs.existsSync(tempNext)) {
        fs.renameSync(tempNext, originalNext);
      }
    } catch (cleanupError) {
      console.error('❌ Error during error cleanup:', cleanupError);
    }
    
    process.exit(1);
  }
}

startAIServer();