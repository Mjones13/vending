#!/usr/bin/env node

/**
 * Script to detect React act() warnings in test files
 * Runs all test files and captures any act() warnings
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ActWarningDetector {
  constructor() {
    this.results = {
      filesWithWarnings: [],
      totalWarnings: 0,
      testFiles: [],
      summary: ''
    };
  }

  // Get all test files
  getTestFiles() {
    const testDirs = ['__tests__'];
    const testFiles = [];

    testDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir, testFiles);
      }
    });

    return testFiles;
  }

  scanDirectory(dirPath, testFiles) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath, testFiles);
      } else if (item.match(/\.(test|spec)\.(js|jsx|ts|tsx)$/)) {
        testFiles.push(fullPath);
      }
    });
  }

  // Run individual test file and capture act() warnings
  async runTestFile(testFile) {
    console.log(`Checking: ${testFile}`);
    
    try {
      const command = `npm test -- "${testFile}" --silent`;
      const output = execSync(command, { 
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 30000 // 30 second timeout per test file
      });
      
      return this.parseActWarnings(output, testFile);
    } catch (error) {
      // Even if test fails, we can still check for act() warnings in stderr
      const output = error.stdout || '' + (error.stderr || '');
      return this.parseActWarnings(output, testFile);
    }
  }

  // Parse output for act() warnings
  parseActWarnings(output, testFile) {
    const actWarningPatterns = [
      /Warning.*act\(\)/gi,
      /act\(\).*warning/gi,
      /An update inside a test was not wrapped in act/gi,
      /When testing, code that causes React state updates should be wrapped into act/gi
    ];

    const warnings = [];
    const lines = output.split('\n');

    lines.forEach((line, index) => {
      actWarningPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          warnings.push({
            line: index + 1,
            content: line.trim(),
            file: testFile
          });
        }
      });
    });

    return warnings;
  }

  // Run detection on all test files
  async detectWarnings() {
    console.log('🔍 Scanning for React act() warnings in test files...\n');
    
    this.results.testFiles = this.getTestFiles();
    console.log(`Found ${this.results.testFiles.length} test files\n`);

    for (const testFile of this.results.testFiles) {
      const warnings = await this.runTestFile(testFile);
      
      if (warnings.length > 0) {
        this.results.filesWithWarnings.push({
          file: testFile,
          warnings: warnings,
          count: warnings.length
        });
        this.results.totalWarnings += warnings.length;
        console.log(`⚠️  Found ${warnings.length} act() warning(s) in ${testFile}`);
      } else {
        console.log(`✅ No act() warnings in ${testFile}`);
      }
    }

    this.generateSummary();
    return this.results;
  }

  generateSummary() {
    const totalFiles = this.results.testFiles.length;
    const filesWithWarnings = this.results.filesWithWarnings.length;
    const cleanFiles = totalFiles - filesWithWarnings;

    this.results.summary = `
📊 ACT() WARNING DETECTION RESULTS:
=====================================
Total test files: ${totalFiles}
Files with act() warnings: ${filesWithWarnings}
Clean files: ${cleanFiles}
Total act() warnings: ${this.results.totalWarnings}

Coverage: ${Math.round((cleanFiles / totalFiles) * 100)}% of files are act() warning-free
`;

    console.log(this.results.summary);
  }

  // Generate detailed report
  generateReport() {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const reportPath = `act-warnings-report-${timestamp}.json`;

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);

    // Also create a simple text summary
    const summaryPath = `act-warnings-summary-${timestamp}.txt`;
    let summaryText = this.results.summary + '\n\nDETAILED BREAKDOWN:\n';
    
    if (this.results.filesWithWarnings.length === 0) {
      summaryText += '🎉 No act() warnings found! All test files are clean.\n';
    } else {
      this.results.filesWithWarnings.forEach(fileResult => {
        summaryText += `\n${fileResult.file} (${fileResult.count} warnings):\n`;
        fileResult.warnings.forEach(warning => {
          summaryText += `  - Line ${warning.line}: ${warning.content}\n`;
        });
      });
    }

    fs.writeFileSync(summaryPath, summaryText);
    console.log(`📄 Summary report saved to: ${summaryPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const detector = new ActWarningDetector();
  
  detector.detectWarnings()
    .then(results => {
      detector.generateReport();
      
      // Exit with appropriate code
      if (results.totalWarnings > 0) {
        console.log('\n❌ Act() warnings found. Check the reports above.');
        process.exit(1);
      } else {
        console.log('\n✅ No act() warnings detected!');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('Error during detection:', error);
      process.exit(1);
    });
}

module.exports = ActWarningDetector;