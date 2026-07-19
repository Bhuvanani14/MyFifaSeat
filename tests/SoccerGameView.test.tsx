import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SoccerGameView from "../src/components/SoccerGameView";

// Mock HTMLCanvasElement context for Web Audio API if needed
HTMLCanvasElement.prototype.getContext = vi.fn();

describe("SoccerGameView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Penalty Shootout heading", () => {
    render(<SoccerGameView />);
    expect(screen.getByText(/Penalty Shootout Challenge/i)).toBeInTheDocument();
  });

  it("displays initial score 0/0", () => {
    render(<SoccerGameView />);
    expect(screen.getByText("0/0")).toBeInTheDocument();
    expect(screen.getAllByText(/Score/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Streak/i).length).toBeGreaterThan(0);
  });

  it("has a reset button", () => {
    render(<SoccerGameView />);
    const resetBtn = screen.getByRole("button", { name: /reset game/i });
    expect(resetBtn).toBeInTheDocument();
  });

  it("has sound effects toggle button", () => {
    render(<SoccerGameView />);
    const soundBtn = screen.getByRole("button", { name: /Sound Effects/i });
    expect(soundBtn).toBeInTheDocument();
  });

  it("shows initial instructions", () => {
    render(<SoccerGameView />);
    expect(screen.getByText(/Pick an area to aim/i)).toBeInTheDocument();
  });

  it("renders target areas in the goal", () => {
    render(<SoccerGameView />);
    const targets = screen.getAllByTitle(/Corner|Side|Center/i);
    expect(targets.length).toBeGreaterThan(0);
  });

  it("can click a target to shoot", async () => {
    render(<SoccerGameView />);
    const target = screen.getByTitle(/Top Left Corner/i);
    await userEvent.click(target);
    
    // Check if score updates or button changes. The actual logic has a timeout, so we wait.
    await waitFor(() => {
      // Score should update, or game message changes
      const msg = screen.getByText(/GOOOOOAL|SAVED|CRACKING GOAL|AMAZING SHOT/i);
      expect(msg).toBeInTheDocument();
    }, { timeout: 1500 });
  });
});
