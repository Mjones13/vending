#!/usr/bin/env node

// AI Agent Build Script
// Uses next.config.ai.js to build into .next-ai directory

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Build with AI config using environment variable approach
const originalConfig = 'next.config.ts';
const aiConfig = 'next.config.ai.js';

async function buildWithAIConfig() {
  try {
    // Check if dev server is running by testing ports
    const net = require('net');
    const isPortInUse = (port) => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
          server.close(() => resolve(false));
        });
        server.on('error', () => resolve(true));
      });
    };

    const devServerRunning = await isPortInUse(3000) || await isPortInUse(3001);
    if (devServerRunning) {
      console.log('⚠️  Dev server detected. Using alternative build method to avoid interference...');
    }

    // Use a copy-based approach instead of renaming to avoid triggering dev server restarts
    const tempConfig = 'next.config.build.js';
    fs.copyFileSync(aiConfig, tempConfig);
    
    console.log('🤖 Building with AI configuration (output: .next-ai)...');
    
    // Run the build with the temporary config
    const buildProcess = spawn('npx', ['next', 'build'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NEXT_CONFIG: tempConfig
      }
    });
    
    buildProcess.on('close', (code) => {
      // Clean up temporary config
      try {
        if (fs.existsSync(tempConfig)) {
          fs.unlinkSync(tempConfig);
        }
        
        if (code === 0) {
          console.log('✅ AI build completed successfully in .next-ai directory');
        } else {
          console.error('❌ AI build failed');
          process.exit(code);
        }
      } catch (cleanupError) {
        console.error('❌ Error during cleanup:', cleanupError);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Error setting up AI build:', error);
    
    // Clean up temporary config on error
    try {
      const tempConfig = 'next.config.build.js';
      if (fs.existsSync(tempConfig)) {
        fs.unlinkSync(tempConfig);
      }
    } catch (cleanupError) {
      console.error('❌ Error cleaning up after failure:', cleanupError);
    }
    
    process.exit(1);
  }
}

buildWithAIConfig();