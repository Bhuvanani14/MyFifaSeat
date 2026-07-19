export type MarkdownBlock =
  | { type: "heading"; level: 2 | 3 | 4; content: string }
  | { type: "paragraph"; content: string[] }
  | { type: "list"; items: string[] };

/** Parse a small, XSS-safe Markdown subset into render blocks. */
export function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", content: paragraph });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length > 0) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  };

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: (heading[1].length + 1) as 2 | 3 | 4,
        content: heading[2],
      });
    } else if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
    } else if (line.length === 0) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line);
    }
  }

  flushParagraph();
  flushList();
  return blocks;
}

/** Split inline emphasis tokens for safe React rendering. */
export function splitInlineMarkdown(content: string): string[] {
  return content.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
}
