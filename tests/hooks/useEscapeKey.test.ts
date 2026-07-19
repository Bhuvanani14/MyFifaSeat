import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEscapeKey } from '../../src/hooks/useEscapeKey';

describe('useEscapeKey', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls onClose when Escape key is pressed and hook is active', () => {
    renderHook(() => useEscapeKey(true, mockOnClose));

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when hook is inactive', () => {
    renderHook(() => useEscapeKey(false, mockOnClose));

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('does not call onClose for other keys', () => {
    renderHook(() => useEscapeKey(true, mockOnClose));

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(event);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('prevents default behavior when Escape is pressed', () => {
    renderHook(() => useEscapeKey(true, mockOnClose));

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('removes event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useEscapeKey(true, mockOnClose));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('updates event listener when isActive changes', () => {
    const { rerender } = renderHook(
      ({ isActive }) => useEscapeKey(isActive, mockOnClose),
      { initialProps: { isActive: false } }
    );

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    expect(mockOnClose).not.toHaveBeenCalled();

    rerender({ isActive: true });
    document.dispatchEvent(event);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('works with different onClose callbacks', () => {
    const mockOnClose2 = vi.fn();

    const { rerender } = renderHook(
      ({ callback }) => useEscapeKey(true, callback),
      { initialProps: { callback: mockOnClose } }
    );

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnClose2).not.toHaveBeenCalled();

    rerender({ callback: mockOnClose2 });
    document.dispatchEvent(event);
    expect(mockOnClose2).toHaveBeenCalledTimes(1);
  });
});
