import "dotenv/config";
import app from "../src/app.js";
import { ensureSeedAdmin } from "../src/bootstrap/ensureAdmin.js";
import { connectDB } from "../src/config/db.js";

// Serverless functions get reused across "warm" invocations, so this only runs once per warm instance.
let ready;
function init() {
  if (!ready) {
    ready = connectDB(process.env.MONGODB_URI).then(() => ensureSeedAdmin());
  }
  return ready;
}

export default async function handler(req, res) {
  await init();
  return app(req, res);
}
