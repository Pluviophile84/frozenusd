/**
 * Hero orbit motion, ported from Pluviophile84/frzusd (src/scripts/interactions.ts).
 * The scene moves only while it is visible, the tab is shown, the user has not
 * paused it and reduced motion is not requested.
 */
export function initHeroMotion(): void {
  const motion = document.querySelector<HTMLButtonElement>('.motion-toggle');
  const art = document.querySelector<HTMLElement>('.hero-art');
  if (!motion || !art) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = reduced.matches;
  let inView = true;
  const apply = () => {
    const paused = userPaused || reduced.matches;
    art.classList.toggle('is-moving', !paused && inView && !document.hidden);
    motion.setAttribute('aria-pressed', String(paused));
    motion.textContent = paused ? 'Replay movement' : 'Pause movement';
  };
  motion.hidden = false;
  art.classList.add('motion-ready');
  apply();
  motion.addEventListener('click', () => {
    userPaused = !userPaused;
    apply();
  });
  reduced.addEventListener('change', () => {
    userPaused = reduced.matches;
    apply();
  });
  document.addEventListener('visibilitychange', apply);
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      apply();
    });
    visibility.observe(art);
  }
}
