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

const PROJECT_NAME = "backend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const projectPath = path.join(ROOT_DIR, PROJECT_NAME);

const write = (file, content) => {
  const full = path.join(projectPath, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
};

try {
  console.log(
    chalk.cyan(
      figlet.textSync("CREATE BACKEND", { horizontalLayout: "default" })
    )
  );

  if (fs.existsSync(projectPath)) {
    console.log(chalk.red("❌ Folder already exists"));
    process.exit(1);
  }

  const spinner = ora("Creating backend structure...").start();

  fs.mkdirSync(path.join(projectPath, "src", "routes"), { recursive: true });
  fs.mkdirSync(path.join(projectPath, "src", "services"), { recursive: true });
  fs.mkdirSync(path.join(projectPath, "src", "controllers"), { recursive: true });

  spinner.text = "Creating files...";

  write("src/server.js", `
import http from "http";
import chalk from "chalk";

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Backend running 🚀" }));
});

server.listen(PORT, () => {
  console.log(chalk.green(\`✔ Server running at http://localhost:\${PORT}\`));
});
`.trim());

  /* package.json */
  write(
    "package.json",
    JSON.stringify(
      {
        name: PROJECT_NAME,
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: {
          dev: "node src/server.js",
          start: "node src/server.js"
        },
        dependencies: {
          chalk: "^5.3.0"
        }
      },
      null,
      2
    )
  );

  write(".gitignore", `
node_modules
.env
`.trim());

  write("README.md", `
# Backend API

Minimal Node.js backend starter.

## Run
\`\`\`bash
npm install
npm run dev
\`\`\`
`.trim());

  spinner.text = "Installing dependencies...";
  execSync("npm install", { cwd: projectPath, stdio: "inherit" });

  spinner.text = "Initializing git repository...";
  execSync("git init", { cwd: projectPath, stdio: "inherit" });
  execSync("git add .", { cwd: projectPath, stdio: "inherit" });
  execSync('git commit -m "Initial commit: Backend setup"', { cwd: projectPath, stdio: "inherit" });

  spinner.succeed("Backend project created!");

  const { runNow } = await inquirer.prompt([
    {
      type: "confirm",
      name: "runNow",
      message: " Do you want to start the server now?",
      default: true
    }
  ]);

  if (runNow) {

    console.log(chalk.cyan("\nStarting server...\n"));

    execSync("npm run dev", {
      cwd: projectPath,
      stdio: "inherit"
    });
  } else {
    console.log(
      boxen(
        `${chalk.green("✔ Setup complete!")}

${chalk.cyan("Run it later:")}
  cd ${PROJECT_NAME}
  npm run dev
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

} catch (err) {
  console.error(chalk.red("❌ Failed to create backend project"));
  console.error(err);
  process.exit(1);
}
