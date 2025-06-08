#!/usr/bin/env node

// Simple AI Agent Build Script
// Builds in a separate process with minimal interference

const { execSync } = require('child_process');
const fs = require('fs');

async function buildAI() {
  try {
    console.log('🤖 Building with AI configuration (output: .next-ai)...');
    
    // Temporarily make the AI config the primary config
    const originalExists = fs.existsSync('next.config.ts');
    const backupName = 'next.config.backup.ts';
    
    // Quick backup and swap
    if (originalExists) {
      fs.renameSync('next.config.ts', backupName);
    }
    fs.copyFileSync('next.config.ai.js', 'next.config.js');
    
    // Run build
    execSync('npx next build', { stdio: 'inherit' });
    
    // Quick restore
    fs.unlinkSync('next.config.js');
    if (originalExists) {
      fs.renameSync(backupName, 'next.config.ts');
    }
    
    console.log('✅ AI build completed successfully in .next-ai directory');
    
  } catch (error) {
    // Restore configs on any error
    try {
      if (fs.existsSync('next.config.js')) {
        fs.unlinkSync('next.config.js');
      }
      if (fs.existsSync('next.config.backup.ts')) {
        fs.renameSync('next.config.backup.ts', 'next.config.ts');
      }
    } catch (restoreError) {
      console.error('Error restoring configs:', restoreError);
    }
    
    console.error('❌ AI build failed');
    process.exit(1);
  }
}

buildAI();