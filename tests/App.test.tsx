import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

// Mock fetch for AI chat
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("App — Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: "test response" }),
    });
  });

  it("renders LoginView when user is not authenticated", () => {
    render(<App />);
    expect(screen.getByText("FIFA WORLD CUP 2026")).toBeInTheDocument();
    // Should show the Sign In button
    expect(screen.getByRole("button", { name: /sign in to stadium/i })).toBeInTheDocument();
  });

  it("shows email and password inputs on login screen", () => {
    render(<App />);
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("transitions to main app after successful login", async () => {
    render(<App />);
    
    // Use Quick Login to fill credentials
    const quickLoginBtn = screen.getByRole("button", { name: /quick login/i });
    await userEvent.click(quickLoginBtn);
    
    // Submit the form
    const signInBtn = screen.getByRole("button", { name: /sign in to stadium/i });
    fireEvent.click(signInBtn);

    // After login animation, should see the main app with Stadium view
    await waitFor(() => {
      expect(screen.getByText("FIFA 26")).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

describe("App — Main Dashboard", () => {
  async function loginAndRender() {
    const result = render(<App />);
    const quickLoginBtn = screen.getByRole("button", { name: /quick login/i });
    await userEvent.click(quickLoginBtn);
    fireEvent.click(screen.getByRole("button", { name: /sign in to stadium/i }));
    await waitFor(() => {
      expect(screen.getByText("FIFA 26")).toBeInTheDocument();
    }, { timeout: 3000 });
    return result;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: "test response" }),
    });
  });

  it("renders desktop sidebar navigation", async () => {
    await loginAndRender();
    expect(screen.getByRole("navigation", { name: /main navigation/i })).toBeInTheDocument();
  });

  it("renders user name in the sidebar", async () => {
    await loginAndRender();
    const nameElements = screen.getAllByText("Alex Morgan");
    expect(nameElements.length).toBeGreaterThan(0);
  });

  it("shows Premium Fan badge for premium users", async () => {
    await loginAndRender();
    expect(screen.getByText(/Premium Fan/i)).toBeInTheDocument();
  });

  it("renders all 7 navigation tabs", async () => {
    await loginAndRender();
    // Desktop sidebar has all 7 tabs
    const desktopTabs = screen.getAllByRole("tab").filter(tab => tab.id?.startsWith('desktop-nav'));
    expect(desktopTabs.length).toBe(7);
    
    // Verify key tabs exist
    expect(desktopTabs.some(tab => tab.textContent?.includes('Stadium'))).toBe(true);
    expect(desktopTabs.some(tab => tab.textContent?.includes('Tickets'))).toBe(true);
  });

  it("Stadium tab is selected by default", async () => {
    await loginAndRender();
    const allTabs = screen.getAllByRole("tab");
    const desktopStadiumTab = allTabs.find(tab => 
      tab.id?.startsWith('desktop-nav') && tab.textContent?.includes('Stadium')
    );
    
    expect(desktopStadiumTab).toBeTruthy();
    expect(desktopStadiumTab).toHaveAttribute("aria-selected", "true");
  });

  it("has a main content area with role=main", async () => {
    await loginAndRender();
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute("id", "main-content");
  });

  it("renders theme switcher button", async () => {
    await loginAndRender();
    const themeBtn = screen.getByRole("button", { name: /switch to light theme/i });
    expect(themeBtn).toBeInTheDocument();
  });

  it("renders sign out button", async () => {
    await loginAndRender();
    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    expect(signOutBtn).toBeInTheDocument();
  });
});
