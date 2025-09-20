/**
 * Utility function to check if an event target is a text input element
 * This prevents global keydown handlers from interfering with typing in inputs
 */
export function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    target.isContentEditable ||
    (target as HTMLInputElement).type === 'search'
  );
}
