import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoScroll } from '../../src/hooks/useAutoScroll';
import { useRef } from 'react';

describe('useAutoScroll', () => {
  let mockScrollIntoView: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockScrollIntoView = vi.fn();
  });

  it('scrolls target element into view when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({ deps }) => {
        const ref = useRef<HTMLDivElement>(null);
        // Mock the scrollIntoView method
        if (ref.current) {
          ref.current.scrollIntoView = mockScrollIntoView;
        }
        useAutoScroll(ref, deps);
        return ref;
      },
      { initialProps: { deps: [1] } }
    );

    const testElement = document.createElement('div');
    testElement.scrollIntoView = mockScrollIntoView;
    (result.current as any).current = testElement;

    rerender({ deps: [2] });

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'end',
    });
  });

  it('does not throw if scrollIntoView is not supported', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useAutoScroll(ref, [1]);
      return ref;
    });

    const testElement = document.createElement('div');
    delete (testElement as any).scrollIntoView;
    (result.current as any).current = testElement;

    expect(() => {
      // Force re-render to trigger the effect
      renderHook(() => useAutoScroll(result.current, [2]));
    }).not.toThrow();
  });

  it('handles null ref gracefully', () => {
    expect(() => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        useAutoScroll(ref, [1]);
      });
    }).not.toThrow();
  });

  it('scrolls on each dependency change', () => {
    const testElement = document.createElement('div');
    testElement.scrollIntoView = mockScrollIntoView;

    const { rerender } = renderHook(
      ({ deps }) => {
        const ref = useRef<HTMLDivElement>(testElement);
        useAutoScroll(ref, deps);
      },
      { initialProps: { deps: [1, 'a'] } }
    );

    rerender({ deps: [2, 'a'] });
    rerender({ deps: [2, 'b'] });
    rerender({ deps: [3, 'c'] });

    expect(mockScrollIntoView).toHaveBeenCalledTimes(4); // Initial + 3 changes
  });
});
