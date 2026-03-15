import app from "./app";
import { seedDemoData } from "@workspace/db/seed";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);

  try {
    await seedDemoData();
  } catch (err) {
    console.error("Auto-seed failed (non-fatal):", err);
  }
});
