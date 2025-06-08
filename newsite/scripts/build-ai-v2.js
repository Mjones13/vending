#!/usr/bin/env node

// AI Agent Build Script - Version 2
// Uses isolated process to build with AI config without interfering with dev servers

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildWithAIConfig() {
  console.log('🤖 Starting AI build with isolated configuration...');
  
  // Create a standalone build command that uses the AI config directly
  const buildCommand = `
    const nextConfig = require('./next.config.ai.js');
    const { build } = require('next/dist/build');
    const { resolve } = require('path');
    
    async function runBuild() {
      process.chdir('${process.cwd()}');
      try {
        await build(process.cwd(), nextConfig);
        console.log('✅ AI build completed successfully in .next-ai directory');
        process.exit(0);
      } catch (error) {
        console.error('❌ AI build failed:', error.message);
        process.exit(1);
      }
    }
    
    runBuild();
  `;

  // Write temporary build script
  const tempBuildScript = 'temp-ai-build.js';
  fs.writeFileSync(tempBuildScript, buildCommand);

  try {
    // Run the isolated build
    const buildProcess = spawn('node', [tempBuildScript], {
      stdio: 'inherit',
      shell: false
    });

    buildProcess.on('close', (code) => {
      // Clean up temporary script
      try {
        if (fs.existsSync(tempBuildScript)) {
          fs.unlinkSync(tempBuildScript);
        }
      } catch (cleanupError) {
        console.error('Warning: Could not clean up temporary build script');
      }

      if (code !== 0) {
        process.exit(code);
      }
    });

    buildProcess.on('error', (error) => {
      console.error('❌ Build process error:', error);
      
      // Clean up on error
      try {
        if (fs.existsSync(tempBuildScript)) {
          fs.unlinkSync(tempBuildScript);
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Error starting AI build:', error);
    
    // Clean up on error
    try {
      if (fs.existsSync(tempBuildScript)) {
        fs.unlinkSync(tempBuildScript);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}

buildWithAIConfig();