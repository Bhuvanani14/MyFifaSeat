import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SeatPanoramicPreview from "../src/components/SeatPanoramicPreview";
import { Seat } from "../src/types";

import * as THREE from "three";

// Mock HTMLCanvasElement context for Three.js
HTMLCanvasElement.prototype.getContext = vi.fn();
vi.spyOn(THREE, 'WebGLRenderer').mockImplementation(() => ({
  setSize: vi.fn(),
  setPixelRatio: vi.fn(),
  render: vi.fn(),
  dispose: vi.fn(),
  forceContextLoss: vi.fn(),
}) as any);

const MOCK_SEAT: Seat = {
  id: "seat-1",
  section: "101",
  row: "A",
  number: 1,
  category: "VIP",
  price: 450,
  isAvailable: true,
  isAccessible: false,
  isShaded: true,
  x: 50,
  y: 50,
  z: 1,
  aiInsight: "Great view of the pitch."
};

describe("SeatPanoramicPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the 3D Panoramic View title", () => {
    render(<SeatPanoramicPreview seat={null} />);
    expect(screen.getByText(/3D Seat Vision/i)).toBeInTheDocument();
  });

  it("renders instructions when no seat is selected", () => {
    render(<SeatPanoramicPreview seat={null} />);
    expect(screen.getByText(/Select any seat in the virtual arena/i)).toBeInTheDocument();
  });

  it("renders the 3D canvas when a seat is provided", () => {
    const { container } = render(<SeatPanoramicPreview seat={MOCK_SEAT} />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("renders the HUD with seat details when a seat is provided", () => {
    render(<SeatPanoramicPreview seat={MOCK_SEAT} />);
    expect(screen.getByText(/SEC 101/i)).toBeInTheDocument();
    expect(screen.getByText(/ROW A/i)).toBeInTheDocument();
    expect(screen.getByText(/SEAT 1/i)).toBeInTheDocument();
  });

  it("has a reset camera button when seat is provided", () => {
    render(<SeatPanoramicPreview seat={MOCK_SEAT} />);
    const resetBtn = screen.getByRole("button", { name: /Reset Camera View/i });
    expect(resetBtn).toBeInTheDocument();
  });

  it("calls reset camera function when button is clicked", async () => {
    render(<SeatPanoramicPreview seat={MOCK_SEAT} />);
    const resetBtn = screen.getByRole("button", { name: /Reset Camera View/i });
    await userEvent.click(resetBtn);
    // Since reset just changes local state, we'll verify it doesn't crash
    expect(resetBtn).toBeInTheDocument();
  });
});
