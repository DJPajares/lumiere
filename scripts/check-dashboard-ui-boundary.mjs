import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repositoryRoot = process.cwd();
const protectedRoots = ["apps/invite", "packages/themes"];
const checkedExtensions = new Set([".cjs", ".css", ".js", ".jsx", ".json", ".mjs", ".ts", ".tsx"]);
const ignoredDirectories = new Set([".next", ".turbo", "coverage", "dist", "node_modules"]);
const forbiddenPackages = ["@lumiere/dashboard-ui", "@base-ui/react", "shadcn"];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else if (checkedExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

const violations = [];

for (const protectedRoot of protectedRoots) {
  const absoluteRoot = path.join(repositoryRoot, protectedRoot);

  for (const file of await listFiles(absoluteRoot)) {
    const contents = await readFile(file, "utf8");

    for (const packageName of forbiddenPackages) {
      if (contents.includes(packageName)) {
        violations.push(`${path.relative(repositoryRoot, file)} references ${packageName}`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Dashboard UI dependency boundary violations:\n");
  console.error(violations.map((violation) => `- ${violation}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Dashboard UI boundary is clean across ${protectedRoots.join(" and ")}.`);
}
