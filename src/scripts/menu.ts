/** Small-screen disclosure menu: expanded state, Escape, outside click, focus return. */
export function initMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!toggle || !menu) return;

  toggle.hidden = false;
  const compact = window.matchMedia('(max-width: 899px)');

  const setOpen = (open: boolean, returnFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
    if (open) menu.querySelector<HTMLAnchorElement>('a')?.focus();
  });

  menu.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false, true);
    }
  });

  document.addEventListener('click', (event) => {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    const target = event.target as Node;
    if (!menu.contains(target) && !toggle.contains(target)) setOpen(false);
  });

  // Close when focus leaves the menu (e.g. tabbing past the last link).
  menu.addEventListener('focusout', (event) => {
    const next = event.relatedTarget as Node | null;
    if (compact.matches && next && !menu.contains(next) && next !== toggle) setOpen(false);
  });

  compact.addEventListener('change', () => setOpen(false));
}
