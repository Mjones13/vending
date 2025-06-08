#!/usr/bin/env node

// Completely Isolated AI Build Script
// Uses a separate working directory to avoid any interference

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildAIIsolated() {
  console.log('🤖 Building AI with completely isolated process...');
  
  try {
    // Use execSync with a one-liner that doesn't touch config files
    const buildScript = `
      const path = require('path');
      process.chdir('${process.cwd()}');
      
      // Override Next.js config resolution
      const originalResolve = require.resolve;
      require.resolve = function(id, options) {
        if (id === './next.config' || id === './next.config.js' || id === './next.config.ts') {
          return path.resolve('./next.config.ai.js');
        }
        return originalResolve(id, options);
      };
      
      // Import and run Next.js build
      const { build } = require('next/dist/build');
      
      build(process.cwd(), {
        reactStrictMode: true,
        distDir: '.next-ai'
      }).then(() => {
        console.log('✅ AI build completed successfully in .next-ai directory');
        process.exit(0);
      }).catch(error => {
        console.error('❌ AI build failed:', error.message);
        process.exit(1);
      });
    `;
    
    // Write the isolated build script
    const tempScript = 'temp-isolated-build.js';
    fs.writeFileSync(tempScript, buildScript);
    
    // Execute the isolated build
    execSync(`node ${tempScript}`, { stdio: 'inherit' });
    
    // Clean up
    fs.unlinkSync(tempScript);
    
  } catch (error) {
    // Clean up on error
    const tempScript = 'temp-isolated-build.js';
    if (fs.existsSync(tempScript)) {
      fs.unlinkSync(tempScript);
    }
    
    console.error('❌ Isolated AI build failed:', error.message);
    process.exit(1);
  }
}

buildAIIsolated();