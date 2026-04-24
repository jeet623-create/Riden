import sharp from 'sharp';
import { MENU_HEIGHT, MENU_WIDTH, MenuDefinition } from './definitions';

const BRAND_TEAL = '#1D9E75';
const BRAND_TEAL_LIGHT = '#28C8A0';
const BRAND_BG = '#0A0B0E';
const WHITE = '#FFFFFF';

/**
 * Generates a 2500×843 PNG for a rich menu with N colored zones and text labels.
 *
 * Uses `sharp` which produces real compressed PNGs well under LINE's 1MB limit.
 * The critical thing is the exact dimensions — LINE silently rejects other sizes.
 */
export async function buildMenuImage(menu: MenuDefinition): Promise<Buffer> {
  const zones = menu.zoneLabels.length;
  const zoneWidth = Math.floor(MENU_WIDTH / zones);

  // Build SVG with colored rectangles, dividers, and Thai text labels
  const rectangles: string[] = [];
  const labels: string[] = [];
  const dividers: string[] = [];

  for (let i = 0; i < zones; i++) {
    const x = i * zoneWidth;
    const w = i === zones - 1 ? MENU_WIDTH - x : zoneWidth;
    const color = i % 2 === 0 ? BRAND_TEAL : BRAND_TEAL_LIGHT;
    const label = menu.zoneLabels[i];

    // Zone background
    rectangles.push(
      `<rect x="${x}" y="0" width="${w}" height="${MENU_HEIGHT}" fill="${color}"/>`
    );

    // Divider line between zones
    if (i > 0) {
      dividers.push(
        `<rect x="${x - 2}" y="0" width="4" height="${MENU_HEIGHT}" fill="${BRAND_BG}" opacity="0.25"/>`
      );
    }

    // Centered Thai label (large) + English label (small)
    const cx = x + w / 2;
    const cy = MENU_HEIGHT / 2;
    labels.push(`
      <text x="${cx}" y="${cy - 20}" font-family="Noto Sans Thai, sans-serif"
            font-size="88" font-weight="700" fill="${WHITE}"
            text-anchor="middle" dominant-baseline="middle">${escapeXml(label.th)}</text>
      <text x="${cx}" y="${cy + 70}" font-family="Inter, sans-serif"
            font-size="38" font-weight="500" fill="${WHITE}" opacity="0.85"
            text-anchor="middle" dominant-baseline="middle">${escapeXml(label.en)}</text>
    `);
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${MENU_WIDTH}" height="${MENU_HEIGHT}" viewBox="0 0 ${MENU_WIDTH} ${MENU_HEIGHT}">
  ${rectangles.join('\n  ')}
  ${dividers.join('\n  ')}
  ${labels.join('\n  ')}
</svg>`;

  const png = await sharp(Buffer.from(svg))
    .resize(MENU_WIDTH, MENU_HEIGHT, { fit: 'fill' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  // Sanity check — LINE enforces exact dimensions
  const meta = await sharp(png).metadata();
  if (meta.width !== MENU_WIDTH || meta.height !== MENU_HEIGHT) {
    throw new Error(
      `Generated image is ${meta.width}×${meta.height}, expected ${MENU_WIDTH}×${MENU_HEIGHT}`
    );
  }

  // LINE max is 1 MB
  if (png.byteLength > 1_000_000) {
    throw new Error(`Generated image is ${png.byteLength} bytes, exceeds LINE 1MB limit`);
  }

  return png;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Accepts a user-uploaded PNG and validates it's the correct dimensions.
 * Admin UI can use this to upload real Canva designs.
 */
export async function validateAndNormalizeMenuImage(input: Buffer): Promise<Buffer> {
  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) {
    throw new Error('Could not read image dimensions');
  }

  let img = sharp(input);

  // If user uploaded anything else, resize to exactly 2500×843 using cover fit
  if (meta.width !== MENU_WIDTH || meta.height !== MENU_HEIGHT) {
    img = img.resize(MENU_WIDTH, MENU_HEIGHT, { fit: 'cover', position: 'center' });
  }

  const png = await img
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  if (png.byteLength > 1_000_000) {
    // Re-encode with more aggressive quality reduction
    return sharp(input)
      .resize(MENU_WIDTH, MENU_HEIGHT, { fit: 'cover' })
      .png({ compressionLevel: 9, palette: true, quality: 80 })
      .toBuffer();
  }

  return png;
}
