import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, "scripts/image-config.json");
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const argv = new Set(process.argv.slice(2));
const dryRun = argv.has("--dry-run");
const checkOnly = argv.has("--check");
const rewriteMarkup = argv.has("--rewrite-markup");

if ([...argv].some((arg) => !["--dry-run", "--check", "--rewrite-markup"].includes(arg))) {
  fail("Usage: optimize-images.sh [--dry-run] [--check] [--rewrite-markup]");
}
if (checkOnly && (dryRun || rewriteMarkup)) {
  fail("--check cannot be combined with --dry-run or --rewrite-markup");
}

const configText = await fs.readFile(CONFIG_PATH, "utf8");
const config = JSON.parse(configText);
const configSha256 = sha256(Buffer.from(configText));
const manifestPath = path.join(ROOT, config.manifest);
const oldManifest = await readJson(manifestPath, { meta: {}, images: {} });
const htmlFiles = await findFiles(ROOT, (file) => file.endsWith(".html"), ["_site", ".git"]);
const cssFiles = await findFiles(ROOT, (file) => file.endsWith(".css"), ["_site", ".git"]);
const references = await discoverReferences(htmlFiles);
await discoverLegacyCssReferences(cssFiles, references);

if (references.size === 0) {
  fail("No /assets/images references were found in HTML sources.");
}

const sources = [...references]
  .filter((webPath) => SUPPORTED_EXTENSIONS.has(path.extname(webPath).toLowerCase()))
  .filter((webPath) => !webPath.startsWith(`/${config.outputRoot}/`))
  .filter((webPath) => webPath !== "/WOTG_project_2023/images/play.png")
  .sort();

if (checkOnly) {
  await checkManifest(sources, oldManifest);
  console.log(`Image assets are current (${sources.length} source images).`);
  process.exit(0);
}

const nextManifest = {
  meta: {
    generatedBy: "scripts/optimize-images.sh",
    configSha256,
    format: "webp",
    sourceCount: sources.length
  },
  images: {}
};

let generatedCount = 0;
let reusedCount = 0;
let originalBytes = 0;
let optimizedBytes = 0;

for (const webPath of sources) {
  const sourcePath = localPath(webPath);
  const sourceBuffer = await fs.readFile(sourcePath);
  const sourceSha256 = sha256(sourceBuffer);
  const sourceStats = await fs.stat(sourcePath);
  const oldEntry = oldManifest.images?.[webPath];

  originalBytes += sourceStats.size;

  if (oldManifest.meta?.configSha256 === configSha256 &&
      oldEntry?.sourceSha256 === sourceSha256 &&
      await variantsExist(oldEntry.variants)) {
    nextManifest.images[webPath] = oldEntry;
    optimizedBytes += oldEntry.variants.reduce((sum, variant) => sum + variant.bytes, 0);
    reusedCount += oldEntry.variants.length;
    continue;
  }

  const metadata = await sharp(sourceBuffer, { animated: false }).metadata();
  if (!metadata.width || !metadata.height) {
    fail(`Could not determine dimensions for ${webPath}`);
  }
  const displayHeight = metadata.height;

  const requestedWidths = config.widthOverrides[webPath] ?? config.widths;
  const widths = [...new Set([
    ...requestedWidths.filter((width) => width <= metadata.width),
    Math.min(metadata.width, Math.max(...requestedWidths))
  ])].sort((a, b) => a - b);
  const quality = config.qualitySensitive.includes(webPath)
    ? config.qualitySensitiveQuality
    : config.quality;
  const variants = [];

  for (const width of widths) {
    const outputWebPath = variantPath(webPath, width);
    const outputPath = localPath(outputWebPath);
    const height = Math.round(displayHeight * width / metadata.width);

    if (dryRun) {
      console.log(`would generate ${outputWebPath} (${width}x${height}, quality ${quality})`);
      continue;
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const outputBuffer = await sharp(sourceBuffer, { animated: false })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 5, smartSubsample: true })
      .toBuffer();
    await fs.writeFile(outputPath, outputBuffer);
    variants.push({
      width,
      height,
      src: outputWebPath,
      bytes: outputBuffer.length,
      sha256: sha256(outputBuffer)
    });
    optimizedBytes += outputBuffer.length;
    generatedCount += 1;
  }

  if (!dryRun) {
    const fallback = variants.find((variant) => variant.width >= 1100) ?? variants.at(-1);
    nextManifest.images[webPath] = {
      width: metadata.width,
      height: displayHeight,
      sourceBytes: sourceStats.size,
      sourceSha256,
      fallback: fallback.src,
      variants
    };
  }
}

if (dryRun) {
  console.log(`Dry run complete: ${sources.length} referenced static images inspected.`);
  process.exit(0);
}

nextManifest.meta.originalBytes = originalBytes;
nextManifest.meta.optimizedBytes = optimizedBytes;
nextManifest.meta.variantCount = generatedCount + reusedCount;
await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`);

let rewritten = 0;
if (rewriteMarkup) {
  rewritten = await rewriteHtml(htmlFiles, nextManifest);
  rewritten += await rewriteLegacyCss(cssFiles, nextManifest);
}

console.log(`Optimized ${sources.length} source images: ${generatedCount} generated, ${reusedCount} reused.`);
console.log(`Referenced originals: ${formatBytes(originalBytes)}; responsive variants: ${formatBytes(optimizedBytes)}.`);
if (rewriteMarkup) {
  console.log(`Rewrote ${rewritten} image tags to use the responsive-image include.`);
}

async function checkManifest(expectedSources, manifest) {
  const errors = [];
  if (manifest.meta?.configSha256 !== configSha256) {
    errors.push("image manifest configuration hash is stale");
  }
  for (const webPath of expectedSources) {
    const entry = manifest.images?.[webPath];
    if (!entry) {
      errors.push(`manifest entry missing: ${webPath}`);
      continue;
    }
    const sourceBuffer = await fs.readFile(localPath(webPath));
    if (entry.sourceSha256 !== sha256(sourceBuffer)) {
      errors.push(`source changed since optimization: ${webPath}`);
    }
    for (const variant of entry.variants ?? []) {
      try {
        const outputBuffer = await fs.readFile(localPath(variant.src));
        if (variant.sha256 !== sha256(outputBuffer)) {
          errors.push(`optimized file checksum mismatch: ${variant.src}`);
        }
      } catch {
        errors.push(`optimized file missing: ${variant.src}`);
      }
    }
  }
  const unexpected = Object.keys(manifest.images ?? {}).filter((webPath) => !expectedSources.includes(webPath));
  for (const webPath of unexpected) {
    errors.push(`manifest contains unreferenced source: ${webPath}`);
  }
  if (errors.length) {
    for (const error of errors) console.error(`ERROR: ${error}`);
    fail(`Image verification failed with ${errors.length} error(s).`);
  }
}

async function discoverReferences(files) {
  const found = new Set();
  const pattern = /\/assets\/images\/[A-Za-z0-9_./&%+() -]+?\.(?:png|jpe?g|gif)/gi;
  const legacyPattern = /images\/[A-Za-z0-9_.&() -]+?\.(?:png|jpe?g)/gi;
  for (const file of files) {
    const contents = await fs.readFile(file, "utf8");
    for (const match of contents.matchAll(pattern)) found.add(match[0]);
    if (path.relative(ROOT, file).startsWith("WOTG_project_2023/")) {
      for (const match of contents.matchAll(legacyPattern)) {
        const webPath = legacyWebPath(match[0]);
        if (await fileExists(localPath(webPath))) found.add(webPath);
      }
    }
  }
  return found;
}

async function discoverLegacyCssReferences(files, found) {
  const pattern = /images\/[A-Za-z0-9_.&() -]+?\.(?:png|jpe?g)/gi;
  for (const file of files) {
    if (!path.relative(ROOT, file).startsWith("WOTG_project_2023/")) continue;
    const contents = await fs.readFile(file, "utf8");
    for (const match of contents.matchAll(pattern)) {
      const webPath = legacyWebPath(match[0]);
      if (await fileExists(localPath(webPath))) found.add(webPath);
    }
  }
}

async function rewriteHtml(files, manifest) {
  let total = 0;
  const imageTag = /<img\b([^>]*?)\bsrc=(['"])(\/assets\/images\/[A-Za-z0-9_./&%+() -]+?\.(?:png|jpe?g))\2([^>]*)>/gi;
  for (const file of files) {
    const relativeFile = path.relative(ROOT, file);
    const original = await fs.readFile(file, "utf8");
    if (relativeFile.startsWith("WOTG_project_2023/")) {
      const { contents, count } = rewriteLegacyImageTags(original, manifest);
      if (count > 0 && contents !== original) {
        await fs.writeFile(file, contents);
        total += count;
      }
      continue;
    }
    let fileCount = 0;
    const updated = original.replace(imageTag, (tag, before, _quote, src, after) => {
      if (!manifest.images[src]) return tag;
      const attributes = `${before} ${after}`;
      const className = attributeValue(attributes, "class");
      const alt = attributeValue(attributes, "alt") ?? "";
      const eager = config.eagerByFile[relativeFile]?.includes(src) ?? false;
      const highPriority = config.highPriorityByFile[relativeFile] === src;
      const sizes = sizesFor(src);
      const parts = [
        "{% include responsive-image.html",
        `src=${liquidQuote(src)}`,
        `alt=${liquidQuote(alt)}`,
        `sizes=${liquidQuote(sizes)}`,
        `loading=${liquidQuote(eager ? "eager" : "lazy")}`
      ];
      if (className) parts.push(`class=${liquidQuote(className)}`);
      if (highPriority) parts.push('fetchpriority="high"');
      parts.push("%}");
      fileCount += 1;
      return parts.join(" ");
    });
    if (fileCount > 0 && updated !== original) {
      await fs.writeFile(file, updated);
      total += fileCount;
    }
  }
  return total;
}

function rewriteLegacyImageTags(original, manifest) {
  const dynamicPlay = /src="\/assets\/images\/optimized\/WOTG_project_2023\/images\/play-260\.webp"\s+srcset="[^"]+"\s+sizes="130px"\s+loading="eager"\s+decoding="async"\s+data-original-src="\/WOTG_project_2023\/images\/play\.png"/gi;
  let count = 0;
  let restoredCount = 0;
  const restored = original.replace(dynamicPlay, () => {
    restoredCount += 1;
    return "src=images/play.png";
  });
  const imageTag = /<img\b[^>]*>/gi;
  const sourceAttribute = /\bsrc\s*=\s*(?:(["'])(images\/[A-Za-z0-9_.&() -]+?\.(?:png|jpe?g))\1|(images\/[A-Za-z0-9_.&() -]+?\.(?:png|jpe?g)))/i;
  const contents = restored.replace(imageTag, (tag) => {
    const sourceMatch = tag.match(sourceAttribute);
    const relativeSource = sourceMatch?.[2] ?? sourceMatch?.[3];
    if (!relativeSource) return tag;
    const webPath = legacyWebPath(relativeSource);
    const image = manifest.images[webPath];
    if (!image) return tag;
    const srcset = image.variants.map((variant) => `${variant.src} ${variant.width}w`).join(", ");
    const sizes = "(max-width: 900px) calc(100vw - 40px), 1100px";
    const replacement = `src="${image.fallback}" srcset="${srcset}" sizes="${sizes}" loading="eager" decoding="async" data-original-src="${webPath}"`;
    count += 1;
    return tag.replace(sourceMatch[0], replacement);
  });
  return { contents, count: count + restoredCount };
}

async function rewriteLegacyCss(files, manifest) {
  let total = 0;
  const imageUrl = /url\(\s*(["']?)(images\/[A-Za-z0-9_.&() -]+?\.(?:png|jpe?g))\1\s*\)/gi;
  for (const file of files) {
    if (!path.relative(ROOT, file).startsWith("WOTG_project_2023/")) continue;
    const original = await fs.readFile(file, "utf8");
    let count = 0;
    const updated = original.replace(imageUrl, (value, _quote, relativeSource) => {
      const webPath = legacyWebPath(relativeSource);
      const image = manifest.images[webPath];
      if (!image) return value;
      count += 1;
      return `url("${image.variants.at(-1).src}") /* source: ${relativeSource} */`;
    });
    if (count > 0 && updated !== original) {
      await fs.writeFile(file, updated);
      total += count;
    }
  }
  return total;
}

function sizesFor(src) {
  if (config.compactPatterns.some((pattern) => src.startsWith(pattern))) {
    return "(max-width: 520px) calc(100vw - 40px), (max-width: 820px) calc(50vw - 26px), 360px";
  }
  if (config.wideImages.includes(src)) {
    return "(max-width: 820px) calc(100vw - 40px), 1100px";
  }
  if (src === "/assets/images/website_images/nav_bar_home.png") return "64px";
  if (src.includes("/website_images/") && src.endsWith("_symbol.png")) {
    return "(max-width: 760px) 180px, 320px";
  }
  return "(max-width: 820px) calc(100vw - 40px), 600px";
}

function attributeValue(attributes, name) {
  const match = attributes.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2];
}

function liquidQuote(value) {
  return `"${String(value).replaceAll("&quot;", "\\&quot;").replaceAll('"', "\\&quot;")}"`;
}

function variantPath(webPath, width) {
  const relative = webPath.startsWith("/assets/images/")
    ? webPath.replace(/^\/assets\/images\//, "")
    : webPath.replace(/^\//, "");
  const parsed = path.posix.parse(relative);
  return `/${config.outputRoot}/${parsed.dir ? `${parsed.dir}/` : ""}${parsed.name}-${width}.webp`;
}

function legacyWebPath(relativeSource) {
  return `/WOTG_project_2023/${relativeSource}`;
}

function localPath(webPath) {
  return path.join(ROOT, webPath.replace(/^\//, ""));
}

async function variantsExist(variants = []) {
  if (variants.length === 0) return false;
  return (await Promise.all(variants.map(async (variant) => {
    try {
      await fs.access(localPath(variant.src));
      return true;
    } catch {
      return false;
    }
  }))).every(Boolean);
}

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function findFiles(directory, predicate, excludedNames) {
  const results = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (excludedNames.includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...await findFiles(entryPath, predicate, excludedNames));
    else if (predicate(entryPath)) results.push(entryPath);
  }
  return results;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
