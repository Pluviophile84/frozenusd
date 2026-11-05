/**
 * Official Frozen USD logo ("B-Rim": hexagon with rim, cyan face, ink symbol),
 * copied verbatim from brand-source/FrozenUSD-B-Rim/vector/FrozenUSD-B-Rim.svg.
 * tests/brand.test.mjs verifies these strings still match the official file.
 * Do not edit, simplify or re-draw this geometry.
 */
export const LOGO_VIEWBOX = 1024;

export const LOGO_RIM_POINTS =
  '512.000000000000,0.000000000000 955.405006737633,256.000000000000 955.405006737633,768.000000000000 512.000000000000,1024.000000000000 68.594993262367,768.000000000000 68.594993262367,256.000000000000';
export const LOGO_FACE_POINTS =
  '512.000000000000,14.780166891254 942.605006737633,263.390083445627 942.605006737633,760.609916554373 512.000000000000,1009.219833108746 81.394993262367,760.609916554373 81.394993262367,263.390083445627';
export const EMBLEM_PATH =
  'M482.826343,184.320000 L482.826343,242.667315 L427.081092,210.482780 L397.907436,261.013036 L482.826343,310.040990 L482.826343,316.167194 L347.881977,316.167194 L289.518460,417.255769 L347.881977,518.344344 L471.870020,518.344344 L508.337092,581.507164 L632.325134,581.507164 L646.895762,606.744231 L632.325134,631.981297 L380.734744,631.981297 L355.215895,587.781354 L289.526562,625.707108 L336.941855,707.832806 L482.826343,707.832806 L482.826343,713.959010 L397.907436,762.986964 L427.081092,813.517220 L482.826343,781.332685 L482.826343,839.680000 L541.173657,839.680000 L541.173657,781.332685 L596.918908,813.517220 L626.092564,762.986964 L541.173657,713.959010 L541.173657,707.832806 L676.118023,707.832806 L734.481540,606.744231 L676.118023,505.655656 L552.129980,505.655656 L515.662908,442.492836 L391.674866,442.492836 L377.104238,417.255769 L391.674866,392.018703 L643.265256,392.018703 L668.784105,436.218646 L734.473438,398.292892 L687.058145,316.167194 L541.173657,316.167194 L541.173657,310.040990 L626.092564,261.013036 L596.918908,210.482780 L541.173657,242.667315 L541.173657,184.320000 Z';

export const BRAND_COLORS = {
  rim: '#6EC7E9',
  cyan: '#79DAFF',
  ink: '#071827',
} as const;

/** The complete official logo as SVG markup, scaled to `size` with its top-left at (x, y). */
export function logoMark(x: number, y: number, size: number): string {
  const scale = size / LOGO_VIEWBOX;
  return (
    `<g transform="translate(${x} ${y}) scale(${scale})">` +
    `<polygon points="${LOGO_RIM_POINTS}" fill="${BRAND_COLORS.rim}"/>` +
    `<polygon points="${LOGO_FACE_POINTS}" fill="${BRAND_COLORS.cyan}"/>` +
    `<path fill="${BRAND_COLORS.ink}" fill-rule="evenodd" d="${EMBLEM_PATH}"/>` +
    `</g>`
  );
}

/**
 * The logo on the navy tile used for cyan surfaces, matching the official
 * maskable icon (brand-source/FrozenUSD-B-Rim/platform/favicon/maskable-512x512.png):
 * the unchanged logo at 80% of a navy square.
 */
export function logoOnNavyTile(x: number, y: number, size: number, radius = size * 0.22): string {
  const inner = size * 0.8;
  const offset = (size - inner) / 2;
  return (
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${radius}" fill="${BRAND_COLORS.ink}"/>` +
    logoMark(x + offset, y + offset, inner)
  );
}
