#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

/**
 * AI Server Manager - Centralized server lifecycle management
 * 
 * Provides robust server management with:
 * - Port availability checking
 * - PID file tracking
 * - Graceful shutdown with fallbacks
 * - Process cleanup utilities
 */
class AIServerManager {
  constructor() {
    this.AI_PORT = 3001;
    this.PID_FILE = path.join(__dirname, '..', '.next-ai', 'server.pid');
    this.LOG_PREFIX = '[AI-SERVER]';
    this.SHUTDOWN_TIMEOUT = 10000; // 10 seconds
    this.STARTUP_TIMEOUT = 15000; // 15 seconds
  }

  /**
   * Log message with timestamp and prefix
   */
  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} ${this.LOG_PREFIX} [${level}] ${message}`);
  }

  /**
   * Check if a port is available
   */
  async checkPort(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => {
          resolve(true); // Port is available
        });
        server.close();
      });
      
      server.on('error', () => {
        resolve(false); // Port is in use
      });
    });
  }

  /**
   * Find process using specific port
   */
  async findProcessByPort(port) {
    return new Promise((resolve) => {
      exec(`lsof -ti :${port}`, (error, stdout) => {
        if (error) {
          resolve(null);
        } else {
          const pid = stdout.trim();
          resolve(pid ? parseInt(pid) : null);
        }
      });
    });
  }

  /**
   * Kill process by PID with graceful fallback
   */
  async killProcess(pid, signal = 'SIGTERM') {
    return new Promise((resolve) => {
      if (!pid) {
        resolve(false);
        return;
      }

      try {
        process.kill(pid, signal);
        this.log(`Sent ${signal} to process ${pid}`);
        
        // Check if process is actually dead
        setTimeout(() => {
          try {
            process.kill(pid, 0); // Check if process exists
            resolve(false); // Process still exists
          } catch (e) {
            resolve(true); // Process is dead
          }
        }, 1000);
      } catch (error) {
        this.log(`Failed to kill process ${pid}: ${error.message}`, 'WARN');
        resolve(false);
      }
    });
  }

  /**
   * Read PID from PID file
   */
  readPidFile() {
    try {
      if (fs.existsSync(this.PID_FILE)) {
        const pid = parseInt(fs.readFileSync(this.PID_FILE, 'utf8').trim());
        return isNaN(pid) ? null : pid;
      }
    } catch (error) {
      this.log(`Failed to read PID file: ${error.message}`, 'WARN');
    }
    return null;
  }

  /**
   * Write PID to PID file
   */
  writePidFile(pid) {
    try {
      const pidDir = path.dirname(this.PID_FILE);
      if (!fs.existsSync(pidDir)) {
        fs.mkdirSync(pidDir, { recursive: true });
      }
      fs.writeFileSync(this.PID_FILE, pid.toString());
      this.log(`Wrote PID ${pid} to ${this.PID_FILE}`);
    } catch (error) {
      this.log(`Failed to write PID file: ${error.message}`, 'ERROR');
    }
  }

  /**
   * Remove PID file
   */
  removePidFile() {
    try {
      if (fs.existsSync(this.PID_FILE)) {
        fs.unlinkSync(this.PID_FILE);
        this.log(`Removed PID file ${this.PID_FILE}`);
      }
    } catch (error) {
      this.log(`Failed to remove PID file: ${error.message}`, 'WARN');
    }
  }

  /**
   * Check if server is responding on the AI port
   */
  async healthCheck() {
    return new Promise((resolve) => {
      const http = require('http');
      const req = http.get(`http://localhost:${this.AI_PORT}`, (res) => {
        resolve(true);
      });
      
      req.on('error', () => {
        resolve(false);
      });
      
      req.setTimeout(3000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Get current server status
   */
  async getStatus() {
    const pid = this.readPidFile();
    const portAvailable = await this.checkPort(this.AI_PORT);
    const portProcess = await this.findProcessByPort(this.AI_PORT);
    const healthOk = await this.healthCheck();

    return {
      pid,
      portAvailable,
      portProcess,
      healthOk,
      running: !portAvailable && healthOk
    };
  }

  /**
   * Comprehensive cleanup of AI processes
   */
  async cleanup() {
    this.log('Starting comprehensive cleanup...');
    let cleaned = false;

    // 1. Try PID file
    const pid = this.readPidFile();
    if (pid) {
      this.log(`Found PID ${pid} in PID file`);
      if (await this.killProcess(pid, 'SIGTERM')) {
        this.log(`Successfully killed process ${pid} via PID file`);
        cleaned = true;
      } else if (await this.killProcess(pid, 'SIGKILL')) {
        this.log(`Force-killed process ${pid} via PID file`);
        cleaned = true;
      }
    }

    // 2. Try port-based lookup
    const portProcess = await this.findProcessByPort(this.AI_PORT);
    if (portProcess && portProcess !== pid) {
      this.log(`Found process ${portProcess} on port ${this.AI_PORT}`);
      if (await this.killProcess(portProcess, 'SIGTERM')) {
        this.log(`Successfully killed process ${portProcess} via port lookup`);
        cleaned = true;
      } else if (await this.killProcess(portProcess, 'SIGKILL')) {
        this.log(`Force-killed process ${portProcess} via port lookup`);
        cleaned = true;
      }
    }

    // 3. Remove PID file
    this.removePidFile();

    // 4. Final verification
    const finalCheck = await this.checkPort(this.AI_PORT);
    if (finalCheck) {
      this.log('Cleanup successful - port is now available');
      return true;
    } else {
      this.log('Cleanup may have failed - port still in use', 'WARN');
      return cleaned;
    }
  }

  /**
   * Start AI development server
   */
  async startServer() {
    this.log('Starting AI development server...');

    // Pre-flight checks
    const status = await this.getStatus();
    if (status.running) {
      this.log('Server already running and healthy');
      return true;
    }

    if (!status.portAvailable) {
      this.log(`Port ${this.AI_PORT} is in use - attempting cleanup...`);
      await this.cleanup();
      
      // Re-check after cleanup
      if (!(await this.checkPort(this.AI_PORT))) {
        this.log(`Failed to free port ${this.AI_PORT}`, 'ERROR');
        return false;
      }
    }

    // Start server
    return new Promise((resolve) => {
      this.log(`Spawning Next.js dev server on port ${this.AI_PORT}...`);
      
      const server = spawn('npx', ['next', 'dev', '--turbopack', '--port', this.AI_PORT], {
        cwd: path.join(__dirname, '..'),
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false
      });

      let resolved = false;
      let startupTimer;

      // Handle server startup
      server.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready') || output.includes('started server')) {
          if (!resolved) {
            resolved = true;
            clearTimeout(startupTimer);
            this.writePidFile(server.pid);
            this.log(`Server started successfully with PID ${server.pid}`);
            resolve(true);
          }
        }
      });

      server.stderr.on('data', (data) => {
        const error = data.toString();
        this.log(`Server stderr: ${error.trim()}`, 'WARN');
      });

      server.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(startupTimer);
          this.log(`Failed to start server: ${error.message}`, 'ERROR');
          resolve(false);
        }
      });

      server.on('exit', (code) => {
        this.removePidFile();
        if (!resolved) {
          resolved = true;
          clearTimeout(startupTimer);
          this.log(`Server exited with code ${code}`, 'ERROR');
          resolve(false);
        } else {
          this.log(`Server process exited with code ${code}`);
        }
      });

      // Startup timeout
      startupTimer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.log('Server startup timeout - killing process...', 'ERROR');
          server.kill('SIGTERM');
          setTimeout(() => server.kill('SIGKILL'), 3000);
          resolve(false);
        }
      }, this.STARTUP_TIMEOUT);

      // Cleanup on script interruption
      process.on('SIGINT', () => {
        this.log('Received SIGINT - cleaning up...');
        server.kill('SIGTERM');
        setTimeout(() => {
          server.kill('SIGKILL');
          process.exit(1);
        }, 3000);
      });
    });
  }

  /**
   * Stop AI server
   */
  async stopServer() {
    this.log('Stopping AI server...');
    
    const status = await this.getStatus();
    if (status.portAvailable) {
      this.log('No server running on AI port');
      this.removePidFile();
      return true;
    }

    return await this.cleanup();
  }

  /**
   * Test AI server (start, verify, stop)
   */
  async testServer() {
    this.log('Testing AI server lifecycle...');

    // Ensure clean start
    await this.cleanup();

    // Start server
    if (!(await this.startServer())) {
      this.log('Failed to start server for testing', 'ERROR');
      return false;
    }

    // Wait for server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Health check
    const healthy = await this.healthCheck();
    if (!healthy) {
      this.log('Server health check failed', 'ERROR');
      await this.cleanup();
      return false;
    }

    this.log('Server health check passed');

    // Stop server
    if (!(await this.stopServer())) {
      this.log('Failed to stop server cleanly', 'WARN');
      return false;
    }

    this.log('AI server test completed successfully');
    return true;
  }
}

// CLI Interface
async function main() {
  const manager = new AIServerManager();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      const started = await manager.startServer();
      process.exit(started ? 0 : 1);
      break;

    case 'stop':
      const stopped = await manager.stopServer();
      process.exit(stopped ? 0 : 1);
      break;

    case 'status':
      const status = await manager.getStatus();
      console.log(JSON.stringify(status, null, 2));
      process.exit(0);
      break;

    case 'cleanup':
      const cleaned = await manager.cleanup();
      process.exit(cleaned ? 0 : 1);
      break;

    case 'test':
      const tested = await manager.testServer();
      process.exit(tested ? 0 : 1);
      break;

    default:
      console.log('Usage: node ai-server-manager.js <command>');
      console.log('Commands: start, stop, status, cleanup, test');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = AIServerManager;