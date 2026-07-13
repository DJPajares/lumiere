import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const scopedDirectories = ["apps/dashboard", "apps/invite", "packages/themes/src"];
const sourceExtensions = new Set([".js", ".jsx", ".mdx", ".ts", ".tsx"]);
const ignoredDirectories = new Set([".next", "coverage", "dist", "node_modules"]);

// Keep technically justified raw image cases here with a short reason. Tests and fixtures are
// excluded because their strings are not rendered by the scoped Next.js applications.
const allowlistedRawImages = new Map();
const imageWrapperPath = "apps/invite/components/invite-image.tsx";

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
        violations.push(
          `${key} uses a raw <img>; use next/image or document a justified exception.`,
        );
      }
    }

    if (relativePath === imageWrapperPath) {
      for (const requiredProp of ["height={height}", "unoptimized", "width={width}"]) {
        if (!source.includes(requiredProp)) {
          violations.push(
            `${relativePath} must keep ${requiredProp} so arbitrary invite images reserve space and bypass unsupported optimizer hosts.`,
          );
        }
      }
      continue;
    }

    for (const match of source.matchAll(/<(Image|InviteImage)\b([\s\S]*?)\/>/g)) {
      const [, component, props = ""] = match;
      const line = source.slice(0, match.index).split("\n").length;
      const location = `${relativePath}:${line}`;
      const hasPriority = /(?:^|\s)priority(?:\s|=|$)/.test(props);
      const hasLazyLoading = /loading=["']lazy["']/.test(props);
      const hasEagerLoading = /loading=["']eager["']/.test(props);
      const hasSizes = /(?:^|\s)sizes=/.test(props);
      const hasIntrinsicSize = /(?:^|\s)height=/.test(props) && /(?:^|\s)width=/.test(props);
      const hasFill = /(?:^|\s)fill(?:\s|=|$)/.test(props);
      const hasDynamicRemoteSource = /src=\{[^}]*?(?:\.url|Url)[^}]*?\}/.test(props);

      if (!hasSizes) {
        violations.push(`${location} must declare responsive sizes to avoid oversized downloads.`);
      }

      if (component === "Image" && !hasIntrinsicSize && !hasFill) {
        violations.push(
          `${location} must provide width/height or a constrained fill container to prevent layout shift.`,
        );
      }

      if (hasDynamicRemoteSource && !hasPriority && !hasLazyLoading) {
        violations.push(
          `${location} renders dynamic remote media below the hero without loading="lazy".`,
        );
      }

      if (hasPriority && relativePath !== "apps/invite/components/public-invite.tsx") {
        violations.push(
          `${location} uses priority outside the public invite hero; below-the-fold images must remain lazy.`,
        );
      }

      if (hasEagerLoading && !hasPriority) {
        violations.push(`${location} uses eager loading without being the documented LCP image.`);
      }
    }
  }
}

for (const configPath of ["apps/dashboard/next.config.ts", "apps/invite/next.config.ts"]) {
  const config = readFileSync(join(root, configPath), "utf8");

  if (!/images:\s*\{[\s\S]*?unoptimized:\s*true/.test(config)) {
    violations.push(
      `${configPath} must keep images.unoptimized enabled so validated arbitrary remote media does not break on an optimizer host allowlist.`,
    );
  }
}

if (violations.length > 0) {
  console.error("Next Image contract violations found in scoped source:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    "Next Image contracts are clean: no raw images, intrinsic layout is reserved, dynamic media is lazy, and eager loading is limited to the invite hero.",
  );
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
