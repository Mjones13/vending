#!/usr/bin/env node

// AI Agent Build Script
// Uses next.config.ai.js to build into .next-ai directory

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Temporarily rename configs to force Next.js to use AI config
const originalConfig = 'next.config.ts';
const aiConfig = 'next.config.ai.js';
const tempConfig = 'next.config.temp.ts';

async function buildWithAIConfig() {
  try {
    // Backup original config
    if (fs.existsSync(originalConfig)) {
      fs.renameSync(originalConfig, tempConfig);
    }
    
    // Rename AI config to be the active config
    fs.renameSync(aiConfig, originalConfig.replace('.ts', '.js'));
    
    console.log('🤖 Building with AI configuration (output: .next-ai)...');
    
    // Run the build
    const buildProcess = spawn('npx', ['next', 'build'], {
      stdio: 'inherit',
      shell: true
    });
    
    buildProcess.on('close', (code) => {
      // Restore configs regardless of build result
      try {
        // Restore AI config
        fs.renameSync(originalConfig.replace('.ts', '.js'), aiConfig);
        
        // Restore original config
        if (fs.existsSync(tempConfig)) {
          fs.renameSync(tempConfig, originalConfig);
        }
        
        if (code === 0) {
          console.log('✅ AI build completed successfully in .next-ai directory');
        } else {
          console.error('❌ AI build failed');
          process.exit(code);
        }
      } catch (restoreError) {
        console.error('❌ Error restoring configs:', restoreError);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Error setting up AI build:', error);
    
    // Attempt to restore configs on error
    try {
      if (fs.existsSync(originalConfig.replace('.ts', '.js'))) {
        fs.renameSync(originalConfig.replace('.ts', '.js'), aiConfig);
      }
      if (fs.existsSync(tempConfig)) {
        fs.renameSync(tempConfig, originalConfig);
      }
    } catch (restoreError) {
      console.error('❌ Error restoring configs after failure:', restoreError);
    }
    
    process.exit(1);
  }
}

buildWithAIConfig();