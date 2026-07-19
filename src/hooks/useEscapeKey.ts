import { useEffect } from "react";

/**
 * Custom hook to handle Escape key presses for closing modals and overlays.
 * Implements WCAG 2.1.2 keyboard accessibility requirement.
 * 
 * @param {boolean} isActive - Whether the overlay/modal is currently active
 * @param {() => void} onClose - Callback function to execute when Escape is pressed
 * 
 * @example
 * ```tsx
 * const [isModalOpen, setIsModalOpen] = useState(false);
 * useEscapeKey(isModalOpen, () => setIsModalOpen(false));
 * 
 * return isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />;
 * ```
 */
export function useEscapeKey(isActive: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onClose]);
}
