import { Fragment, ReactNode } from "react";
import { parseMarkdownBlocks, splitInlineMarkdown } from "../lib/markdown";

interface MarkdownMessageProps {
  content: string;
  headingClassName?: string;
  subheadingClassName?: string;
  paragraphClassName?: string;
  listClassName?: string;
}

/** Render a deliberately small, XSS-safe subset of Markdown without HTML injection. */
function InlineText({ content }: { content: string }): ReactNode {
  return splitInlineMarkdown(content).map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index} className="font-extrabold">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    return <Fragment key={index}>{token}</Fragment>;
  });
}

export default function MarkdownMessage({
  content,
  headingClassName = "font-display font-extrabold text-lg text-on-surface mt-4 mb-2",
  subheadingClassName = "font-display font-bold text-sm text-tertiary mt-3 mb-1",
  paragraphClassName = "text-xs text-on-surface-variant leading-relaxed mb-2",
  listClassName = "ml-4 list-disc text-xs text-on-surface-variant leading-relaxed space-y-1",
}: MarkdownMessageProps) {
  return (
    <div className="space-y-1">
      {parseMarkdownBlocks(content).map((block, index) => {
        if (block.type === "heading") {
          const Heading = `h${block.level}` as "h2" | "h3" | "h4";
          return (
            <Heading key={index} className={block.level === 2 ? headingClassName : subheadingClassName}>
              <InlineText content={block.content} />
            </Heading>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index} className={listClassName}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}><InlineText content={item} /></li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className={paragraphClassName}>
            {block.content.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                <InlineText content={line} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
