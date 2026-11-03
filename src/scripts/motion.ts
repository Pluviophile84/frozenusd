/**
 * Pauses the hero orbit while it is off-screen or the tab is hidden, using
 * classes that sit alongside (and never override) the user's own pause
 * switch: a cube the user paused stays paused when it comes back into view.
 */
export function initOrbitMotion(selector: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      element.classList.toggle('is-offscreen', !entry?.isIntersecting);
    });
    observer.observe(element);
  }

  const syncVisibility = () => element.classList.toggle('is-hidden', document.visibilityState === 'hidden');
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();
}
