/** Soft contact shadow with a cyan caustic, for a cube resting above a surface. */
export function contactShadowSvg(id: string, cx: number, cy: number, width = 250): string {
  const u = (name: string) => `${id}-${name}`;
  return (
    `<g class="contact-shadow">` +
    `<defs>` +
    `<radialGradient id="${u('shadow')}"><stop offset="0" stop-color="#071827" stop-opacity="0.34"/><stop offset="1" stop-color="#071827" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${u('caustic')}"><stop offset="0" stop-color="#79DAFF" stop-opacity="0.75"/><stop offset="1" stop-color="#79DAFF" stop-opacity="0"/></radialGradient>` +
    `</defs>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${width / 2}" ry="${width / 11}" fill="url(#${u('shadow')})"/>` +
    `<ellipse cx="${cx + width * 0.08}" cy="${cy + 2}" rx="${width * 0.24}" ry="${width / 22}" fill="url(#${u('caustic')})"/>` +
    `</g>`
  );
}
