import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");

const apps = [
  {
    name: "invite",
    source: "assets/brand/lumiere-invite-app-icon.svg",
  },
  {
    name: "dashboard",
    source: "assets/brand/lumiere-dashboard-app-icon.svg",
  },
];

const standardExports = [
  { path: "logo.png", size: 1024 },
  { path: "icons/icon-192.png", size: 192 },
  { path: "icons/icon-512.png", size: 512 },
];

const fullBleedExports = [
  { path: "apple-touch-icon.png", size: 180 },
  { path: "icons/maskable-icon-192.png", size: 192 },
  { path: "icons/maskable-icon-512.png", size: 512 },
];

const faviconSizes = [16, 32, 48, 64];
const mismatches = [];

for (const app of apps) {
  const source = await readFile(resolve(repositoryRoot, app.source), "utf8");
  const fullBleedSource = makeFullBleed(source);
  const publicDirectory = resolve(repositoryRoot, `apps/${app.name}/public`);

  for (const output of standardExports) {
    const data = await renderPng(source, output.size);
    await emit(resolve(publicDirectory, output.path), data);
  }

  for (const output of fullBleedExports) {
    const data = await renderPng(fullBleedSource, output.size);
    await emit(resolve(publicDirectory, output.path), data);
  }

  const faviconPngs = await Promise.all(
    faviconSizes.map(async (size) => ({ data: await renderPng(source, size), size })),
  );
  await emit(resolve(publicDirectory, "favicon.ico"), createIco(faviconPngs));
}

if (mismatches.length > 0) {
  throw new Error(`Brand assets are stale:\n${mismatches.map((path) => `- ${path}`).join("\n")}`);
}

console.log(checkOnly ? "Brand assets match their SVG sources." : "Brand assets regenerated.");

function makeFullBleed(source) {
  return source
    .replaceAll(
      'data-canvas="true" x="32" y="32" width="960" height="960" rx="224"',
      'data-canvas="true" x="0" y="0" width="1024" height="1024" rx="0"',
    )
    .replace(/\s*<rect data-role="keyline"[^>]+\/>/, "");
}

async function renderPng(source, size) {
  return sharp(Buffer.from(source))
    .resize(size, size, { fit: "fill", kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

async function emit(path, data) {
  const relativePath = path.slice(repositoryRoot.length + 1);

  if (checkOnly) {
    let current;
    try {
      current = await readFile(path);
    } catch {
      mismatches.push(relativePath);
      return;
    }

    if (!current.equals(data)) {
      mismatches.push(relativePath);
    }
    return;
  }

  await writeFile(path, data);
}

function createIco(images) {
  const headerSize = 6;
  const directoryEntrySize = 16;
  const dataOffset = headerSize + images.length * directoryEntrySize;
  const header = Buffer.alloc(dataOffset);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let imageOffset = dataOffset;
  images.forEach(({ data, size }, index) => {
    const entryOffset = headerSize + index * directoryEntrySize;
    header.writeUInt8(size >= 256 ? 0 : size, entryOffset);
    header.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(data.length, entryOffset + 8);
    header.writeUInt32LE(imageOffset, entryOffset + 12);
    imageOffset += data.length;
  });

  return Buffer.concat([header, ...images.map(({ data }) => data)]);
}
