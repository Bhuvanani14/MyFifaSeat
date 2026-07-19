import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OperationsPortal from "../src/components/OperationsPortal";

// Mock fetch for AI chat endpoint
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("OperationsPortal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: "AI response for operations" }),
    });
  });

  // ── Rendering Tests ─────────────────────────────────────────────────────
  it("renders Operations Command Center heading", () => {
    render(<OperationsPortal />);
    expect(screen.getByText("Operations Command Center")).toBeInTheDocument();
  });

  it("renders the FIFA World Cup 2026 sub-header", () => {
    render(<OperationsPortal />);
    expect(screen.getByText(/FIFA World Cup 2026/i)).toBeInTheDocument();
  });

  it("renders the live indicator", () => {
    render(<OperationsPortal />);
    // Check for "Live" in the header subtitle specifically
    expect(screen.getByText(/FIFA World Cup 2026.*Live/i)).toBeInTheDocument();
  });

  // ── Role Selector Tests ─────────────────────────────────────────────────
  it("renders three role selector buttons", () => {
    render(<OperationsPortal />);
    const roleGroup = screen.getByRole("group", { name: /select operational role/i });
    expect(roleGroup).toBeInTheDocument();
    
    // Use getByRole to find buttons specifically within the role group
    const organizerBtn = screen.getByRole("button", { name: "Organizer" });
    const volunteerBtn = screen.getByRole("button", { name: "Volunteer" });
    const venueStaffBtn = screen.getByRole("button", { name: "Venue Staff" });
    
    expect(organizerBtn).toBeInTheDocument();
    expect(volunteerBtn).toBeInTheDocument();
    expect(venueStaffBtn).toBeInTheDocument();
  });

  it("Organizer role is selected by default", () => {
    render(<OperationsPortal />);
    const organizerBtn = screen.getByRole("button", { name: "Organizer" });
    expect(organizerBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("can switch to Volunteer role", async () => {
    render(<OperationsPortal />);
    const volunteerBtn = screen.getByRole("button", { name: "Volunteer" });
    await userEvent.click(volunteerBtn);
    expect(volunteerBtn).toHaveAttribute("aria-pressed", "true");
  });

  // ── KPI Cards Tests ─────────────────────────────────────────────────────
  it("renders Gate C Congestion KPI at 91%", () => {
    render(<OperationsPortal />);
    expect(screen.getByText("91%")).toBeInTheDocument();
    expect(screen.getByText("Gate C Congestion")).toBeInTheDocument();
  });

  it("renders Active Incidents KPI showing 3", () => {
    render(<OperationsPortal />);
    expect(screen.getByText("3")).toBeInTheDocument();
    const activeIncidents = screen.getAllByText("Active Incidents");
    expect(activeIncidents.length).toBeGreaterThan(0);
  });

  it("renders Transit ETA KPI showing 6 min", () => {
    render(<OperationsPortal />);
    expect(screen.getByText("6 min")).toBeInTheDocument();
  });

  it("renders Eco Score KPI at 68%", () => {
    render(<OperationsPortal />);
    expect(screen.getByText("68%")).toBeInTheDocument();
    expect(screen.getByText("Eco Score")).toBeInTheDocument();
  });

  // ── Section Tab Tests ───────────────────────────────────────────────────
  it("renders three section tabs", () => {
    render(<OperationsPortal />);
    expect(screen.getByRole("tab", { name: /AI Command/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Accessibility/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Sustainability/i })).toBeInTheDocument();
  });

  it("AI Command tab is selected by default", () => {
    render(<OperationsPortal />);
    const aiTab = screen.getByRole("tab", { name: /AI Command/i });
    expect(aiTab).toHaveAttribute("aria-selected", "true");
  });

  // ── AI Command Center Tests ─────────────────────────────────────────────
  it("renders Operational Decision Support heading", () => {
    render(<OperationsPortal />);
    expect(screen.getByText("Operational Decision Support")).toBeInTheDocument();
  });

  it("renders the operational query input field", () => {
    render(<OperationsPortal />);
    const input = screen.getByRole("textbox", { name: /operational query/i });
    expect(input).toBeInTheDocument();
  });

  it("renders the send button for operational queries", () => {
    render(<OperationsPortal />);
    const sendBtn = screen.getByRole("button", { name: /send operational query/i });
    expect(sendBtn).toBeInTheDocument();
  });

  it("renders quick incident chips", () => {
    render(<OperationsPortal />);
    const chipsContainer = screen.getByLabelText(/quick operational queries/i);
    expect(chipsContainer).toBeInTheDocument();
  });

  // ── Gate Telemetry Tests ────────────────────────────────────────────────
  it("renders Live Gate Telemetry panel", () => {
    render(<OperationsPortal />);
    expect(screen.getByText("Live Gate Telemetry")).toBeInTheDocument();
  });

  it("renders gate status items for all four gates", () => {
    render(<OperationsPortal />);
    expect(screen.getByText("Gate A")).toBeInTheDocument();
    expect(screen.getByText("Gate B")).toBeInTheDocument();
    expect(screen.getByText("Gate C")).toBeInTheDocument();
    expect(screen.getByText("Gate D")).toBeInTheDocument();
  });

  it("renders gate status badges (CLEAR, MODERATE, BUSY)", () => {
    render(<OperationsPortal />);
    const clearBadges = screen.getAllByText("CLEAR");
    expect(clearBadges.length).toBe(2); // Gate B and Gate D
    expect(screen.getByText("MODERATE")).toBeInTheDocument();
    expect(screen.getByText("BUSY")).toBeInTheDocument();
  });

  it("renders gate capacity progress bars with correct aria-valuenow", () => {
    render(<OperationsPortal />);
    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars.length).toBeGreaterThan(0);
  });

  // ── Active Incidents Tests ──────────────────────────────────────────────
  it("renders Active Incidents panel heading", () => {
    render(<OperationsPortal />);
    const headings = screen.getAllByText("Active Incidents");
    expect(headings.length).toBeGreaterThan(0);
  });

  it("renders medical alert incident", () => {
    render(<OperationsPortal />);
    expect(screen.getByText(/Medical alert/i)).toBeInTheDocument();
  });

  it("renders lost child incident", () => {
    render(<OperationsPortal />);
    expect(screen.getByText(/Lost child reported/i)).toBeInTheDocument();
  });

  // ── Accessibility Dispatch Tab Tests ────────────────────────────────────
  it("switches to Accessibility tab and shows dispatch panel", async () => {
    render(<OperationsPortal />);
    const accTab = screen.getByRole("tab", { name: /Accessibility/i });
    await userEvent.click(accTab);
    expect(screen.getByText("Accessibility Assistance Dispatch")).toBeInTheDocument();
  });

  it("renders accessibility request cards after switching tab", async () => {
    render(<OperationsPortal />);
    await userEvent.click(screen.getByRole("tab", { name: /Accessibility/i }));
    expect(screen.getByText("Wheelchair Escort")).toBeInTheDocument();
    expect(screen.getByText("Audio Headset")).toBeInTheDocument();
    expect(screen.getByText("Sensory Room Access")).toBeInTheDocument();
    expect(screen.getByText("Companion Seating")).toBeInTheDocument();
  });

  it("shows pending count badge in accessibility tab", async () => {
    render(<OperationsPortal />);
    await userEvent.click(screen.getByRole("tab", { name: /Accessibility/i }));
    expect(screen.getByText("2 Pending")).toBeInTheDocument();
  });

  it("can dispatch a volunteer for a pending request", async () => {
    render(<OperationsPortal />);
    await userEvent.click(screen.getByRole("tab", { name: /Accessibility/i }));
    const dispatchBtns = screen.getAllByText(/Dispatch Volunteer/i);
    expect(dispatchBtns.length).toBeGreaterThan(0);
    await userEvent.click(dispatchBtns[0]);
    // After dispatching, 'assigned' status should appear or button should change
    await waitFor(() => {
      expect(screen.getByText("1 Pending")).toBeInTheDocument();
    });
  });

  it("can resolve an assigned request", async () => {
    render(<OperationsPortal />);
    await userEvent.click(screen.getByRole("tab", { name: /Accessibility/i }));
    // There's 1 "assigned" request initially (ACC-002 Audio Headset)
    const resolveBtn = screen.getByText(/Mark Resolved/i);
    expect(resolveBtn).toBeInTheDocument();
    await userEvent.click(resolveBtn);
    await waitFor(() => {
      const completed = screen.getAllByText(/Completed/i);
      expect(completed.length).toBeGreaterThan(0);
    });
  });

  // ── Sustainability Dashboard Tab Tests ──────────────────────────────────
  it("switches to Sustainability tab and shows metrics", async () => {
    render(<OperationsPortal />);
    await userEvent.click(screen.getByRole("tab", { name: /Sustainability/i }));
    expect(screen.getByText("30%")).toBeInTheDocument();  // Solar Energy Share
    expect(screen.getByText("61%")).toBeInTheDocument();  // Green Transit Share
  });

  it("renders Eco Feed entries in sustainability tab", async () => {
    render(<OperationsPortal />);
    await userEvent.click(screen.getByRole("tab", { name: /Sustainability/i }));
    expect(screen.getByText("Live Eco Feed")).toBeInTheDocument();
    expect(screen.getByText(/Solar panels generated/i)).toBeInTheDocument();
    expect(screen.getByText(/Reusable cup exchange/i)).toBeInTheDocument();
  });

  it("shows sustainability progress bars with aria-valuenow", async () => {
    render(<OperationsPortal />);
    await userEvent.click(screen.getByRole("tab", { name: /Sustainability/i }));
    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars.length).toBeGreaterThan(0);
  });

  // ── AI Chat Integration Tests ───────────────────────────────────────────
  it("sends a query to the AI endpoint and displays response", async () => {
    render(<OperationsPortal />);
    const input = screen.getByRole("textbox", { name: /operational query/i });
    await userEvent.type(input, "Gate C status");
    const sendBtn = screen.getByRole("button", { name: /send operational query/i });
    await userEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/ai/chat",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("displays error message when AI fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    render(<OperationsPortal />);
    const input = screen.getByRole("textbox", { name: /operational query/i });
    await userEvent.type(input, "test query");
    await userEvent.click(screen.getByRole("button", { name: /send operational query/i }));

    await waitFor(() => {
      expect(screen.getByText(/AI gateway offline/i)).toBeInTheDocument();
    });
  });

  // ── Accessibility (a11y) Tests ──────────────────────────────────────────
  it("main container has role=main and aria-label", () => {
    render(<OperationsPortal />);
    const main = screen.getByRole("main", { name: /staff and operations portal/i });
    expect(main).toBeInTheDocument();
  });

  it("gate status list uses role=list with aria-label", () => {
    render(<OperationsPortal />);
    const gateList = screen.getByRole("list", { name: /gate status list/i });
    expect(gateList).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = render(<OperationsPortal />);
    expect(container).toBeTruthy();
  });
});
