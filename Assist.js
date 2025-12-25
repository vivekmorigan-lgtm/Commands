#!/usr/bin/env node

import readline from "readline";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import chalk from "chalk";
import ora from "ora";

const cwd = process.cwd();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

function showMenu() {
  console.log(chalk.blue.bold("\n💬 CLI Assistant\n"));
  console.log(chalk.cyan("Select an option:\n"));
  console.log(chalk.yellow("  1. Create File"));
  console.log(chalk.yellow("  2. Create Folder"));
  console.log(chalk.yellow("  3. Delete File/Folder"));
  console.log(chalk.yellow("  4. List Files"));
  console.log(chalk.yellow("  5. View File Content"));
  console.log(chalk.yellow("  6. Copy File"));
  console.log(chalk.yellow("  7. Rename File"));
  console.log(chalk.yellow("  8. Search Files"));
  console.log(chalk.yellow("  9. Initialize Git Repo"));
  console.log(chalk.yellow("  10. Clone Repository"));
  console.log(chalk.yellow("  11. NPM Initialize"));
  console.log(chalk.yellow("  12. Install Dependencies"));
  console.log(chalk.yellow("  13. Open in VS Code"));
  console.log(chalk.yellow("  14. View Folder Size"));
  console.log(chalk.yellow("  15. Exit\n"));
}

async function createFile() {
  console.log(chalk.cyan("\n--- Create File ---\n"));
  console.log("File types: js, jsx, json, css, html, txt, md");
  const ext = await question("Enter file extension (or press Enter for custom): ");
  const fileExt = ext.trim() || "custom";

  let fileName;
  if (fileExt === "custom") {
    fileName = await question("Enter full file name (with extension): ");
  } else {
    const name = await question("Enter file name (without extension): ");
    fileName = name.trim() + (fileExt.startsWith(".") ? fileExt : "." + fileExt);
  }

  if (fileName.trim()) {
    fs.ensureFileSync(fileName);
    console.log(chalk.green(`✓ File created: ${fileName}\n`));
  } else {
    console.log(chalk.yellow("⚠ Cancelled\n"));
  }
}

async function createFolder() {
  console.log(chalk.cyan("\n--- Create Folder ---\n"));
  console.log("Suggestions: src, components, utils, assets, styles, hooks, pages, config");
  const folderName = await question("Enter folder name: ");

  if (folderName.trim()) {
    fs.ensureDirSync(folderName);
    console.log(chalk.green(`✓ Folder created: ${folderName}\n`));
  } else {
    console.log(chalk.yellow("⚠ Cancelled\n"));
  }
}

async function deleteItem() {
  console.log(chalk.cyan("\n--- Delete File/Folder ---\n"));
  const files = fs.readdirSync(cwd);

  if (files.length === 0) {
    console.log(chalk.yellow("⚠ No files or folders to delete\n"));
    return;
  }

  console.log("Files and folders:\n");
  files.forEach((file, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${file}`));
  });

  const choice = await question("\nEnter number to delete (or press Enter to cancel): ");
  const idx = parseInt(choice) - 1;

  if (idx >= 0 && idx < files.length) {
    const target = files[idx];
    const confirm = await question(`Delete "${target}"? (yes/no): `);

    if (confirm.toLowerCase() === "yes" || confirm.toLowerCase() === "y") {
      fs.removeSync(target);
      console.log(chalk.green("✓ Deleted successfully\n"));
    } else {
      console.log(chalk.yellow("⚠ Cancelled\n"));
    }
  } else {
    console.log(chalk.yellow("⚠ Cancelled\n"));
  }
}

function listFiles() {
  console.log(chalk.cyan("\n--- List Files ---\n"));
  const files = fs.readdirSync(cwd);

  if (files.length === 0) {
    console.log(chalk.dim("(empty directory)\n"));
    return;
  }

  files.forEach(file => {
    const fullPath = path.join(cwd, file);
    const isDir = fs.statSync(fullPath).isDirectory();
    const icon = isDir ? "📁" : "📄";
    console.log(`  ${icon} ${file}`);
  });
  console.log();
}

async function importVite() {
  console.log(chalk.cyan("\n--- View File Content ---\n"));
  const files = fs.readdirSync(cwd).filter(f => fs.statSync(f).isFile());

  if (files.length === 0) {
    console.log(chalk.yellow("⚠ No files to view\n"));
    return;
  }

  console.log("Files:\n");
  files.forEach((file, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${file}`));
  });

  const choice = await question("\nEnter number to view: ");
  const idx = parseInt(choice) - 1;

  if (idx >= 0 && idx < files.length) {
    const content = fs.readFileSync(files[idx], "utf-8");
    console.log(chalk.cyan(`\n--- ${files[idx]} ---\n`));
    console.log(content);
    console.log();
  } else {
    console.log(chalk.yellow("⚠ Invalid choice\n"));
  }
}

async function copyFile() {
  console.log(chalk.cyan("\n--- Copy File ---\n"));
  const files = fs.readdirSync(cwd).filter(f => fs.statSync(f).isFile());

  if (files.length === 0) {
    console.log(chalk.yellow("⚠ No files to copy\n"));
    return;
  }

  console.log("Files:\n");
  files.forEach((file, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${file}`));
  });

  const choice = await question("\nEnter number to copy: ");
  const idx = parseInt(choice) - 1;

  if (idx >= 0 && idx < files.length) {
    const newName = await question("Enter new file name: ");
    if (newName.trim()) {
      fs.copyFileSync(files[idx], newName);
      console.log(chalk.green(`✓ File copied: ${files[idx]} → ${newName}\n`));
    } else {
      console.log(chalk.yellow("⚠ Cancelled\n"));
    }
  } else {
    console.log(chalk.yellow("⚠ Invalid choice\n"));
  }
}

async function renameFile() {
  console.log(chalk.cyan("\n--- Rename File ---\n"));
  const files = fs.readdirSync(cwd);

  if (files.length === 0) {
    console.log(chalk.yellow("⚠ No files to rename\n"));
    return;
  }

  console.log("Files and folders:\n");
  files.forEach((file, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${file}`));
  });

  const choice = await question("\nEnter number to rename: ");
  const idx = parseInt(choice) - 1;

  if (idx >= 0 && idx < files.length) {
    const newName = await question("Enter new name: ");
    if (newName.trim()) {
      fs.renameSync(files[idx], newName);
      console.log(chalk.green(`✓ Renamed: ${files[idx]} → ${newName}\n`));
    } else {
      console.log(chalk.yellow("⚠ Cancelled\n"));
    }
  } else {
    console.log(chalk.yellow("⚠ Invalid choice\n"));
  }
}

async function searchFiles() {
  console.log(chalk.cyan("\n--- Search Files ---\n"));
  const pattern = await question("Enter file name to search (supports wildcards): ");

  if (!pattern.trim()) {
    console.log(chalk.yellow("⚠ Cancelled\n"));
    return;
  }

  const results = fs.readdirSync(cwd).filter(f =>
    f.toLowerCase().includes(pattern.toLowerCase())
  );

  if (results.length === 0) {
    console.log(chalk.yellow(`⚠ No files matching "${pattern}"\n`));
  } else {
    console.log(chalk.cyan(`\nFound ${results.length} match(es):\n`));
    results.forEach(file => {
      const isDir = fs.statSync(file).isDirectory();
      const icon = isDir ? "📁" : "📄";
      console.log(`  ${icon} ${file}`);
    });
    console.log();
  }
}

async function initGit() {
  console.log(chalk.cyan("\n--- Initialize Git Repo ---\n"));

  if (fs.existsSync(".git")) {
    console.log(chalk.yellow("⚠ Git repository already exists\n"));
    return;
  }

  try {
    execSync("git init", { stdio: "pipe", cwd: cwd });
    console.log(chalk.green("✓ Git repository initialized\n"));
  } catch (error) {
    console.log(chalk.red(`✗ Error: ${error.message}\n`));
  }
}

async function cloneRepository() {
  console.log(chalk.cyan("\n--- Clone Repository ---\n"));
  const repoUrl = await question("Enter repository URL: ");

  if (!repoUrl.trim()) {
    console.log(chalk.yellow("⚠ Cancelled\n"));
    return;
  }

  const folderName = await question("Enter folder name (optional, press Enter for default): ");
  const target = folderName.trim() || "";

  const spinner = ora("Cloning repository...").start();

  try {
    const cmd = target ? `git clone ${repoUrl} ${target}` : `git clone ${repoUrl}`;
    execSync(cmd, { stdio: "pipe", cwd: cwd });
    spinner.succeed(chalk.green("✓ Repository cloned successfully\n"));
  } catch (error) {
    spinner.fail(chalk.red(`✗ Error: ${error.message}\n`));
  }
}

async function npmInit() {
  console.log(chalk.cyan("\n--- NPM Initialize ---\n"));
  const projectName = await question("Enter project name (optional): ");

  const spinner = ora("Initializing npm...").start();

  try {
    execSync("npm init -y", { stdio: "pipe", cwd: cwd });
    spinner.succeed(chalk.green("✓ package.json created\n"));
  } catch (error) {
    spinner.fail(chalk.red(`✗ Error: ${error.message}\n`));
  }
}

async function installDeps() {
  console.log(chalk.cyan("\n--- Install Dependencies ---\n"));

  if (!fs.existsSync("package.json")) {
    console.log(chalk.yellow("⚠ No package.json found\n"));
    return;
  }

  const spinner = ora("Installing dependencies...").start();

  try {
    execSync("npm install", { stdio: "inherit", cwd: cwd });
    spinner.succeed(chalk.green("✓ Dependencies installed\n"));
  } catch (error) {
    spinner.fail(chalk.red(`✗ Error: ${error.message}\n`));
  }
}

async function openVsCode() {
  console.log(chalk.cyan("\n--- Open in VS Code ---\n"));
  const files = fs.readdirSync(cwd);

  if (files.length === 0) {
    console.log(chalk.yellow("⚠ No files or folders to open\n"));
    return;
  }

  console.log("Files and folders:\n");
  files.forEach((file, index) => {
    console.log(chalk.gray(`  ${index + 1}. ${file}`));
  });
  console.log(chalk.gray(`  ${files.length + 1}. Open Current Folder\n`));

  const choice = await question("Enter number to open: ");
  const idx = parseInt(choice) - 1;

  let target = ".";
  if (idx >= 0 && idx < files.length) {
    target = files[idx];
  } else if (idx === files.length) {
    target = ".";
  } else {
    console.log(chalk.yellow("⚠ Invalid choice\n"));
    return;
  }

  const spinner = ora("Opening VS Code...").start();

  try {
    execSync(`code "${target}"`, { stdio: "pipe", cwd: cwd });
    spinner.succeed(chalk.green(`✓ Opened in VS Code: ${target}\n`));
  } catch (error) {
    spinner.fail(chalk.red(`✗ Error: Make sure VS Code is installed\n`));
  }
}

function calculateFolderSize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      size += calculateFolderSize(filePath);
    } else {
      size += stats.size;
    }
  });

  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

async function viewFolderSize() {
  console.log(chalk.cyan("\n--- Folder Size ---\n"));
  const size = calculateFolderSize(cwd);
  console.log(chalk.green(`📊 Current folder size: ${formatBytes(size)}\n`));
}

async function main() {
  let running = true;

  while (running) {
    showMenu();
    const choice = await question(chalk.bold("Enter your choice (1-15): "));

    switch (choice.trim()) {
      case "1":
        await createFile();
        break;
      case "2":
        await createFolder();
        break;
      case "3":
        await deleteItem();
        break;
      case "4":
        listFiles();
        break;
      case "5":
        await importVite();
        break;
      case "6":
        await copyFile();
        break;
      case "7":
        await renameFile();
        break;
      case "8":
        await searchFiles();
        break;
      case "9":
        await initGit();
        break;
      case "10":
        await cloneRepository();
        break;
      case "11":
        await npmInit();
        break;
      case "12":
        await installDeps();
        break;
      case "13":
        await openVsCode();
        break;
      case "14":
        await viewFolderSize();
        break;
      case "15":
        console.log(chalk.blue("👋 See you!\n"));
        running = false;
        break;
      default:
        console.log(chalk.red("✗ Invalid choice. Please enter 1-15.\n"));
    }
  }

  rl.close();
  process.exit(0);
}

main().catch(error => {
  console.error(chalk.red("Fatal error:"), error.message);
  rl.close();
  process.exit(1);
});
