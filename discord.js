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

const PROJECT_NAME = "discord-bot";

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
    chalk.cyan(figlet.textSync("DISCORD BOT", { horizontalLayout: "default" }))
  );

  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(" Folder already exists"));
    process.exit(1);
  }

  const spinner = ora("Creating Discord bot structure...").start();

  fs.mkdirSync(projectPath);
  fs.mkdirSync(path.join(projectPath, "src"), { recursive: true });
  fs.mkdirSync(path.join(projectPath, "config"), { recursive: true });

  spinner.text = "Creating files...";

  write(
    "src/bot.js",
    `import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once("ready", () => {
  console.log('Logged in as {client.user.tag}');
});

client.on("messageCreate", (message) => {
  if (message.content === "!ping") {
    message.reply("Pong!");
  }
});

client.login(process.env.DISCORD_TOKEN);`
  );

  write(
    "config/.env.example",
    `DISCORD_TOKEN=your-bot-token-here`
  );

  write(
    "README.md",
    `# ${PROJECT_NAME}

Basic Discord bot project scaffolded by command.

## Setup
1. Copy config/.env.example to config/.env and add your bot token.
2. Run npm install
3. Run npm start`
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
          start: "node src/bot.js"
        },
        dependencies: {
          "discord.js": "^14.13.0"
        }
      },
      null,
      2
    )
  );
  write(
    ".gitignore",
    `node_modules
.env
`
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
          start: "node src/bot.js"
        },
        dependencies: {
          "discord.js": "^14.13.0"
        }
      },
      null,
      2
    )
  );

  spinner.succeed("Discord bot files created!");

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
      `${chalk.green("✔ Discord bot project ready!")}
\n${chalk.cyan("Next steps:")}
  cd ${PROJECT_NAME}
  npm install
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
  console.error(chalk.red(" Failed to create Discord bot project"));
  console.error(err);
  process.exit(1);
});
