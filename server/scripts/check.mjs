import { readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const sourceRoot = join(process.cwd(), "src");

function collectJavaScriptFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return collectJavaScriptFiles(fullPath);
    }

    return fullPath.endsWith(".js") ? [fullPath] : [];
  });
}

const files = collectJavaScriptFiles(sourceRoot);

files.forEach((file) => {
  execFileSync(process.execPath, ["--check", file], {
    stdio: "inherit"
  });
});

console.log(`Checked ${files.length} server files successfully.`);
