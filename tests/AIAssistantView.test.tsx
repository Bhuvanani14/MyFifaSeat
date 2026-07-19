import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AIAssistantView from "../src/components/AIAssistantView";
import { User } from "../src/types";

// Mock fetch for AI chat
const mockFetch = vi.fn();
global.fetch = mockFetch;

const MOCK_USER: User = {
  email: "fan@fifa.com",
  name: "Alex Morgan",
  avatar: "https://example.com/avatar.png",
  section: "302",
  seat: "12",
  isPremium: true,
};

describe("AIAssistantView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: "Welcome to Pitch Precision AI!" }),
    });
  });

  // ── Rendering Tests ─────────────────────────────────────────────────────
  it("renders the AI Assistant heading", () => {
    render(<AIAssistantView user={MOCK_USER} />);
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
  });

  it("renders the message input field with proper aria-label", () => {
    render(<AIAssistantView user={MOCK_USER} />);
    const input = screen.getByLabelText(/type a message/i);
    expect(input).toBeInTheDocument();
  });

  it("renders a send button", () => {
    render(<AIAssistantView user={MOCK_USER} />);
    const sendBtn = screen.getByRole("button", { name: /send message/i });
    expect(sendBtn).toBeInTheDocument();
  });

  it("renders the conversation log with role=log", () => {
    render(<AIAssistantView user={MOCK_USER} />);
    const log = screen.getByRole("log");
    expect(log).toBeInTheDocument();
  });

  it("renders initial welcome message from AI", () => {
    render(<AIAssistantView user={MOCK_USER} />);
    // The welcome message should contain stadium-related content
    const welcomeTexts = screen.getAllByText(/Pitch Precision/i);
    expect(welcomeTexts.length).toBeGreaterThan(0);
  });

  // ── Interaction Tests ───────────────────────────────────────────────────
  it("allows typing a message in the input", async () => {
    render(<AIAssistantView user={MOCK_USER} />);
    const input = screen.getByLabelText(/type a message/i);
    await userEvent.type(input, "Where is Gate A?");
    expect(input).toHaveValue("Where is Gate A?");
  });

  it("sends a message when the send button is clicked", async () => {
    render(<AIAssistantView user={MOCK_USER} />);
    const input = screen.getByLabelText(/type a message/i);
    await userEvent.type(input, "Stadium map please");
    const sendBtn = screen.getByRole("button", { name: /send message/i });
    await userEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("sends a message when Enter key is pressed", async () => {
    render(<AIAssistantView user={MOCK_USER} />);
    const input = screen.getByLabelText(/type a message/i);
    await userEvent.type(input, "Where is the medical station?{enter}");

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it("clears input after sending a message", async () => {
    render(<AIAssistantView user={MOCK_USER} />);
    const input = screen.getByLabelText(/type a message/i);
    await userEvent.type(input, "test query");
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("displays the user's message in the conversation", async () => {
    render(<AIAssistantView user={MOCK_USER} />);
    const input = screen.getByLabelText(/type a message/i);
    await userEvent.type(input, "Gate C status");
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText("Gate C status")).toBeInTheDocument();
    });
  });

  it("shows AI response after sending a message", async () => {
    render(<AIAssistantView user={MOCK_USER} />);
    const input = screen.getByLabelText(/type a message/i);
    await userEvent.type(input, "test");
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText("Welcome to Pitch Precision AI!")).toBeInTheDocument();
    });
  });

  // ── Multilingual Quick Actions ──────────────────────────────────────────
  it("renders quick action suggestion chips", () => {
    render(<AIAssistantView user={MOCK_USER} />);
    // Quick action chips should be present
    const chips = screen.getAllByRole("button");
    // Should have at least the send button + quick actions
    expect(chips.length).toBeGreaterThan(2);
  });

  // ── Accessibility Tests ─────────────────────────────────────────────────
  it("has aria-live region for dynamic chat updates", () => {
    render(<AIAssistantView user={MOCK_USER} />);
    const liveRegion = screen.getByRole("log");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  it("renders without crashing", () => {
    const { container } = render(<AIAssistantView user={MOCK_USER} />);
    expect(container).toBeTruthy();
  });
});
