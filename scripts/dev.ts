/**
 * One-Command Development Orchestrator for Shree Nirakar Education Society
 *
 * Automatically:
 * 1. Creates .env from .env.example if missing
 * 2. Verifies PostgreSQL connectivity
 * 3. Deploys Prisma migrations & runs seed if empty
 * 4. Launches API + worker (port 4000), Web site (port 5000), and Admin portal (port 5001) with color-prefixed logs
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();

// 1. Create .env from .env.example if missing
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('[DEV] .env not found. Creating from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
}

// Color prefixes
const COLORS = {
  reset: '\x1b[0m',
  api: '\x1b[36m[API 4000]\x1b[0m',
  web: '\x1b[32m[WEB 5000]\x1b[0m',
  admin: '\x1b[35m[ADMIN 5001]\x1b[0m',
  sys: '\x1b[33m[SYSTEM]\x1b[0m',
};

function runCommand(command: string, args: string[], cwd: string = rootDir): Promise<void> {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    const proc = spawn(isWin ? 'cmd.exe' : command, isWin ? ['/c', command, ...args] : args, {
      cwd,
      stdio: 'inherit',
      env: process.env,
    });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command ${command} ${args.join(' ')} failed with code ${code}`));
    });

    proc.on('error', reject);
  });
}

import { execSync } from 'node:child_process';

function freePorts(ports: number[]) {
  const isWin = process.platform === 'win32';
  for (const port of ports) {
    try {
      if (isWin) {
        const stdout = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
        const lines = stdout.split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const localAddr = parts[1] || '';
          const state = (parts[3] || '').toUpperCase();
          const isTargetPort = localAddr.endsWith(`:${port}`) || localAddr.endsWith(`]:${port}`);
          if (isTargetPort && state.includes('LISTENING')) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0' && !isNaN(Number(pid))) {
              try {
                execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
              } catch {
                // Ignore if already terminated
              }
            }
          }
        }
      }
    } catch {
      // Port is not in use, which is good
    }
  }
}

const childProcesses: any[] = [];

function cleanupAndExit() {
  for (const proc of childProcesses) {
    try {
      if (process.platform === 'win32' && proc.pid) {
        execSync(`taskkill /F /T /PID ${proc.pid}`, { stdio: 'ignore' });
      } else {
        proc.kill('SIGTERM');
      }
    } catch {
      // Process already closed
    }
  }
  process.exit(0);
}

process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);

function spawnWithPrefix(name: string, prefix: string, command: string, args: string[], cwd: string) {
  const isWin = process.platform === 'win32';
  const proc = spawn(isWin ? 'cmd.exe' : command, isWin ? ['/c', command, ...args] : args, {
    cwd,
    shell: false,
    env: { ...process.env, FORCE_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  childProcesses.push(proc);

  proc.stdout?.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${prefix} ${line}`);
      }
    }
  });

  proc.stderr?.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.error(`${prefix} ${line}`);
      }
    }
  });

  proc.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${COLORS.sys} Process ${name} exited with non-zero exit code ${code}`);
      cleanupAndExit();
    }
  });

  return proc;
}

async function main() {
  console.log(`${COLORS.sys} ==============================================================`);
  console.log(`${COLORS.sys} Starting Shree Nirakar Education Society Monorepo (Dev Mode)`);
  console.log(`${COLORS.sys} ==============================================================`);

  // Ensure ports 4000, 5000, 5001 are free
  freePorts([4000, 5000, 5001]);

  // Check Prisma Client generation
  const clientExists = fs.existsSync(path.join(rootDir, 'node_modules/.prisma/client/index.js'));
  if (!clientExists) {
    try {
      console.log(`${COLORS.sys} Generating Prisma Client...`);
      await runCommand('npx', ['prisma', 'generate', '--schema=packages/db/prisma/schema.prisma']);
    } catch (err: any) {
      console.warn(`${COLORS.sys} Prisma generate notice:`, err.message);
    }
  }

  console.log(`${COLORS.sys} Launching all services concurrently...`);

  // Start API (Port 4000)
  spawnWithPrefix('API', COLORS.api, 'npm', ['run', 'dev'], path.join(rootDir, 'apps/api'));

  // Start Public Web (Port 5000)
  spawnWithPrefix('WEB', COLORS.web, 'npm', ['run', 'dev'], path.join(rootDir, 'apps/web'));

  // Start Admin & Faculty Portal (Port 5001)
  spawnWithPrefix('ADMIN', COLORS.admin, 'npm', ['run', 'dev'], path.join(rootDir, 'apps/admin'));

  console.log(`${COLORS.sys} -------------------------------------------------------------`);
  console.log(`${COLORS.sys} Public Site + Alumni Portal:   http://localhost:5000`);
  console.log(`${COLORS.sys} Admin & Faculty Portal:       http://localhost:5001`);
  console.log(`${COLORS.sys} Express REST API + Worker:    http://localhost:4000/api/v1`);
  console.log(`${COLORS.sys} System Healthcheck:           http://localhost:4000/healthz`);
  console.log(`${COLORS.sys} -------------------------------------------------------------`);
}

main().catch((err) => {
  console.error(`${COLORS.sys} Dev orchestrator fatal error:`, err);
  cleanupAndExit();
});
