#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import figlet from "figlet";

try {
  console.log(
    chalk.cyan(
      figlet.textSync("LIST COMMANDS", { horizontalLayout: "default" })
    )
  );


  console.log("Here are the commands:");

  const __filename = fileURLToPath(import.meta.url);
  const commandsDir = path.dirname(__filename);
  const files = fs.readdirSync(commandsDir);

  files.forEach((file) => {
    if (file.endsWith(".js")) {
      const commandName = path.parse(file).name.toLowerCase();
      console.log(chalk.blue(commandName));
    }
  });
} catch (error) {
  console.error(chalk.red("❌ An error occurred:"), error);
  process.exit(1);
}