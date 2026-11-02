/** Pause the product film outside the viewport and when the tab is hidden. */
export function initMotionVisibility(selector: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return;
  let visible = true;
  const update = () => element.classList.toggle('is-offscreen', !visible || document.hidden);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      update();
    }).observe(element);
  }
  document.addEventListener('visibilitychange', update);
  const stage = element.querySelector<HTMLElement>('.stage');
  const pause = element.querySelector<HTMLInputElement>('.motion-switch');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  const reset = () => {
    cancelAnimationFrame(frame);
    stage?.style.setProperty('--tilt-x', '0deg');
    stage?.style.setProperty('--tilt-y', '0deg');
  };
  stage?.addEventListener('pointermove', (event) => {
    if (reduce.matches || !fine.matches || pause?.checked) return;
    const rect = stage.getBoundingClientRect();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      stage.style.setProperty('--tilt-x', `${-(event.clientY - rect.top - rect.height / 2) / rect.height * 3}deg`);
      stage.style.setProperty('--tilt-y', `${(event.clientX - rect.left - rect.width / 2) / rect.width * 4}deg`);
    });
  });
  stage?.addEventListener('pointerleave', reset);
  pause?.addEventListener('change', reset);
  reduce.addEventListener('change', reset);
}

/** Animate on entry without making content depend on JavaScript to be visible. */
export function initSectionMotion(): void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (!reduce.matches) entry.target.animate(
        [{ opacity: 0.35, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 720, easing: 'cubic-bezier(.16,1,.3,1)' },
      );
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.section > .container').forEach((element) => observer.observe(element));
  reduce.addEventListener('change', () => {
    if (reduce.matches) {
      observer.disconnect();
      document.querySelectorAll('.section > .container').forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
    }
  });
}
