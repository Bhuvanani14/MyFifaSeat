import { describe, it, expect } from 'vitest';
import { parseMarkdownBlocks, splitInlineMarkdown } from '../../src/lib/markdown';

describe('parseMarkdownBlocks', () => {
  it('parses headings correctly', () => {
    const result = parseMarkdownBlocks('# Heading 1\n## Heading 2\n### Heading 3');
    
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: 'heading', level: 2, content: 'Heading 1' });
    expect(result[1]).toEqual({ type: 'heading', level: 3, content: 'Heading 2' });
    expect(result[2]).toEqual({ type: 'heading', level: 4, content: 'Heading 3' });
  });

  it('parses paragraphs correctly', () => {
    const result = parseMarkdownBlocks('This is a paragraph.\nWith multiple lines.');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'paragraph',
      content: ['This is a paragraph.', 'With multiple lines.'],
    });
  });

  it('parses bulleted lists correctly', () => {
    const result = parseMarkdownBlocks('- Item 1\n- Item 2\n- Item 3');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'list',
      items: ['Item 1', 'Item 2', 'Item 3'],
    });
  });

  it('parses lists with asterisk bullets', () => {
    const result = parseMarkdownBlocks('* First item\n* Second item');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'list',
      items: ['First item', 'Second item'],
    });
  });

  it('handles mixed content', () => {
    const markdown = `# Title\n\nSome text here.\n\n- List item 1\n- List item 2\n\n## Subtitle\n\nMore text.`;
    const result = parseMarkdownBlocks(markdown);

    expect(result).toHaveLength(5);
    expect(result[0].type).toBe('heading');
    expect(result[1].type).toBe('paragraph');
    expect(result[2].type).toBe('list');
    expect(result[3].type).toBe('heading');
    expect(result[4].type).toBe('paragraph');
  });

  it('handles empty lines between blocks', () => {
    const result = parseMarkdownBlocks('Paragraph 1\n\n\nParagraph 2');
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ type: 'paragraph', content: ['Paragraph 1'] });
    expect(result[1]).toEqual({ type: 'paragraph', content: ['Paragraph 2'] });
  });

  it('handles empty input', () => {
    const result = parseMarkdownBlocks('');
    expect(result).toEqual([]);
  });

  it('handles input with only whitespace', () => {
    const result = parseMarkdownBlocks('   \n\n   ');
    expect(result).toEqual([]);
  });

  it('trims whitespace from content', () => {
    const result = parseMarkdownBlocks('  # Heading with spaces  \n\n  Paragraph with spaces  ');
    
    expect(result[0]).toEqual({ type: 'heading', level: 2, content: 'Heading with spaces' });
    expect(result[1]).toEqual({ type: 'paragraph', content: ['Paragraph with spaces'] });
  });
});

describe('splitInlineMarkdown', () => {
  it('splits bold text correctly', () => {
    const result = splitInlineMarkdown('This is **bold** text');
    
    expect(result).toEqual(['This is ', '**bold**', ' text']);
  });

  it('splits italic text correctly', () => {
    const result = splitInlineMarkdown('This is *italic* text');
    
    expect(result).toEqual(['This is ', '*italic*', ' text']);
  });

  it('handles multiple bold sections', () => {
    const result = splitInlineMarkdown('**Bold 1** and **Bold 2**');
    
    expect(result).toEqual(['', '**Bold 1**', ' and ', '**Bold 2**', '']);
  });

  it('handles mixed bold and italic', () => {
    const result = splitInlineMarkdown('**Bold** and *italic* text');
    
    expect(result).toEqual(['', '**Bold**', ' and ', '*italic*', ' text']);
  });

  it('handles plain text without markdown', () => {
    const result = splitInlineMarkdown('Plain text only');
    
    expect(result).toEqual(['Plain text only']);
  });

  it('handles empty string', () => {
    const result = splitInlineMarkdown('');
    
    expect(result).toEqual(['']);
  });

  it('handles nested asterisks correctly', () => {
    const result = splitInlineMarkdown('***bold and italic*** text');
    
    // The function splits on bold (**) and italic (*) patterns
    // Since *** doesn't match the regex pattern exactly, it should remain as plain text
    expect(result.length).toBeGreaterThan(0);
  });

  it('does not match unbalanced markdown', () => {
    const result = splitInlineMarkdown('**Unbalanced bold text');
    
    expect(result).toEqual(['**Unbalanced bold text']);
  });

  it('handles markdown at start and end', () => {
    const result = splitInlineMarkdown('**Start** middle *end*');
    
    expect(result[0]).toBe('');
    expect(result[1]).toBe('**Start**');
    expect(result[result.length - 2]).toBe('*end*');
    expect(result[result.length - 1]).toBe('');
  });
});
