import fs from 'fs';
function getPackageJsonVersion() {
  try {
    const pkgPath = path.resolve(__dirname, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || 'N/A';
  } catch (err) {
    return 'N/A';
  }
}

function checkIfCommitIsUpToDate() {
  const calculated = getCalculatedVersion();
  const pkgVersion = getPackageJsonVersion();
  if (calculated === pkgVersion) {
    console.log(chalk.bgGreen.black('Version in package.json is up to date with commit count.'));
  } else {
    console.log(chalk.bgRed.white(`Version mismatch! package.json: ${pkgVersion}, calculated: ${calculated}`));
  }
}

import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import figlet from "figlet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLastCommitInfo() {
  try {
    const message = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    const author = execSync('git log -1 --pretty=%an', { encoding: 'utf8' }).trim();
    return { message, author };
  } catch (err) {
    return { message: 'N/A', author: 'N/A' };
  }
}


function getCommitCount() {
  try {
    const count = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
    return parseInt(count, 10);
  } catch (err) {
    return 0;
  }
}

function getCalculatedVersion() {
  const commits = getCommitCount();
  const minor = Math.floor(commits / 10);
  const patch = commits % 10;
  return `0.${minor}.${patch}`;
}


function showVersionInfo() {
  const { message, author } = getLastCommitInfo();
  const commits = getCommitCount();
  const version = getCalculatedVersion();
  console.log(chalk.cyan(figlet.textSync('Boilerplater', { horizontalLayout: 'full' })));
  console.log(chalk.blue(`Commits: ${commits}`));
  console.log(chalk.green(`Version: ${version}`));
  console.log(chalk.yellow(`Last commit: "${message}"`));
  console.log(chalk.magenta(`By: ${author}`));
  checkIfCommitIsUpToDate();
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  showVersionInfo();
}
