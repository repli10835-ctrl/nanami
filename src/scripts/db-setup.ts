import "dotenv/config";
import { initDb, seedDbIfEmpty } from "../lib/db";
import { seedState } from "../lib/seed-data";

async function run() {
  const mode = process.argv[2];

  if (!mode || (mode !== "push" && mode !== "seed" && mode !== "setup")) {
    console.error("Please specify a mode: 'push', 'seed', or 'setup'");
    process.exit(1);
  }

  try {
    if (mode === "push" || mode === "setup") {
      console.log("Pushing database schema / creating tables...");
      const success = await initDb();
      if (!success) {
        console.error("Database schema push failed.");
        process.exit(1);
      }
      console.log("Database schema pushed successfully.");
    }

    if (mode === "seed" || mode === "setup") {
      console.log("Seeding initial database content...");
      await seedDbIfEmpty(seedState);
      console.log("Database seeded successfully.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Setup process failed:", error);
    process.exit(1);
  }
}

run();
