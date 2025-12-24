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

const PROJECT_NAME = "react-app";

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create project OUTSIDE script folder
const ROOT_DIR = path.resolve(__dirname, "..");
const projectPath = path.join(ROOT_DIR, PROJECT_NAME);

const write = (file, content) => {
  const full = path.join(projectPath, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
};

try {
  // Banner
  console.log(
    chalk.cyan(
      figlet.textSync("CREATE REACT", { horizontalLayout: "default" })
    )
  );

  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(" Folder already exists"));
    process.exit(1);
  }

  const spinner = ora("Creating project structure...").start();

  // Folders
  fs.mkdirSync(projectPath);
  fs.mkdirSync(path.join(projectPath, "src", "components"), { recursive: true });
  fs.mkdirSync(path.join(projectPath, "src", "pages"), { recursive: true });
  fs.mkdirSync(path.join(projectPath, "src", "styles"), { recursive: true });

  spinner.text = "Creating files...";

  // Files
  write("index.html", `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${PROJECT_NAME}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`.trim());

  spinner.text = "index.html created";

  write("src/main.jsx", `
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`.trim());
  spinner.text = "main.jsx created";


  write("src/App.jsx", `
export default function App() {
  return (
    <div>
      <h1>Welcome 🚀</h1>
    </div>
  );
}
`.trim());

  spinner.text = "App.jsx created";

  write("vite.config.js", `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`.trim());

  write(
    "package.json",
    JSON.stringify(
      {
        name: PROJECT_NAME,
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1"
        },
        devDependencies: {
          vite: "^5.0.0",
          "@vitejs/plugin-react": "^4.0.0"
        }
      },
      null,
      2
    )
  );

  write(".gitignore", `
node_modules
dist
.env
`.trim());
  write("README.md", `
# React + Vite App
Minimal React starter with Vite.

## Run
\`\`\`bash
npm install
npm run dev
\`\`\`

  `.trim());

  spinner.text = "index.html created";
  write("src/styles/global.css", `
    *{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    }
    body {
    background-color: #1e1e1e;
      font-family: Arial, sans-serif;
    }
`.trim()
  );

  spinner.text = "Installing dependencies...";
  execSync("npm install", { cwd: projectPath, stdio: "inherit" });

  spinner.text = "Initializing git repository...";
  execSync("git init", { cwd: projectPath, stdio: "inherit" });
  execSync("git add .", { cwd: projectPath, stdio: "inherit" });
  execSync('git commit -m "Initial commit: React + Vite setup"', { cwd: projectPath, stdio: "inherit" });

  spinner.succeed("Project created successfully!");

  console.log(
    boxen(
      `${chalk.green("✔ React + Vite app created!")}

${chalk.cyan("Next steps:")}
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
  console.error(chalk.red("Failed to create project"));
  console.error(err);
}
