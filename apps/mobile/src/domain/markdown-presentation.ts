// The existing native legal renderer presents Markdown as readable plain text.
// Apply the same inline-marker treatment to headings, paragraphs, and bullets;
// this does not edit, shorten, or regenerate the canonical legal documents.
export function legalDisplayText(text: string): string {
  return text.replace(/\*\*/g, "").replace(/`/g, "");
}
