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

const PROJECT_NAME = "actors-project";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const projectPath = path.join(ROOT_DIR, PROJECT_NAME);

const write = (file, content) => {
  const full = path.join(projectPath, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
};

async function main() {
  console.log(
    chalk.cyan(figlet.textSync("CREATE ACTOR", { horizontalLayout: "default" }))
  );

  if (fs.existsSync(projectPath)) {
    console.log(chalk.red("❌ Folder already exists"));
    process.exit(1);
  }

  const spinner = ora("Creating project structure...").start();

  fs.mkdirSync(projectPath);
  fs.mkdirSync(path.join(projectPath, "actors"));
  fs.mkdirSync(path.join(projectPath, "scrapers"));
  fs.mkdirSync(path.join(projectPath, "utils"));

  spinner.text = "Creating files...";

  write(
    "actors/example.actor.js",
    `
export async function runActor() {
  console.log("Actor running...");
}
`.trim()
  );

  write(
    "scrapers/example.scraper.js",
    `
export async function runScraper() {
  console.log("Scraper running...");
}
`.trim()
  );

  write(
    "utils/logger.js",
    `
export const log = (msg) => {
  console.log("[LOG]", msg);
};
`.trim()
  );

  write(
    ".gitignore",
    `
node_modules
.env
dist
`.trim()
  );

  write(
    "README.md",
    `
# ${PROJECT_NAME}

Actors & scrapers project.

## Scripts
- npm start
`.trim()
  );

  write(
    "package.json",
    JSON.stringify(
      {
        name: PROJECT_NAME,
        version: "1.0.0",
        type: "module",
        private: true,
        scripts: {
          start: "node actors/example.actor.js"
        }
      },
      null,
      2
    )
  );

  spinner.succeed("Project files created!");

  const { useGit } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useGit",
      message: "Initialize git repository and make first commit?",
      default: true
    }
  ]);

  if (useGit) {
    const gitSpinner = ora("Initializing git...").start();

    execSync("git init", { cwd: projectPath });
    execSync("git add .", { cwd: projectPath });
    execSync('git commit -m "Initial commit"', { cwd: projectPath });

    gitSpinner.succeed("Git initialized & first commit created!");
  }

  console.log(
    boxen(
      `${chalk.green("✔ Actors/Scrapers project ready!")}

${chalk.cyan("Next steps:")}
  cd ${PROJECT_NAME}
  npm start
`,
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "green"
      }
    )
  );
}

main().catch((err) => {
  console.error(chalk.red("❌ Failed to create project"));
  console.error(err);
  process.exit(1);
});
