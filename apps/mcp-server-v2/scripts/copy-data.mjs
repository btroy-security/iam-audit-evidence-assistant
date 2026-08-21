// Copies src/data/controls.json into dist/data/controls.json after the
// TypeScript build. Written in plain Node.js (not shell commands like
// `mkdir -p` / `cp`) so it works identically on Windows, macOS, and Linux.
import { mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "..", "src", "data", "controls.json");
const destDir = join(__dirname, "..", "dist", "data");
const dest = join(destDir, "controls.json");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);

console.log(`Copied controls.json -> ${dest}`);
