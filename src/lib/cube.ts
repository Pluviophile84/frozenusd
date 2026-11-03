/**
 * The approved Frozen USD ice-cube artwork: the cyan coin embedded in clear
 * ice, with a transparent exterior. Every cube on the site and in generated
 * assets uses this one image. Do not redraw, recolour or overlay it.
 *
 * Master: brand-source/ice-cube/frozen-usd-ice-cube-master.png (1254×1254).
 * Exports: public/media/cube/frozen-usd-ice-cube-<width>.webp, written by
 * `npm run assets` (scripts/build-assets.mjs).
 */
export const CUBE_MASTER = 'brand-source/ice-cube/frozen-usd-ice-cube-master.png';
export const CUBE_NATIVE_SIZE = 1254;
export const CUBE_WIDTHS = [160, 320, 640, 960] as const;
export type CubeWidth = (typeof CUBE_WIDTHS)[number];

export const cubeSrc = (width: CubeWidth): string => `/media/cube/frozen-usd-ice-cube-${width}.webp`;

/** srcset for the given export widths (defaults to all). */
export const cubeSrcset = (widths: readonly CubeWidth[] = CUBE_WIDTHS): string =>
  widths.map((w) => `${cubeSrc(w)} ${w}w`).join(', ');

/**
 * Where the visible cube sits inside the square image, as fractions of the
 * image size (measured from the master's alpha channel). Used to rest the
 * cube on surfaces without cropping the artwork.
 */
export const CUBE_CONTENT = { left: 0.065, top: 0.061, right: 0.935, bottom: 0.919 } as const;
