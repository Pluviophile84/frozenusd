/** Splits a multi-sentence headline into sentences, for deliberate line breaks. */
export function sentences(text: string): string[] {
  return text.split(/(?<=\.)\s+/);
}
