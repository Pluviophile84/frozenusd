/**
 * Copy-to-clipboard for configured contract addresses.
 * Buttons stay hidden unless JavaScript runs and the Clipboard API exists,
 * so no control ever silently does nothing. Feedback goes to a status region.
 */
export const COPY_MESSAGES = {
  success: 'Address copied.',
  failure: 'Copy failed. Select the address and copy it manually.',
} as const;

let initialised = false;

export function initCopyButtons(): void {
  if (initialised) return;
  initialised = true;
  const supported = typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function';

  document.querySelectorAll<HTMLButtonElement>('[data-copy-button]').forEach((button) => {
    const root = button.closest<HTMLElement>('[data-copy-root]');
    const status = root?.querySelector<HTMLElement>('[data-copy-status]');
    const value = button.dataset.copyValue;
    if (!root || !status || !value || !supported) return;

    button.hidden = false;
    let timer: number | undefined;

    button.addEventListener('click', async () => {
      window.clearTimeout(timer);
      status.textContent = '';
      try {
        await navigator.clipboard.writeText(value);
        status.textContent = COPY_MESSAGES.success;
      } catch {
        status.textContent = COPY_MESSAGES.failure;
        const code = root.querySelector('code');
        if (code) window.getSelection()?.selectAllChildren(code);
      }
      timer = window.setTimeout(() => {
        status.textContent = '';
      }, 6000);
    });
  });
}
