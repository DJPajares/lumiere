import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repositoryRoot = process.cwd();
const protectedRoots = ["apps/invite", "packages/themes"];
const themeSourceRoot = path.join(repositoryRoot, "packages/themes/src/themes");
const dashboardPreviewRoot = path.join(repositoryRoot, "apps/dashboard/components/invite-preview");
const sourceExtensions = new Set([".cjs", ".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const checkedExtensions = new Set([...sourceExtensions, ".css", ".json"]);
const ignoredDirectories = new Set([".next", ".turbo", "coverage", "dist", "node_modules"]);
const forbiddenDependencies = ["@lumiere/dashboard-ui", "@base-ui/react", "shadcn"];

async function listFiles(directory, extensions = checkedExtensions) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath, extensions)));
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function relative(file) {
  return path.relative(repositoryRoot, file);
}

function lineNumber(contents, index) {
  return contents.slice(0, index).split("\n").length;
}

function getModuleSpecifiers(contents) {
  const specifiers = [];
  const patterns = [
    /\b(?:import|export)\b[\s\S]*?\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s*(?:\(\s*)?["']([^"']+)["']/g,
    /\brequire\s*\(\s*["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of contents.matchAll(pattern)) {
      specifiers.push({ index: match.index, value: match[1] });
    }
  }

  return specifiers.filter(
    (specifier, index) =>
      specifiers.findIndex(
        (candidate) => candidate.index === specifier.index && candidate.value === specifier.value,
      ) === index,
  );
}

function isTestOrFixture(file) {
  return (
    /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file) ||
    file.split(path.sep).some((part) => part === "tests" || part === "__fixtures__")
  );
}

const contracts = await readFile(
  path.join(repositoryRoot, "packages/themes/src/contracts.ts"),
  "utf8",
);
const themeIdsBlock = contracts.match(/export const themeIds\s*=\s*\[([\s\S]*?)\]\s*as const/);

if (!themeIdsBlock) {
  console.error(
    "Theme ownership check could not read themeIds from packages/themes/src/contracts.ts. Keep the typed theme ID registry in that documented location.",
  );
  process.exit(1);
}

const themeIds = new Set(
  [...themeIdsBlock[1].matchAll(/["']([^"']+)["']/g)].map((match) => match[1]),
);
const escapedThemeIds = [...themeIds].map((themeId) =>
  themeId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
);
const themeIdPattern = escapedThemeIds.join("|");
const quotedThemeIdPattern = `["'](?:${themeIdPattern})["']`;
const concreteThemeLogicPatterns = [
  new RegExp(`${quotedThemeIdPattern}\\s*(?:===?|!==?)`),
  new RegExp(`(?:===?|!==?)\\s*${quotedThemeIdPattern}`),
  new RegExp(`\\bcase\\s+${quotedThemeIdPattern}\\s*:`),
  new RegExp(`${quotedThemeIdPattern}\\s*:`),
  new RegExp(
    `^\\s*(?:${escapedThemeIds.filter((themeId) => !themeId.includes("-")).join("|")})\\s*:`,
  ),
];
const violations = [];

for (const protectedRoot of protectedRoots) {
  for (const file of await listFiles(path.join(repositoryRoot, protectedRoot))) {
    const contents = await readFile(file, "utf8");

    for (const dependency of forbiddenDependencies) {
      if (contents.includes(dependency)) {
        violations.push(
          `${relative(file)} references ${dependency}. Move dashboard primitives to apps/dashboard or packages/dashboard-ui; invite themes must remain custom and dependency-free.`,
        );
      }
    }
  }
}

for (const file of await listFiles(path.join(repositoryRoot, "apps/invite"), sourceExtensions)) {
  if (isTestOrFixture(file)) continue;

  const contents = await readFile(file, "utf8");

  for (const [index, line] of contents.split("\n").entries()) {
    if (concreteThemeLogicPatterns.some((pattern) => pattern.test(line))) {
      violations.push(
        `${relative(file)}:${index + 1} contains app-level logic keyed to a concrete theme ID. Move theme behavior/copy into packages/themes and consume it through resolveTheme or another public resolver.`,
      );
    }
  }
}

const themeDirectories = (await readdir(themeSourceRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const themeDirectory of themeDirectories) {
  const moduleRoot = path.join(themeSourceRoot, themeDirectory);

  for (const file of await listFiles(moduleRoot, sourceExtensions)) {
    const contents = await readFile(file, "utf8");

    for (const specifier of getModuleSpecifiers(contents)) {
      if (!specifier.value.startsWith(".")) continue;

      const resolved = path.resolve(path.dirname(file), specifier.value);
      const relativeToThemes = path.relative(themeSourceRoot, resolved);
      const importedThemeDirectory = relativeToThemes.split(path.sep)[0];
      const importsThemeAggregator =
        resolved === themeSourceRoot || resolved === path.join(themeSourceRoot, "index");

      if (
        importsThemeAggregator ||
        (themeDirectories.includes(importedThemeDirectory) &&
          importedThemeDirectory !== themeDirectory)
      ) {
        violations.push(
          `${relative(file)}:${lineNumber(contents, specifier.index)} imports another theme or the central theme aggregator. Keep ${themeDirectory} independently loadable; share only neutral contracts/helpers outside theme directories.`,
        );
      }
    }
  }
}

for (const file of await listFiles(dashboardPreviewRoot, sourceExtensions)) {
  const contents = await readFile(file, "utf8");

  for (const specifier of getModuleSpecifiers(contents)) {
    const importsPrivateThemeFile =
      specifier.value.startsWith("@lumiere/themes/") &&
      specifier.value !== "@lumiere/themes/styles.css";
    const reachesThemeSource =
      specifier.value.startsWith(".") &&
      path.resolve(path.dirname(file), specifier.value).startsWith(themeSourceRoot);

    if (importsPrivateThemeFile || reachesThemeSource) {
      violations.push(
        `${relative(file)}:${lineNumber(contents, specifier.index)} imports a private theme file. Dashboard previews must consume only public @lumiere/themes exports.`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error("Theme ownership boundary violations:\n");
  console.error(violations.map((violation) => `- ${violation}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Theme ownership boundaries are clean across ${protectedRoots.join(
      " and ",
    )}; ${themeDirectories.length} theme modules remain independent.`,
  );
}
