
import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get last commit message and author
function getLastCommitInfo() {
  try {
    const message = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    const author = execSync('git log -1 --pretty=%an', { encoding: 'utf8' }).trim();
    return { message, author };
  } catch (err) {
    return { message: 'N/A', author: 'N/A' };
  }
}

// Get version from package.json
function getVersion() {
  try {
    const pkgPath = path.resolve(__dirname, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || 'N/A';
  } catch (err) {
    return 'N/A';
  }
}

function showVersionInfo() {
  const { message, author } = getLastCommitInfo();
  const version = getVersion();
  console.log(`Version: ${version}`);
  console.log(`Last commit: "${message}"`);
  console.log(`By: ${author}`);
}

// Check if this file is being run directly (ESM way)
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  showVersionInfo();
}
