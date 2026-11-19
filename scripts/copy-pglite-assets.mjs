#!/usr/bin/env node
/**
 * Nitro's vercel build bundles `@electric-sql/pglite` into `_libs/` but does not
 * copy the adjacent WASM/data files that PGLite loads via `import.meta.url`.
 * Without them, `npm run preview` crashes on first DB touch. Copy them next to
 * the bundled module after every build.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const destDir = join(root, ".vercel/output/functions/__server.func/_libs");

if (!existsSync(destDir)) {
  console.log("[copy-pglite-assets] no vercel server output — skipping");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
const files = readdirSync(srcDir).filter(
  (name) => name.endsWith(".wasm") || name.endsWith(".data"),
);
for (const name of files) {
  copyFileSync(join(srcDir, name), join(destDir, name));
  console.log(`[copy-pglite-assets] ${name}`);
}
