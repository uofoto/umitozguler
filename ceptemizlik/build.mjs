import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, "dist");
const files = [
  "index.html",
  "app.js",
  "styles.css",
  "manifest.webmanifest",
  "sw.js",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "privacy.html",
  "terms.html",
  "legal.js",
  "manus-routes.json",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) {
  await cp(path.join(root, file), path.join(output, file));
}
console.log(`Statik PWA derlemesi hazır: ${files.length} dosya -> dist/`);
