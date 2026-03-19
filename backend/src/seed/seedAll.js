require("dotenv").config();
const path = require("path");
const { spawn } = require("child_process");

const seedScripts = [
  "seedCategories.js",
  "seedProducts.js",
  "seedOrders.js",
  "seedAdmin.js"
];

const runScript = (scriptName) =>
  new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn(process.execPath, [scriptPath], {
      stdio: "inherit",
      env: process.env
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${scriptName} failed with exit code ${code}`));
    });

    child.on("error", reject);
  });

const runAllSeeds = async () => {
  try {
    for (const scriptName of seedScripts) {
      console.log(`Running ${scriptName}...`);
      await runScript(scriptName);
    }

    console.log("All seed scripts completed successfully.");
  } catch (error) {
    console.error("Seed all failed:", error.message);
    process.exitCode = 1;
  }
};

runAllSeeds();
