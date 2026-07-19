import { describe, it, expect } from 'vitest';
import { extractCompletionContent } from '../../../src/lib/server/completionParser';

describe('extractCompletionContent', () => {
  it('extracts content from choices array format', () => {
    const completion = {
      choices: [
        {
          message: {
            content: 'Response from AI',
          },
        },
      ],
    };

    const result = extractCompletionContent(completion);
    expect(result).toBe('Response from AI');
  });

  it('extracts content from direct message format', () => {
    const completion = {
      message: {
        content: 'Direct response',
      },
    };

    const result = extractCompletionContent(completion);
    expect(result).toBe('Direct response');
  });

  it('returns empty string for null completion', () => {
    const result = extractCompletionContent(null);
    expect(result).toBe('');
  });

  it('returns empty string for undefined completion', () => {
    const result = extractCompletionContent(undefined);
    expect(result).toBe('');
  });

  it('returns empty string when no content is found', () => {
    const completion = {
      choices: [],
    };

    const result = extractCompletionContent(completion);
    expect(result).toBe('');
  });

  it('returns empty string for completion without message', () => {
    const completion = {
      choices: [{}],
    };

    const result = extractCompletionContent(completion);
    expect(result).toBe('');
  });

  it('prioritizes choices format over direct message', () => {
    const completion = {
      choices: [
        {
          message: {
            content: 'From choices',
          },
        },
      ],
      message: {
        content: 'From direct',
      },
    };

    const result = extractCompletionContent(completion);
    expect(result).toBe('From choices');
  });

  it('handles empty content string', () => {
    const completion = {
      message: {
        content: '',
      },
    };

    const result = extractCompletionContent(completion);
    expect(result).toBe('');
  });

  it('handles content with whitespace', () => {
    const completion = {
      message: {
        content: '  Response with spaces  ',
      },
    };

    const result = extractCompletionContent(completion);
    expect(result).toBe('  Response with spaces  ');
  });
});
