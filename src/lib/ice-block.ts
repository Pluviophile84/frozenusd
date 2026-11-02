/**
 * Shared product illustration: the unchanged official coin embedded in ice.
 * Cloudy inclusions, irregular edges and branching stress fractures replace
 * the polished bevels of a glass display case. No external image or runtime.
 */
import { EMBLEM_PATH, BRAND_COLORS } from './emblem.ts';

export const BLOCK = {
  size: 200, dx: 42, dy: -32, bevel: 22,
  bounds: { x: 0, y: -32, width: 242, height: 232 },
} as const;
export type IceDetail = 'full' | 'simple';

export function emblemDisc(cx: number, cy: number, r: number): string {
  const scale = (r * 2) / 1024;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${BRAND_COLORS.cyan}"/>` +
    `<path transform="translate(${cx - r} ${cy - r}) scale(${scale})" fill="${BRAND_COLORS.ink}" fill-rule="evenodd" d="${EMBLEM_PATH}"/>`;
}

/** Every definition is namespaced so multiple blocks can share a document. */
export function iceBlockSvg(id: string, detail: IceDetail = 'full'): string {
  const u = (name: string) => `${id}-${name}`;
  const ref = (name: string) => `url(#${u(name)})`;
  const full = detail === 'full';
  const front = 'M11 0 58 2 116 0 185 1Q199 1 200 15L198 67 200 136 198 184Q198 198 184 200L122 198 62 200 14 198Q1 198 1 184L3 122 0 65 1 14Q1 3 11 0Z';
  const top = 'M11 0 45-28Q51-32 61-31L226-30Q240-30 242-20L200 15Q199 1 185 1L116 0 58 2Z';
  const side = 'M200 15 242-20 240 45 242 108 239 157Q239 167 230 174L184 200Q198 198 198 184L200 136 198 67Z';
  const outline = 'M11 0 45-28Q51-32 61-31L226-30Q240-30 242-20L240 45 242 108 239 157Q239 167 230 174L184 200 122 198 62 200 14 198Q1 198 1 184L3 122 0 65 1 14Q1 3 11 0Z';
  const cracks = [
    'M5 24 23 34 29 51 40 59 44 78M23 34 39 30 52 35M29 51 17 61 20 77',
    'M9 175 29 161 35 143 47 131M29 161 46 166 64 159M35 143 26 134',
    'M198 153 178 146 170 155 151 160M178 146 181 129 175 117M170 155 173 174 160 187',
    'M218-25 205-14 188-13 175-3M205-14 204-3M237 65 226 78 230 96 217 113M226 78 215 73',
  ].map(d => `<path d="${d}"/>`).join('');
  // Deterministic air inclusions: dense at the frozen margins, sparse over the mark.
  const bubbles = Array.from({ length: full ? 72 : 18 }, (_, i) => {
    const x = 8 + ((i * 67 + 13) % 184);
    const y = 8 + ((i * 43 + 29) % 182);
    if (Math.hypot(x - 113, y - 86) < 72) return '';
    const r = (0.45 + ((i * 7) % 13) / 10).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" fill-opacity=".76" stroke="#5D9EB9" stroke-opacity=".28" stroke-width=".45"/>`;
  }).join('');
  return `<g class="ice-block"><defs>
    <linearGradient id="${u('body')}" x2=".8" y2="1"><stop stop-color="#E8F8FF"/><stop offset=".5" stop-color="#C2E4F1"/><stop offset="1" stop-color="#8DBED2"/></linearGradient>
    <linearGradient id="${u('top')}" x2=".25" y2="1"><stop stop-color="#FAFEFF"/><stop offset=".6" stop-color="#D2EAF3"/><stop offset="1" stop-color="#A8D1E2"/></linearGradient>
    <linearGradient id="${u('side')}" x2="1" y2=".5"><stop stop-color="#7BAEC6"/><stop offset=".45" stop-color="#BADCE9"/><stop offset="1" stop-color="#81B3C9"/></linearGradient>
    <linearGradient id="${u('rim')}" x2="1" y2="1"><stop stop-color="#F3FCFF"/><stop offset=".32" stop-color="#B4ECFF"/><stop offset=".7" stop-color="#399BC1"/><stop offset="1" stop-color="#C5EFFF"/></linearGradient>
    <radialGradient id="${u('cloud')}" cx=".57" cy=".42" r=".68"><stop offset=".38" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".73" stop-color="#F2FBFF" stop-opacity=".43"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".94"/></radialGradient>
    <linearGradient id="${u('snow')}" x2=".7" y2="1"><stop stop-color="#FFFFFF" stop-opacity=".85"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity=".12"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".8"/></linearGradient>
    <radialGradient id="${u('fade')}"><stop offset=".35" stop-color="#000000"/><stop offset="1" stop-color="#FFFFFF"/></radialGradient>
    <clipPath id="${u('clip')}"><path d="${outline}"/></clipPath>
    <clipPath id="${u('front')}"><path d="${front}"/></clipPath>
    ${`<filter id="${u('frost')}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".13 .19" numOctaves="${full ? 3 : 1}" seed="23"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.8 -.45"/></filter><mask id="${u('mask')}" x="0" y="-32" width="242" height="232" maskUnits="userSpaceOnUse"><rect y="-32" width="242" height="232" fill="${ref('fade')}"/></mask>`}
    </defs>
    <path d="${front}" fill="${ref('body')}"/>
    <g clip-path="${ref('front')}">
      <ellipse cx="122" cy="102" rx="81" ry="76" fill="#1A627E" opacity=".16"/>
      <circle cx="125" cy="84" r="74" fill="#287B9A"/>
      <circle cx="121" cy="86" r="74" fill="${ref('rim')}"/>
      <circle cx="121" cy="86" r="70.5" fill="none" stroke="#EBFAFF" stroke-width="1.2"/>
      ${emblemDisc(121, 86, 66)}
      <path d="${front}" fill="${ref('cloud')}"/>
      <path d="M0 13Q29 16 31 45T21 113Q31 160 73 172L123 198H0Z" fill="${ref('snow')}"/>
      <path d="M183 0 173 30 185 55 181 97 193 126 176 181 200 200 204 0Z" fill="#EDFAFF" opacity=".48"/>
      <path d="M12 187Q44 166 76 183T145 182L180 191 190 200H8Z" fill="#F8FDFF" opacity=".68"/>
      ${bubbles}
    </g>
    <path d="${top}" fill="${ref('top')}"/>
    <path d="${side}" fill="${ref('side')}"/>
    <g clip-path="${ref('clip')}">
      <path d="M38-18 72-24 145-22 194-26 227-21 212-13 148-11 93-14 58-8Z" fill="#FFFFFF" opacity=".52"/>
      <path d="M221-3 229-8 226 34 231 67 225 103 229 144 215 162 211 119 217 81 213 44Z" fill="#F4FCFF" opacity=".4"/>
      <g mask="${ref('mask')}" opacity="${full ? .85 : .52}"><path d="${outline}" filter="${ref('frost')}"/></g>
      <g fill="none" stroke="#FFFFFF" stroke-opacity=".78" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round">${cracks}</g>
      <g fill="none" stroke="#609EB7" stroke-opacity=".27" stroke-width=".45" transform="translate(1 1)">${cracks}</g>
      <path d="M16 5 53 8 83 5M4 86 7 112 5 142M17 191 48 189 64 193M206 9 210 36 207 59" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>
    </g>
    <path d="${outline}" fill="none" stroke="#7CAABD" stroke-opacity=".55" stroke-width=".8"/>
    <path d="M3 179 4 121 2 66 3 15Q3 5 12 2L58 4 116 2 184 3Q196 3 198 15M13 0 46-27Q51-30 61-29L223-28" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
    <path d="M200 18 198 67 200 136 196 183" fill="none" stroke="#EAF9FF" stroke-width="1.5" opacity=".8"/>
  </g>`;
}

export function iceShadowSvg(id: string, cx: number, cy: number, width = 250): string {
  return `<g class="ice-shadow"><defs>
    <radialGradient id="${id}-shadow"><stop stop-color="#103D54" stop-opacity=".3"/><stop offset="1" stop-color="#103D54" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}-caustic"><stop stop-color="#79DAFF" stop-opacity=".7"/><stop offset="1" stop-color="#79DAFF" stop-opacity="0"/></radialGradient>
    </defs><ellipse cx="${cx}" cy="${cy}" rx="${width / 2}" ry="${width / 11}" fill="url(#${id}-shadow)"/>
    <ellipse cx="${cx + width * .08}" cy="${cy + 2}" rx="${width * .24}" ry="${width / 22}" fill="url(#${id}-caustic)"/></g>`;
}
