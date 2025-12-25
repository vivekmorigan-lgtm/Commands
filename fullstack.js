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

const PROJECT_NAME = "fullstack-app";

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
      figlet.textSync("CREATE FULLSTACK", { horizontalLayout: "default" })
    )
  );

  if (fs.existsSync(projectPath)) {
    console.log(chalk.red("❌ Folder already exists"));
    process.exit(1);
  }

  const spinner = ora("Creating fullstack structure...").start();

  fs.mkdirSync(projectPath);
  fs.mkdirSync(path.join(projectPath, "frontend", "src", "components"), { recursive: true });
  fs.mkdirSync(path.join(projectPath, "frontend", "src", "pages"), { recursive: true });
  fs.mkdirSync(path.join(projectPath, "frontend", "src", "styles"), { recursive: true });
  fs.mkdirSync(path.join(projectPath, "backend", "src", "routes"), { recursive: true });
  fs.mkdirSync(path.join(projectPath, "backend", "src", "controllers"), { recursive: true });
  fs.mkdirSync(path.join(projectPath, "backend", "src", "models"), { recursive: true });

  spinner.text = "Creating frontend files...";

  write(
    "frontend/index.html",
    `
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
`.trim()
  );

  write(
    "frontend/src/main.jsx",
    `
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`.trim()
  );

  write(
    "frontend/src/App.jsx",
    `
import { useState, useEffect } from "react";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <h1>Fullstack App 🚀</h1>
      {loading ? <p>Loading...</p> : <p>{JSON.stringify(data)}</p>}
    </div>
  );
}
`.trim()
  );

  write(
    "frontend/src/index.css",
    `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 2rem;
}

p {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
}
`.trim()
  );

  write(
    "frontend/vite.config.js",
    `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
});
`.trim()
  );

  write(
    "frontend/package.json",
    JSON.stringify(
      {
        name: "fullstack-frontend",
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
          lint: "eslint src --ext js,jsx",
        },
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1",
        },
        devDependencies: {
          vite: "^5.0.0",
          "@vitejs/plugin-react": "^4.0.0",
        },
      },
      null,
      2
    )
  );

  spinner.text = "Creating backend files...";

  write(
    "backend/src/server.js",
    `
import http from "http";
import chalk from "chalk";

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/api" && req.method === "GET") {
    res.writeHead(200);
    res.end(JSON.stringify({ message: "Backend running 🚀", timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log(chalk.green(\`✔ Backend running at http://localhost:\${PORT}\`));
});
`.trim()
  );

  write(
    "backend/package.json",
    JSON.stringify(
      {
        name: "fullstack-backend",
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: {
          dev: "node src/server.js",
          start: "node src/server.js",
        },
        dependencies: {
          chalk: "^5.3.0",
        },
      },
      null,
      2
    )
  );

  write(
    "backend/.gitignore",
    `
node_modules
.env
.DS_Store
`.trim()
  );

  spinner.text = "Creating root config...";

  write(
    ".gitignore",
    `
node_modules
dist
.env
.env.local
.DS_Store
*.log
`.trim()
  );

  write(
    "package.json",
    JSON.stringify(
      {
        name: PROJECT_NAME,
        private: true,
        version: "1.0.0",
        scripts: {
          "dev:frontend": "cd frontend && npm run dev",
          "dev:backend": "cd backend && npm run dev",
          dev: "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
          install: "cd frontend && npm install && cd ../backend && npm install",
          build: "cd frontend && npm run build && cd ../backend && echo Backend built",
        },
        devDependencies: {
          concurrently: "^8.2.0",
        },
      },
      null,
      2
    )
  );

  write(
    "README.md",
    `
# ${PROJECT_NAME}

Full-stack web application with React frontend and Node.js backend.

## Project Structure

\`\`\`
frontend/  - React + Vite
backend/   - Node.js HTTP server
\`\`\`

## Installation

\`\`\`bash
npm run install
\`\`\`

## Development

Run both frontend and backend:

\`\`\`bash
npm run dev
\`\`\`

Or run separately:

\`\`\`bash
npm run dev:frontend
npm run dev:backend
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Environment Variables

Create \`.env\` files in \`frontend/\` and \`backend/\` directories if needed.
`.trim()
  );

  spinner.succeed("Fullstack project structure created!");

  const { installDeps } = await inquirer.prompt([
    {
      type: "confirm",
      name: "installDeps",
      message: "Install dependencies now?",
      default: true,
    },
  ]);

  if (installDeps) {
    spinner.start("Installing frontend dependencies...");
    execSync("npm install", { cwd: path.join(projectPath, "frontend"), stdio: "inherit" });
    spinner.text = "Installing backend dependencies...";
    execSync("npm install", { cwd: path.join(projectPath, "backend"), stdio: "inherit" });
    spinner.succeed("Dependencies installed!");
  }

  const { initGit } = await inquirer.prompt([
    {
      type: "confirm",
      name: "initGit",
      message: "Initialize git repository?",
      default: true,
    },
  ]);

  if (initGit) {
    spinner.start("Initializing git...");
    execSync("git init", { cwd: projectPath, stdio: "inherit" });
    execSync("git add .", { cwd: projectPath, stdio: "inherit" });
    execSync('git commit -m "Initial commit: Fullstack setup"', { cwd: projectPath, stdio: "inherit" });
    spinner.succeed("Git initialized!");
  }

  console.log(
    boxen(
      `${chalk.green("✔ Fullstack app created!")}

${chalk.cyan("Next steps:")}
  cd ${PROJECT_NAME}
  npm run dev

${chalk.yellow("Frontend:")} http://localhost:3000
${chalk.yellow("Backend:")} http://localhost:5000
`,
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "green",
      }
    )
  );
} catch (err) {
  console.error(chalk.red("❌ Failed to create fullstack project"));
  console.error(err);
  process.exit(1);
}
