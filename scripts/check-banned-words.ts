import fs from 'node:fs';
import path from 'node:path';

// Banned words that must never appear anywhere in source files, UI, comments, titles, or docs:
// 1. CMS platforms: WordPress, Drupal, Joomla
// 2. UI badges / copy: "live", "real-time", "demo", "sample", "AI-powered", "coming soon"
const STRICT_BANNED = [
  'wordpress',
  'drupal',
  'joomla',
  'ai-powered',
  'coming soon',
];

// Contextual UI phrases that should not appear in UI copy
const UI_BANNED = [
  'live preview',
  'real-time demo',
  'sample data',
  'demo site',
  'demo version',
  'sample alumni',
  'sample statistics',
  'sample testimonial',
];

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.vscode',
  'dist',
  '.turbo',
  'coverage',
  '.next',
]);

const IGNORE_FILES = new Set([
  'package-lock.json',
  'check-banned-words.ts', // exclude this script itself
]);

let violations = 0;

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
  
  for (const word of STRICT_BANNED) {
    if (content.includes(word)) {
      console.error(`[BANNED WORD] Found "${word}" in ${filePath}`);
      violations++;
    }
  }

  for (const phrase of UI_BANNED) {
    if (content.includes(phrase)) {
      console.error(`[BANNED PHRASE] Found "${phrase}" in ${filePath}`);
      violations++;
    }
  }
}

function walkDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        walkDir(path.join(dir, entry.name));
      }
    } else if (entry.isFile()) {
      if (!IGNORE_FILES.has(entry.name) && !entry.name.endsWith('.log')) {
        checkFile(path.join(dir, entry.name));
      }
    }
  }
}

console.log('Scanning repository for prohibited words...');
walkDir(process.cwd());

if (violations > 0) {
  console.error(`FAILED: Found ${violations} banned word violation(s).`);
  process.exit(1);
} else {
  console.log('SUCCESS: Zero banned words detected across the codebase.');
  process.exit(0);
}
