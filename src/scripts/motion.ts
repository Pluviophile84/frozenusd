/** Pauses the looping hero animation while it is off-screen. */
export function initMotionVisibility(selector: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(([entry]) => {
    element.classList.toggle('is-offscreen', !entry?.isIntersecting);
  });
  observer.observe(element);
}
