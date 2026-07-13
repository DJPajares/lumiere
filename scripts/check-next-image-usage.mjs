import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const scopedDirectories = ["apps/dashboard", "apps/invite", "packages/themes/src"];
const sourceExtensions = new Set([".js", ".jsx", ".mdx", ".ts", ".tsx"]);
const ignoredDirectories = new Set([".next", "coverage", "dist", "node_modules"]);

// Keep technically justified raw image cases here with a short reason. Tests and fixtures are
// excluded because their strings are not rendered by the scoped Next.js applications.
const allowlistedRawImages = new Map();

const violations = [];

for (const directory of scopedDirectories) {
  for (const filePath of walk(join(root, directory))) {
    const relativePath = relative(root, filePath).replaceAll("\\", "/");

    if (relativePath.includes(".test.") || relativePath.includes(".spec.")) {
      continue;
    }

    const source = readFileSync(filePath, "utf8");

    for (const match of source.matchAll(/<img\b/gi)) {
      const line = source.slice(0, match.index).split("\n").length;
      const key = `${relativePath}:${line}`;

      if (!allowlistedRawImages.has(key)) {
        violations.push(key);
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Raw <img> elements found in scoped Next.js source:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
}

function walk(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
      files.push(...walk(join(directory, entry.name)));
      continue;
    }

    if (entry.isFile() && sourceExtensions.has(getExtension(entry.name))) {
      files.push(join(directory, entry.name));
    }
  }

  return files;
}

function getExtension(fileName) {
  const dotIndex = fileName.lastIndexOf(".");

  return dotIndex === -1 ? "" : fileName.slice(dotIndex);
}
