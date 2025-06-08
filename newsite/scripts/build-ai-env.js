#!/usr/bin/env node

// Environment-based AI Build Script
// Uses AI_BUILD environment variable to trigger AI configuration

const { execSync } = require('child_process');
const fs = require('fs');

async function buildAIWithEnv() {
  console.log('🤖 Building with AI configuration using environment variable...');
  
  try {
    // Check if we need to temporarily switch to environment-based config
    const useEnvConfig = !fs.existsSync('next.config.js') && fs.existsSync('next.config.ts');
    
    if (useEnvConfig) {
      // Temporarily replace config with environment-aware version
      fs.renameSync('next.config.ts', 'next.config.ts.backup');
      fs.copyFileSync('next.config.ai-env.js', 'next.config.js');
    }
    
    // Run build with AI_BUILD environment variable
    execSync('npx next build', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        AI_BUILD: 'true'
      }
    });
    
    // Restore original config if we changed it
    if (useEnvConfig) {
      fs.unlinkSync('next.config.js');
      fs.renameSync('next.config.ts.backup', 'next.config.ts');
    }
    
    console.log('✅ AI build completed successfully in .next-ai directory');
    
  } catch (error) {
    // Restore config on error
    try {
      if (fs.existsSync('next.config.js') && fs.existsSync('next.config.ts.backup')) {
        fs.unlinkSync('next.config.js');
        fs.renameSync('next.config.ts.backup', 'next.config.ts');
      }
    } catch (restoreError) {
      console.error('Error restoring config:', restoreError.message);
    }
    
    console.error('❌ AI build failed:', error.message);
    process.exit(1);
  }
}

buildAIWithEnv();