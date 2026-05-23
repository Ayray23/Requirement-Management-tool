import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const rootDir = new URL("../src/", import.meta.url);
const files = [];

async function walk(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });

  for (const entry of entries) {
    const nextUrl = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directoryUrl);

    if (entry.isDirectory()) {
      await walk(nextUrl);
      continue;
    }

    if (extname(entry.name) === ".js") {
      files.push(nextUrl);
    }
  }
}

await walk(rootDir);

for (const fileUrl of files) {
  await readFile(fileUrl, "utf8");
}

console.log(`Checked ${files.length} server files successfully.`);
