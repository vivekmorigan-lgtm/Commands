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

async function setupMongoDB() {
  const { projectPath } = await inquirer.prompt([
    {
      type: "input",
      name: "projectPath",
      message: "Enter backend project path:",
      default: "./backend",
    },
  ]);

  const fullPath = path.resolve(ROOT_DIR, projectPath);

  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(` Project path not found: ${projectPath}`));
    return;
  }

  const spinner = ora("Setting up MongoDB...").start();

  write(
    "src/models/User.js",
    `
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
`.trim(),
    fullPath
  );

  write(
    "src/config/db.js",
    `
import mongoose from "mongoose";
import chalk from "chalk";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/myapp";
    await mongoose.connect(uri);
    console.log(chalk.green("✔ MongoDB connected"));
  } catch (error) {
    console.error(chalk.red("MongoDB connection failed:"), error);
    process.exit(1);
  }
};
`.trim(),
    fullPath
  );

  write(
    ".env.example",
    `
MONGODB_URI=mongodb://localhost:27017/myapp
NODE_ENV=development
PORT=5000
`.trim(),
    fullPath
  );

  spinner.text = "Installing Mongoose...";
  execSync("npm install mongoose", { cwd: fullPath, stdio: "inherit" });

  spinner.succeed("MongoDB setup complete!");

  console.log(
    boxen(
      `${chalk.green("✔ MongoDB configured!")}

${chalk.yellow("1. Install MongoDB:")}
   https://www.mongodb.com/try/download/community

${chalk.yellow("2. Create .env file with:")}
   MONGODB_URI=mongodb://localhost:27017/myapp

${chalk.yellow("3. Update your server.js:")}
   import { connectDB } from "./src/config/db.js";
   await connectDB();

${chalk.yellow("4. Use models:")}
   import User from "./src/models/User.js";
`,
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "blue",
      }
    )
  );
}

async function setupSupabase() {
  const { projectPath } = await inquirer.prompt([
    {
      type: "input",
      name: "projectPath",
      message: "Enter backend project path:",
      default: "./backend",
    },
  ]);

  const fullPath = path.resolve(ROOT_DIR, projectPath);

  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(` Project path not found: ${projectPath}`));
    return;
  }

  const spinner = ora("Setting up Supabase...").start();

  write(
    "src/config/supabase.js",
    `
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
`.trim(),
    fullPath
  );

  write(
    "src/models/Users.sql",
    `
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
`.trim(),
    fullPath
  );

  write(
    "src/routes/users.js",
    `
import { supabase } from "../config/supabase.js";

export async function getUsers(req, res) {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createUser(req, res) {
  try {
    const { email, name } = req.body;
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, name }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
`.trim(),
    fullPath
  );

  write(
    ".env.example",
    `
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
NODE_ENV=development
PORT=5000
`.trim(),
    fullPath
  );

  spinner.text = "Installing Supabase client...";
  execSync("npm install @supabase/supabase-js", { cwd: fullPath, stdio: "inherit" });

  spinner.succeed("Supabase setup complete!");

  console.log(
    boxen(
      `${chalk.green("✔ Supabase configured!")}

${chalk.yellow("1. Create Supabase project:")}
   https://supabase.com

${chalk.yellow("2. Run SQL migration in Supabase dashboard:")}
   See src/models/Users.sql

${chalk.yellow("3. Create .env with:")}
   SUPABASE_URL=your-url
   SUPABASE_KEY=your-key

${chalk.yellow("4. Use in routes:")}
   import { supabase } from "../config/supabase.js";
`,
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "blue",
      }
    )
  );
}

async function setupFirebase() {
  const { projectPath } = await inquirer.prompt([
    {
      type: "input",
      name: "projectPath",
      message: "Enter backend project path:",
      default: "./backend",
    },
  ]);

  const fullPath = path.resolve(ROOT_DIR, projectPath);

  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(` Project path not found: ${projectPath}`));
    return;
  }

  const spinner = ora("Setting up Firebase...").start();

  write(
    "src/config/firebase.js",
    `
import admin from "firebase-admin";
import chalk from "chalk";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();

console.log(chalk.green("✔ Firebase initialized"));
`.trim(),
    fullPath
  );

  write(
    "src/models/User.js",
    `
import { db } from "../config/firebase.js";

export async function getUser(uid) {
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? doc.data() : null;
}

export async function createUser(uid, userData) {
  await db.collection("users").doc(uid).set({
    ...userData,
    createdAt: new Date(),
  });
}

export async function updateUser(uid, userData) {
  await db.collection("users").doc(uid).update(userData);
}

export async function deleteUser(uid) {
  await db.collection("users").doc(uid).delete();
}
`.trim(),
    fullPath
  );

  write(
    ".env.example",
    `
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
NODE_ENV=development
PORT=5000
`.trim(),
    fullPath
  );

  spinner.text = "Installing Firebase Admin SDK...";
  execSync("npm install firebase-admin", { cwd: fullPath, stdio: "inherit" });

  spinner.succeed("Firebase setup complete!");

  console.log(
    boxen(
      `${chalk.green("✔ Firebase configured!")}

${chalk.yellow("1. Create Firebase project:")}
   https://console.firebase.google.com

${chalk.yellow("2. Download service account key:")}
   Project Settings > Service Accounts > Generate Key

${chalk.yellow("3. Create .env with:")}
   FIREBASE_SERVICE_ACCOUNT=<copy JSON content>

${chalk.yellow("4. Use in code:")}
   import { db, auth } from "../config/firebase.js";
`,
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "blue",
      }
    )
  );
}

async function main() {
  console.log(
    chalk.cyan(figlet.textSync("DATABASE SETUP", { horizontalLayout: "default" }))
  );

  const { database } = await inquirer.prompt([
    {
      type: "list",
      name: "database",
      message: "Select database service:",
      choices: [
        { name: "MongoDB", value: "mongodb" },
        { name: "Supabase (PostgreSQL)", value: "supabase" },
        { name: "Firebase (Firestore)", value: "firebase" },
      ],
    },
  ]);

  switch (database) {
    case "mongodb":
      await setupMongoDB();
      break;
    case "supabase":
      await setupSupabase();
      break;
    case "firebase":
      await setupFirebase();
      break;
  }
}

main().catch((err) => {
  console.error(chalk.red(" Error:"), err.message);
  process.exit(1);
});
