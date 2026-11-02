/** Same-page navigation, including repeated clicks on an already-active #top. */
export function initScrollNavigation(): void {
  let frame = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const cancel = () => cancelAnimationFrame(frame);
  window.addEventListener('wheel', cancel, { passive: true });
  window.addEventListener('touchstart', cancel, { passive: true });
  document.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab'].includes(event.key)) cancel();
  });
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    let id: string;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const header = document.querySelector<HTMLElement>('[data-header]');
    const top = id === 'top' ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight ?? 68) - 16);
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    target.focus({ preventScroll: true });
    history.replaceState(history.state, '', url.hash);
    cancel();
    const start = window.scrollY;
    // Cancel any browser-owned anchor animation before taking over the curve.
    window.scrollTo({ top: start, behavior: 'instant' });
    if (reduce.matches || Math.abs(start - top) < 2) {
      window.scrollTo({ top, behavior: 'instant' });
      return;
    }
    const began = performance.now();
    const duration = Math.min(1250, 600 + Math.abs(start - top) * 0.065);
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const ease = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: reduce.matches ? top : start + (top - start) * ease, behavior: 'instant' });
      if (progress < 1 && !reduce.matches) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  });
}
