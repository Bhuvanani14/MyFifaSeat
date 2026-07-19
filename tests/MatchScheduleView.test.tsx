import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MatchScheduleView from "../src/components/MatchScheduleView";

describe("MatchScheduleView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the schedule title and subtitle", () => {
    render(<MatchScheduleView onSelectStadium={vi.fn()} />);
    expect(screen.getByText(/FIFA World Cup 2026 Matches/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay ahead of the game/i)).toBeInTheDocument();
  });

  it("renders all the matches", () => {
    render(<MatchScheduleView onSelectStadium={vi.fn()} />);
    // Just looking for a few teams from the actual MATCHES_DATA to ensure it rendered
    expect(screen.getByText("Mexico")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("Argentina")).toBeInTheDocument();
    expect(screen.getByText("Netherlands")).toBeInTheDocument();
  });

  it("calls onSelectStadium when a match's 'Book Tickets' button is clicked", async () => {
    const mockOnSelect = vi.fn();
    render(<MatchScheduleView onSelectStadium={mockOnSelect} />);
    
    // The main header button
    const bookButtons = screen.getAllByRole("button", { name: /book tickets/i });
    expect(bookButtons.length).toBeGreaterThan(0);

    await userEvent.click(bookButtons[0]);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it("renders the matches in the schedule", () => {
    render(<MatchScheduleView onSelectStadium={vi.fn()} />);
    // Verify each card is rendered by searching for VS badges
    const matches = screen.getAllByText("VS");
    expect(matches.length).toBeGreaterThan(0);
  });
});
