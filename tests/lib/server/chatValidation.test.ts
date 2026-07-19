import { describe, it, expect } from 'vitest';
import {
  VALID_CHAT_ROLES,
  MAX_CHAT_MESSAGES,
  MAX_CHAT_CONTENT_LENGTH,
  sanitizeChatInput,
  validateChatRequest,
  formatMessagesForProvider,
} from '../../../src/lib/server/chatValidation';

describe('chatValidation', () => {
  describe('VALID_CHAT_ROLES', () => {
    it('contains expected roles', () => {
      expect(VALID_CHAT_ROLES.has('user')).toBe(true);
      expect(VALID_CHAT_ROLES.has('assistant')).toBe(true);
      expect(VALID_CHAT_ROLES.has('model')).toBe(true);
      expect(VALID_CHAT_ROLES.has('system')).toBe(true);
    });

    it('does not contain invalid roles', () => {
      expect(VALID_CHAT_ROLES.has('admin')).toBe(false);
      expect(VALID_CHAT_ROLES.has('bot')).toBe(false);
    });
  });

  describe('sanitizeChatInput', () => {
    it('removes script tags', () => {
      const result = sanitizeChatInput('<script>alert("xss")</script>Hello');
      expect(result).toBe('Hello');
    });

    it('removes HTML tags', () => {
      const result = sanitizeChatInput('<div>Text</div><span>More</span>');
      expect(result).toBe('TextMore');
    });

    it('trims whitespace', () => {
      const result = sanitizeChatInput('  Text with spaces  ');
      expect(result).toBe('Text with spaces');
    });

    it('handles complex script injection attempts', () => {
      const result = sanitizeChatInput('<script src="evil.js"></script>Safe text');
      expect(result).toBe('Safe text');
    });

    it('preserves plain text', () => {
      const result = sanitizeChatInput('Plain text without HTML');
      expect(result).toBe('Plain text without HTML');
    });

    it('handles empty input', () => {
      const result = sanitizeChatInput('');
      expect(result).toBe('');
    });
  });

  describe('validateChatRequest', () => {
    it('validates valid request successfully', () => {
      const validRequest = {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
        context: { userName: 'John' },
      };

      const result = validateChatRequest(validRequest);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.messages).toHaveLength(2);
        expect(result.data.context).toEqual({ userName: 'John' });
      }
    });

    it('rejects non-object body', () => {
      const result = validateChatRequest(null);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('Invalid request');
      }
    });

    it('rejects missing messages array', () => {
      const result = validateChatRequest({ context: {} });
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('messages must be an array');
      }
    });

    it('rejects non-array messages', () => {
      const result = validateChatRequest({ messages: 'not an array' });
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('messages must be an array');
      }
    });

    it('rejects too many messages', () => {
      const tooManyMessages = Array(MAX_CHAT_MESSAGES + 1).fill({
        role: 'user',
        content: 'Message',
      });

      const result = validateChatRequest({ messages: tooManyMessages });
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('Too many messages');
      }
    });

    it('rejects invalid message role', () => {
      const result = validateChatRequest({
        messages: [{ role: 'invalid', content: 'Text' }],
      });
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('Invalid message role');
      }
    });

    it('rejects message with content too long', () => {
      const longContent = 'a'.repeat(MAX_CHAT_CONTENT_LENGTH + 1);
      const result = validateChatRequest({
        messages: [{ role: 'user', content: longContent }],
      });
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('content too long');
      }
    });

    it('rejects message with non-string content', () => {
      const result = validateChatRequest({
        messages: [{ role: 'user', content: 12345 as any }],
      });
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('Invalid message format');
      }
    });

    it('handles missing context gracefully', () => {
      const result = validateChatRequest({
        messages: [{ role: 'user', content: 'Hello' }],
      });
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.context).toEqual({});
      }
    });

    it('ignores invalid context types', () => {
      const result = validateChatRequest({
        messages: [{ role: 'user', content: 'Hello' }],
        context: 'invalid' as any,
      });
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.context).toEqual({});
      }
    });
  });

  describe('formatMessagesForProvider', () => {
    it('formats user messages correctly', () => {
      const messages = [
        { role: 'user' as const, content: 'Hello world' },
      ];

      const result = formatMessagesForProvider(messages);

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('user');
      expect(result[0].content).toBe('Hello world');
    });

    it('maps non-user roles to assistant', () => {
      const messages = [
        { role: 'assistant' as const, content: 'Response' },
        { role: 'model' as const, content: 'Model response' },
        { role: 'system' as const, content: 'System message' },
      ];

      const result = formatMessagesForProvider(messages);

      expect(result.every(msg => msg.role === 'assistant')).toBe(true);
    });

    it('sanitizes content in all messages', () => {
      const messages = [
        { role: 'user' as const, content: '<script>alert("xss")</script>Clean text' },
      ];

      const result = formatMessagesForProvider(messages);

      expect(result[0].content).toBe('Clean text');
    });

    it('handles empty messages array', () => {
      const result = formatMessagesForProvider([]);
      
      expect(result).toEqual([]);
    });

    it('preserves message order', () => {
      const messages = [
        { role: 'user' as const, content: 'First' },
        { role: 'assistant' as const, content: 'Second' },
        { role: 'user' as const, content: 'Third' },
      ];

      const result = formatMessagesForProvider(messages);

      expect(result[0].content).toBe('First');
      expect(result[1].content).toBe('Second');
      expect(result[2].content).toBe('Third');
    });
  });
});
