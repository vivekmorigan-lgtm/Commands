#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

import figlet from "figlet";
import chalk from "chalk";
import boxen from "boxen";
import ora from "ora";
import inquirer from "inquirer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");

const write = (file, content, targetDir = ROOT_DIR) => {
  const full = path.join(targetDir, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
};

async function createReactDocker() {
  const { projectPath } = await inquirer.prompt([
    {
      type: "input",
      name: "projectPath",
      message: "Enter React project path (relative to current dir):",
      default: "./react-app",
    },
  ]);

  const fullPath = path.resolve(ROOT_DIR, projectPath);

  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`❌ Project path not found: ${projectPath}`));
    return;
  }

  const spinner = ora("Creating React Dockerfile...").start();

  write(
    "Dockerfile",
    `
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
`.trim(),
    fullPath
  );

  write(
    ".dockerignore",
    `
node_modules
npm-debug.log
dist
.git
.env
`.trim(),
    fullPath
  );

  spinner.succeed("React Dockerfile created!");

  const { runNow } = await inquirer.prompt([
    {
      type: "confirm",
      name: "runNow",
      message: "Build and run Docker container?",
      default: true,
    },
  ]);

  if (runNow) {
    spinner.start("Building Docker image...");
    try {
      execSync("docker build -t react-app .", { cwd: fullPath, stdio: "inherit" });
      spinner.succeed("Image built!");
      console.log(chalk.cyan("\nRunning container...\n"));
      execSync("docker run -p 3000:3000 react-app", { cwd: fullPath, stdio: "inherit" });
    } catch (err) {
      spinner.fail(chalk.red("Docker build/run failed"));
      console.error(err.message);
    }
  } else {
    console.log(chalk.cyan("\nTo run later:"));
    console.log(chalk.yellow(`  cd ${projectPath}`));
    console.log(chalk.yellow("  docker build -t react-app ."));
    console.log(chalk.yellow("  docker run -p 3000:3000 react-app\n"));
  }
}

async function createBackendDocker() {
  const { projectPath } = await inquirer.prompt([
    {
      type: "input",
      name: "projectPath",
      message: "Enter Backend project path (relative to current dir):",
      default: "./backend",
    },
  ]);

  const fullPath = path.resolve(ROOT_DIR, projectPath);

  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`❌ Project path not found: ${projectPath}`));
    return;
  }

  const spinner = ora("Creating Backend Dockerfile...").start();

  write(
    "Dockerfile",
    `
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
`.trim(),
    fullPath
  );

  write(
    ".dockerignore",
    `
node_modules
npm-debug.log
.git
.env
`.trim(),
    fullPath
  );

  spinner.succeed("Backend Dockerfile created!");

  const { runNow } = await inquirer.prompt([
    {
      type: "confirm",
      name: "runNow",
      message: "Build and run Docker container?",
      default: true,
    },
  ]);

  if (runNow) {
    spinner.start("Building Docker image...");
    try {
      execSync("docker build -t backend-app .", { cwd: fullPath, stdio: "inherit" });
      spinner.succeed("Image built!");
      console.log(chalk.cyan("\nRunning container...\n"));
      execSync("docker run -p 5000:5000 backend-app", { cwd: fullPath, stdio: "inherit" });
    } catch (err) {
      spinner.fail(chalk.red("Docker build/run failed"));
      console.error(err.message);
    }
  } else {
    console.log(chalk.cyan("\nTo run later:"));
    console.log(chalk.yellow(`  cd ${projectPath}`));
    console.log(chalk.yellow("  docker build -t backend-app ."));
    console.log(chalk.yellow("  docker run -p 5000:5000 backend-app\n"));
  }
}

async function createFullstackDocker() {
  const { frontendPath, backendPath } = await inquirer.prompt([
    {
      type: "input",
      name: "frontendPath",
      message: "Enter Frontend project path:",
      default: "./frontend",
    },
    {
      type: "input",
      name: "backendPath",
      message: "Enter Backend project path:",
      default: "./backend",
    },
  ]);

  const frontendFull = path.resolve(ROOT_DIR, frontendPath);
  const backendFull = path.resolve(ROOT_DIR, backendPath);

  if (!fs.existsSync(frontendFull) || !fs.existsSync(backendFull)) {
    console.log(chalk.red("❌ One or both project paths not found"));
    return;
  }

  const spinner = ora("Creating Fullstack Docker setup...").start();

  write(
    "frontend/Dockerfile",
    `
FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`.trim(),
    frontendFull
  );

  write(
    "backend/Dockerfile",
    `
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
`.trim(),
    backendFull
  );

  write(
    "docker-compose.yml",
    `
version: "3.8"

services:
  backend:
    build:
      context: ./backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
    volumes:
      - ./backend:/app
    command: npm run dev

  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      REACT_APP_API_URL: http://localhost:5000
`.trim(),
    ROOT_DIR
  );

  write(
    ".dockerignore",
    `
node_modules
npm-debug.log
dist
.git
.env
.DS_Store
`.trim(),
    ROOT_DIR
  );

  spinner.succeed("Docker Compose setup created!");

  const { runNow } = await inquirer.prompt([
    {
      type: "confirm",
      name: "runNow",
      message: "Start Docker Compose?",
      default: true,
    },
  ]);

  if (runNow) {
    spinner.start("Starting services...");
    try {
      execSync("docker-compose up --build", { cwd: ROOT_DIR, stdio: "inherit" });
    } catch (err) {
      spinner.fail(chalk.red("Docker Compose failed"));
      console.error(err.message);
    }
  } else {
    console.log(chalk.cyan("\nTo run later:"));
    console.log(chalk.yellow("  docker-compose up --build\n"));
  }
}

async function main() {
  console.log(
    chalk.cyan(figlet.textSync("DOCKER SETUP", { horizontalLayout: "default" }))
  );

  const { option } = await inquirer.prompt([
    {
      type: "list",
      name: "option",
      message: "Select Docker setup type:",
      choices: [
        { name: "React Container", value: "react" },
        { name: "Backend Container", value: "backend" },
        { name: "Fullstack (Docker Compose)", value: "fullstack" },
      ],
    },
  ]);

  switch (option) {
    case "react":
      await createReactDocker();
      break;
    case "backend":
      await createBackendDocker();
      break;
    case "fullstack":
      await createFullstackDocker();
      break;
  }
}

main().catch((err) => {
  console.error(chalk.red("❌ Error:"), err.message);
  process.exit(1);
});
