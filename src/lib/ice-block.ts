/**
 * The FROZEN USD product object: the official emblem on a coin, suspended
 * inside a clear, beveled block of ice. Returned as SVG markup so the same
 * geometry is shared by the website (hero, diagram) and the generated
 * poster / social assets (scripts/build-assets.mjs).
 *
 * Local coordinates: the front face spans 0..200 on both axes. The block's
 * depth recedes up and to the right by (DX, DY), so the full object occupies
 * x 0..242, y -32..200. Light comes from the upper left.
 *
 * The emblem path and colours are the unchanged official artwork.
 */
import { EMBLEM_PATH, BRAND_COLORS } from './emblem.ts';

export const BLOCK = {
  size: 200,
  dx: 42,
  dy: -32,
  bevel: 22,
  /** Bounding box of the whole object in local units. */
  bounds: { x: 0, y: -32, width: 242, height: 232 },
} as const;

export type IceDetail = 'full' | 'simple';

interface Point {
  x: number;
  y: number;
}

const pts = (list: Point[]): string => list.map((p) => `${p.x},${p.y}`).join(' ');

/** Official circle + emblem, scaled to radius `r` around (cx, cy). */
export function emblemDisc(cx: number, cy: number, r: number): string {
  const scale = (r * 2) / 1024;
  return (
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${BRAND_COLORS.cyan}"/>` +
    `<path transform="translate(${cx - r} ${cy - r}) scale(${scale})" fill="${BRAND_COLORS.ink}" fill-rule="evenodd" d="${EMBLEM_PATH}"/>`
  );
}

/**
 * SVG markup (a <g>) for the ice block. `id` must be unique per document;
 * it prefixes every gradient, clip path, mask and filter id.
 */
export function iceBlockSvg(id: string, detail: IceDetail = 'full'): string {
  const S = BLOCK.size;
  const { dx, dy, bevel: b } = BLOCK;
  const u = (name: string) => `${id}-${name}`;
  const ref = (name: string) => `url(#${u(name)})`;

  // Coin sits mid-depth inside the block, so it is offset towards the back.
  const cx = 121;
  const cy = 86;
  const rim = 74;
  const face = 66;

  const front: Point[] = [
    { x: 0, y: 0 },
    { x: S, y: 0 },
    { x: S, y: S },
    { x: 0, y: S },
  ];
  const top: Point[] = [
    { x: 0, y: 0 },
    { x: S, y: 0 },
    { x: S + dx, y: dy },
    { x: dx, y: dy },
  ];
  const side: Point[] = [
    { x: S, y: 0 },
    { x: S + dx, y: dy },
    { x: S + dx, y: S + dy },
    { x: S, y: S },
  ];
  const facetTop: Point[] = [
    { x: 0, y: 0 },
    { x: S, y: 0 },
    { x: S - b, y: b },
    { x: b, y: b },
  ];
  const facetLeft: Point[] = [
    { x: 0, y: 0 },
    { x: b, y: b },
    { x: b, y: S - b },
    { x: 0, y: S },
  ];
  const facetRight: Point[] = [
    { x: S, y: 0 },
    { x: S, y: S },
    { x: S - b, y: S - b },
    { x: S - b, y: b },
  ];
  const facetBottom: Point[] = [
    { x: 0, y: S },
    { x: b, y: S - b },
    { x: S - b, y: S - b },
    { x: S, y: S },
  ];
  const silhouette: Point[] = [
    { x: 0, y: 0 },
    { x: dx, y: dy },
    { x: S + dx, y: dy },
    { x: S + dx, y: S + dy },
    { x: S, y: S },
    { x: 0, y: S },
  ];

  const coin = (extra = '') =>
    `<g${extra}>` +
    // Coin edge, visible towards the viewer's upper right.
    `<circle cx="${cx + 4.5}" cy="${cy - 3.5}" r="${rim}" fill="#1E8DBE"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${rim}" fill="${ref('rim')}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${rim - 3.5}" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1"/>` +
    emblemDisc(cx, cy, face) +
    `</g>`;

  const full = detail === 'full';

  const defs =
    `<defs>` +
    `<linearGradient id="${u('body')}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#FFFFFF" stop-opacity="0.78"/>` +
    `<stop offset="0.55" stop-color="#E4F6FE" stop-opacity="0.6"/>` +
    `<stop offset="1" stop-color="#A9DFF5" stop-opacity="0.62"/>` +
    `</linearGradient>` +
    `<radialGradient id="${u('glow')}" cx="0.5" cy="0.45" r="0.62">` +
    `<stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#FFFFFF" stop-opacity="0.42"/>` +
    `</radialGradient>` +
    `<linearGradient id="${u('rim')}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#D9F5FF"/>` +
    `<stop offset="0.5" stop-color="#8FDDFB"/>` +
    `<stop offset="1" stop-color="#3BA9D6"/>` +
    `</linearGradient>` +
    `<linearGradient id="${u('top')}" x1="0" y1="1" x2="0.25" y2="0">` +
    `<stop offset="0" stop-color="#FFFFFF" stop-opacity="0.96"/>` +
    `<stop offset="1" stop-color="#D4F1FD" stop-opacity="0.9"/>` +
    `</linearGradient>` +
    `<linearGradient id="${u('side')}" x1="0" y1="0" x2="1" y2="0.3">` +
    `<stop offset="0" stop-color="#8AD6F5" stop-opacity="0.94"/>` +
    `<stop offset="1" stop-color="#3FA6D6" stop-opacity="0.86"/>` +
    `</linearGradient>` +
    `<linearGradient id="${u('streak')}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#FFFFFF" stop-opacity="0.5"/>` +
    `<stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>` +
    `</linearGradient>` +
    `<linearGradient id="${u('facetR')}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#6CC8EE" stop-opacity="0.28"/>` +
    `<stop offset="1" stop-color="#2F9CCB" stop-opacity="0.36"/>` +
    `</linearGradient>` +
    `<linearGradient id="${u('tirR')}" x1="1" y1="0" x2="0" y2="0">` +
    `<stop offset="0" stop-color="#1E8DBE" stop-opacity="0.26"/>` +
    `<stop offset="1" stop-color="#1E8DBE" stop-opacity="0"/>` +
    `</linearGradient>` +
    `<linearGradient id="${u('tirB')}" x1="0" y1="1" x2="0" y2="0">` +
    `<stop offset="0" stop-color="#1E8DBE" stop-opacity="0.22"/>` +
    `<stop offset="1" stop-color="#1E8DBE" stop-opacity="0"/>` +
    `</linearGradient>` +
    `<clipPath id="${u('front')}"><polygon points="${pts(front)}"/></clipPath>` +
    `<clipPath id="${u('facets')}"><polygon points="${pts(facetTop)}"/><polygon points="${pts(facetRight)}"/></clipPath>` +
    (full
      ? `<filter id="${u('frost')}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">` +
        `<feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="11"/>` +
        `<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.4 0 0 0 -1.15"/>` +
        `</filter>` +
        `<radialGradient id="${u('frostFade')}" cx="0.42" cy="0.5" r="0.75">` +
        `<stop offset="0.45" stop-color="#000"/>` +
        `<stop offset="1" stop-color="#FFF"/>` +
        `</radialGradient>` +
        `<mask id="${u('frostMask')}" maskUnits="userSpaceOnUse" x="-4" y="-36" width="250" height="240">` +
        `<rect x="-4" y="-36" width="250" height="240" fill="${ref('frostFade')}"/>` +
        `</mask>`
      : '') +
    `</defs>`;

  const bubbles = full
    ? [
        [34, 152, 2.4],
        [46, 166, 1.5],
        [58, 140, 1.1],
        [160, 172, 1.9],
        [172, 160, 1.2],
        [30, 58, 1.6],
        [146, 186, 1.1],
      ]
        .map(
          ([x, y, r]) =>
            `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" fill-opacity="0.75" stroke="#2F9CCB" stroke-opacity="0.35" stroke-width="0.6"/>`,
        )
        .join('')
    : '';

  return (
    `<g class="ice-block">` +
    defs +
    // Ice body behind the coin.
    `<polygon points="${pts(front)}" fill="${ref('body')}"/>` +
    // Back edges seen through the clear ice.
    `<polyline points="${dx},${dy} ${dx},${S + dy} ${S + dx},${S + dy}" fill="none" stroke="#FFFFFF" stroke-opacity="0.85" stroke-width="1.3"/>` +
    `<polyline points="${dx + 1.2},${dy + 2} ${dx + 1.2},${S + dy + 1.2} ${S + dx - 2},${S + dy + 1.2}" fill="none" stroke="#2F9CCB" stroke-opacity="0.22" stroke-width="1"/>` +
    `<line x1="0" y1="${S}" x2="${dx}" y2="${S + dy}" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="1"/>` +
    // The coin, then a refracted copy displaced inside the bevel facets.
    `<g clip-path="${ref('front')}">` +
    coin() +
    `<g clip-path="${ref('facets')}"><g transform="translate(7 -6)" opacity="0.92">${coin()}</g></g>` +
    `</g>` +
    // Ice surface over the coin: soft edge glow, specular streaks.
    `<polygon points="${pts(front)}" fill="${ref('glow')}"/>` +
    `<g clip-path="${ref('front')}">` +
    `<polygon points="28,0 84,0 0,84 0,28" fill="${ref('streak')}"/>` +
    `<polygon points="104,0 114,0 0,114 0,104" fill="#FFFFFF" fill-opacity="0.22"/>` +
    `<polygon points="200,118 200,150 150,200 118,200" fill="#FFFFFF" fill-opacity="0.12"/>` +
    `<rect x="${S - b - 16}" y="${b}" width="16" height="${S - 2 * b}" fill="${ref('tirR')}"/>` +
    `<rect x="${b}" y="${S - b - 14}" width="${S - 2 * b}" height="14" fill="${ref('tirB')}"/>` +
    `<line x1="${b + 6}" y1="${S - b - 3}" x2="${S - b - 30}" y2="${S - b - 3}" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1"/>` +
    `</g>` +
    // Bevel facets, lit from the upper left.
    `<polygon points="${pts(facetTop)}" fill="#FFFFFF" fill-opacity="0.5"/>` +
    `<polygon points="${pts(facetLeft)}" fill="#FFFFFF" fill-opacity="0.34"/>` +
    `<polygon points="${pts(facetRight)}" fill="${ref('facetR')}"/>` +
    `<polygon points="${pts(facetBottom)}" fill="#0B5E7E" fill-opacity="0.16"/>` +
    `<g stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.9" fill="none">` +
    `<line x1="0" y1="0" x2="${b}" y2="${b}"/><line x1="${S}" y1="0" x2="${S - b}" y2="${b}"/>` +
    `<line x1="0" y1="${S}" x2="${b}" y2="${S - b}"/><line x1="${S}" y1="${S}" x2="${S - b}" y2="${S - b}"/>` +
    `<rect x="${b}" y="${b}" width="${S - 2 * b}" height="${S - 2 * b}" stroke-opacity="0.75"/>` +
    `</g>` +
    // Depth faces.
    `<polygon points="${pts(top)}" fill="${ref('top')}"/>` +
    `<polygon points="${pts(side)}" fill="${ref('side')}"/>` +
    `<polyline points="${b * 0.7},${-b * 0.42} ${S + dx - b * 0.55},${-b * 0.42 + 0.0} " fill="none" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="1"/>` +
    `<polyline points="${S + b * 0.38},${-b * 0.2} ${S + b * 0.38},${S - b * 0.75}" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1"/>` +
    `<polygon points="${S + 6},${-2} ${S + 14},${-8} ${S + 14},${S - 30} ${S + 6},${S - 22}" fill="#FFFFFF" fill-opacity="0.22"/>` +
    // Frost, concentrated at edges and corners.
    (full
      ? `<g mask="${ref('frostMask')}" opacity="0.7"><polygon points="${pts(silhouette)}" fill="#FFFFFF" filter="${ref('frost')}"/></g>`
      : '') +
    bubbles +
    // Crisp edges.
    `<polygon points="${pts(silhouette)}" fill="none" stroke="#0B5E7E" stroke-opacity="0.32" stroke-width="1"/>` +
    `<polyline points="0,${S} 0,0 ${S},0 ${S + dx},${dy}" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>` +
    `<line x1="0" y1="0" x2="${dx}" y2="${dy}" stroke="#FFFFFF" stroke-width="1.6"/>` +
    `<line x1="${dx}" y1="${dy}" x2="${S + dx}" y2="${dy}" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="1.2"/>` +
    `<line x1="${S}" y1="0" x2="${S}" y2="${S}" stroke="#FFFFFF" stroke-opacity="0.85" stroke-width="1.3"/>` +
    `</g>`
  );
}

/** Soft contact shadow with a cyan caustic, centred under the block. */
export function iceShadowSvg(id: string, cx: number, cy: number, width = 250): string {
  const u = (name: string) => `${id}-${name}`;
  return (
    `<g class="ice-shadow">` +
    `<defs>` +
    `<radialGradient id="${u('shadow')}"><stop offset="0" stop-color="#071827" stop-opacity="0.34"/><stop offset="1" stop-color="#071827" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${u('caustic')}"><stop offset="0" stop-color="#79DAFF" stop-opacity="0.75"/><stop offset="1" stop-color="#79DAFF" stop-opacity="0"/></radialGradient>` +
    `</defs>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${width / 2}" ry="${width / 11}" fill="url(#${u('shadow')})"/>` +
    `<ellipse cx="${cx + width * 0.08}" cy="${cy + 2}" rx="${width * 0.24}" ry="${width / 22}" fill="url(#${u('caustic')})"/>` +
    `</g>`
  );
}
