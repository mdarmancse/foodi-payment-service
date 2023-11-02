import fs from "fs";
import path from "path";

async function runConsumers() {
  try {
    const targetPath = path.join(__dirname, "..", "rmq/consumers");

    fs.readdirSync(targetPath)
      .filter((filenames) => {
        const filePathParts = filenames.split(".");
        const extension = filePathParts[filePathParts.length - 1];
        return extension.toLowerCase() === "js";
      })
      .map((filename) => {
        return filename.replace(".js", "");
      })
      .forEach(async (filename) => {
        console.log("#-->>", filename);
        const importPath = path.join(targetPath, filename);
        const { consumer } = require(importPath);
        await consumer();
      });
    console.log(`Connected to RabbitMQ`);
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
}

module.exports = runConsumers;
