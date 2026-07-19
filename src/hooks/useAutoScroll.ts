import { RefObject, useEffect } from "react";

/**
 * Custom hook to automatically scroll a target element into view when dependencies change.
 * Useful for chat interfaces to keep the latest message visible.
 * 
 * @param {RefObject<Element | null>} target - React ref pointing to the element to scroll to
 * @param {readonly unknown[]} dependencies - Array of dependencies that trigger the scroll
 * 
 * @example
 * ```tsx
 * const messagesEndRef = useRef<HTMLDivElement>(null);
 * useAutoScroll(messagesEndRef, [messages, isTyping]);
 * 
 * return (
 *   <div>
 *     {messages.map(msg => <Message key={msg.id} {...msg} />)}
 *     <div ref={messagesEndRef} />
 *   </div>
 * );
 * ```
 */
export function useAutoScroll(
  target: RefObject<Element | null>,
  dependencies: readonly unknown[],
): void {
  useEffect(() => {
    // Use optional chaining to safely handle browsers that don't support scrollIntoView
    target.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, dependencies);
}
