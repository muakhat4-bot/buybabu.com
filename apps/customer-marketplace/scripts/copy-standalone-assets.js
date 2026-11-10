const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, '..');
const standaloneAppDir = path.join(appDir, '.next', 'standalone', 'apps', 'customer-marketplace');

console.log('[standalone-copy] Target standalone app dir:', standaloneAppDir);

if (!fs.existsSync(standaloneAppDir)) {
  console.error('[standalone-copy] ERROR: Standalone app directory not found at:', standaloneAppDir);
  process.exit(1);
}

// 1. Copy public assets if public folder exists
const srcPublic = path.join(appDir, 'public');
const destPublic = path.join(standaloneAppDir, 'public');
if (fs.existsSync(srcPublic)) {
  console.log(`[standalone-copy] Copying public directory to: ${destPublic}`);
  fs.cpSync(srcPublic, destPublic, { recursive: true, force: true });
  console.log('[standalone-copy] ✓ Public assets copied successfully.');
} else {
  console.log('[standalone-copy] (i) No public directory found, skipping.');
}

// 2. Copy .next/static directory
const srcStatic = path.join(appDir, '.next', 'static');
const destStatic = path.join(standaloneAppDir, '.next', 'static');
if (fs.existsSync(srcStatic)) {
  console.log(`[standalone-copy] Copying static assets to: ${destStatic}`);
  fs.cpSync(srcStatic, destStatic, { recursive: true, force: true });
  console.log('[standalone-copy] ✓ .next/static assets copied successfully.');
} else {
  console.error('[standalone-copy] ERROR: Source .next/static directory not found at:', srcStatic);
  process.exit(1);
}

console.log('[standalone-copy] Standalone asset preparation complete.');
