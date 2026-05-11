// Generate Kaimoku brand assets from spec.mjs.
// Writes:
//   src/app/{icon.svg,apple-icon.png,favicon.ico}     -- Next.js auto-discovery (deployed site favicons)
//   public/brand/v1/{icon.svg,logo-mark.svg,apple-icon.png,favicon.ico,MANIFEST.json}
//   public/brand/latest/  (duplicate of v1; alias only — bump explicitly on major change)

import sharp from 'sharp';
import toIco from 'to-ico';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPEC } from './spec.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');

function markSvg({ variant = 'full', crisp = false } = {}) {
  const { viewBoxW: w, viewBoxH: h, strokeWidth: sw } = SPEC.mark;
  const half = sw / 2;
  const innerLeft = sw;
  const innerRight = w - sw;
  const y1 = h / 3;
  const y2 = (h / 3) * 2;
  const rendering = crisp ? ' shape-rendering="crispEdges"' : '';
  const parts = [
    `<rect x="${half}" y="${half}" width="${w - sw}" height="${h - sw}" stroke="${SPEC.ink}" stroke-width="${sw}"/>`,
    `<line x1="${innerLeft}" y1="${y1}" x2="${innerRight}" y2="${y1}" stroke="${SPEC.orange}" stroke-width="${sw}"/>`,
  ];
  if (variant === 'full') {
    parts.push(`<line x1="${innerLeft}" y1="${y2}" x2="${innerRight}" y2="${y2}" stroke="${SPEC.ink}" stroke-width="${sw}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none"${rendering}>${parts.join('')}</svg>`;
}

async function renderSquarePng({ pxSize, variant }) {
  const aspect = SPEC.mark.viewBoxW / SPEC.mark.viewBoxH;
  const markH = pxSize;
  const markW = Math.round(pxSize * aspect);
  const tinyRaster = pxSize <= SPEC.faviconVariantBreakpoint;
  const svg = markSvg({ variant, crisp: tinyRaster });

  let markBuffer;
  if (tinyRaster) {
    markBuffer = await sharp(Buffer.from(svg), { density: 384 })
      .resize(markW, markH, { kernel: 'lanczos3' })
      .png()
      .toBuffer();
  } else {
    const supersample = 4;
    markBuffer = await sharp(Buffer.from(svg), { density: 384 })
      .resize(markW * supersample, markH * supersample, { kernel: 'lanczos3' })
      .resize(markW, markH, { kernel: 'lanczos3' })
      .png()
      .toBuffer();
  }

  const left = Math.round((pxSize - markW) / 2);
  return sharp({
    create: { width: pxSize, height: pxSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: markBuffer, left, top: 0 }])
    .png()
    .toBuffer();
}

const APP_DIR = path.join(REPO_ROOT, 'src/app');
const BRAND_V1 = path.join(REPO_ROOT, 'public/brand/v1');
const BRAND_LATEST = path.join(REPO_ROOT, 'public/brand/latest');

await mkdir(APP_DIR, { recursive: true });
await mkdir(BRAND_V1, { recursive: true });
await mkdir(BRAND_LATEST, { recursive: true });

const iconSvg = markSvg({ variant: 'full' });
const apple = await renderSquarePng({ pxSize: 180, variant: 'full' });
const ico = await toIco(await Promise.all([
  renderSquarePng({ pxSize: 16, variant: 'favicon' }),
  renderSquarePng({ pxSize: 24, variant: 'favicon' }),
  renderSquarePng({ pxSize: 32, variant: 'full' }),
  renderSquarePng({ pxSize: 48, variant: 'full' }),
]));

// Next.js auto-discovery for the deployed site (kaimoku-website.vercel.app)
await writeFile(path.join(APP_DIR, 'icon.svg'), iconSvg);
await writeFile(path.join(APP_DIR, 'apple-icon.png'), apple);
await writeFile(path.join(APP_DIR, 'favicon.ico'), ico);

// Versioned public distribution
for (const dir of [BRAND_V1, BRAND_LATEST]) {
  await writeFile(path.join(dir, 'icon.svg'), iconSvg);
  await writeFile(path.join(dir, 'logo-mark.svg'), iconSvg);
  await writeFile(path.join(dir, 'apple-icon.png'), apple);
  await writeFile(path.join(dir, 'favicon.ico'), ico);
}

// Manifest with per-file sha256 — consumers verify integrity before installing
const manifest = {
  round: SPEC.round,
  figmaFileKey: SPEC.figmaFileKey,
  generatedAt: new Date().toISOString().split('T')[0],
  files: {},
};
for (const f of ['icon.svg', 'logo-mark.svg', 'apple-icon.png', 'favicon.ico']) {
  const buf = await readFile(path.join(BRAND_V1, f));
  manifest.files[f] = 'sha256:' + createHash('sha256').update(buf).digest('hex');
}
for (const dir of [BRAND_V1, BRAND_LATEST]) {
  await writeFile(path.join(dir, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
}

console.log('Generated brand assets:');
console.log(`  Next.js auto-discovery: src/app/{icon.svg,apple-icon.png,favicon.ico}`);
console.log(`  Versioned public:       public/brand/v1/{icon.svg,logo-mark.svg,apple-icon.png,favicon.ico,MANIFEST.json}`);
console.log(`  Latest alias:           public/brand/latest/  (duplicate of v1)`);
console.log(`  Round: ${manifest.round}, generated: ${manifest.generatedAt}`);
