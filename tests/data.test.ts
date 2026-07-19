import { describe, it, expect } from "vitest";
import { SEATS, INITIAL_TICKETS, CROWD_STATS } from "../src/data";

describe("Data Module — SEATS", () => {
  it("generates seats across all 8 sections", () => {
    const sections = new Set(SEATS.map(s => s.section));
    expect(sections.size).toBe(8);
    expect(sections).toContain("101");
    expect(sections).toContain("108");
    expect(sections).toContain("112");
    expect(sections).toContain("110-A");
    expect(sections).toContain("204");
    expect(sections).toContain("215");
    expect(sections).toContain("302");
    expect(sections).toContain("318");
  });

  it("generates seats across 5 rows (A-E) per section", () => {
    const rows = new Set(SEATS.map(s => s.row));
    expect(rows).toContain("A");
    expect(rows).toContain("B");
    expect(rows).toContain("C");
    expect(rows).toContain("D");
    expect(rows).toContain("E");
  });

  it("every seat has a unique ID", () => {
    const ids = SEATS.map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("VIP seats (section 101) have 6 seats per row", () => {
    const vipSeats = SEATS.filter(s => s.section === "101");
    // 5 rows × 6 seats = 30
    expect(vipSeats.length).toBe(30);
  });

  it("non-VIP seats have 10 seats per row", () => {
    const cat1Seats = SEATS.filter(s => s.section === "108");
    // 5 rows × 10 seats = 50
    expect(cat1Seats.length).toBe(50);
  });

  it("prices match the section category", () => {
    const vipSeat = SEATS.find(s => s.section === "101");
    expect(vipSeat?.price).toBe(450);

    const cat1Seat = SEATS.find(s => s.section === "108");
    expect(cat1Seat?.price).toBe(250);

    const cat2Seat = SEATS.find(s => s.section === "204");
    expect(cat2Seat?.price).toBe(180);

    const cat3Seat = SEATS.find(s => s.section === "302");
    expect(cat3Seat?.price).toBe(120);

    const accSeat = SEATS.find(s => s.section === "110-A");
    expect(accSeat?.price).toBe(150);
  });

  it("accessible seats are only in section 110-A", () => {
    const accessible = SEATS.filter(s => s.isAccessible);
    expect(accessible.every(s => s.section === "110-A")).toBe(true);
    expect(accessible.length).toBeGreaterThan(0);
  });

  it("every seat has x, y, z coordinates within reasonable bounds", () => {
    SEATS.forEach(seat => {
      expect(typeof seat.x).toBe("number");
      expect(typeof seat.y).toBe("number");
      expect(typeof seat.z).toBe("number");
      expect(seat.x).toBeGreaterThan(0);
      expect(seat.y).toBeGreaterThan(0);
    });
  });

  it("every seat has a non-empty AI insight", () => {
    SEATS.forEach(seat => {
      expect(seat.aiInsight.length).toBeGreaterThan(10);
    });
  });

  it("VIP seats have shaded = true", () => {
    SEATS.filter(s => s.section === "101").forEach(s => {
      expect(s.isShaded).toBe(true);
    });
  });

  it("Category 3 seats have shaded = false", () => {
    SEATS.filter(s => s.section === "302").forEach(s => {
      expect(s.isShaded).toBe(false);
    });
  });

  it("seat categories match expected values", () => {
    const categories = new Set(SEATS.map(s => s.category));
    expect(categories).toContain("VIP");
    expect(categories).toContain("Category 1");
    expect(categories).toContain("Category 2");
    expect(categories).toContain("Category 3");
    expect(categories).toContain("Accessible");
  });
});

describe("Data Module — INITIAL_TICKETS", () => {
  it("has at least one pre-loaded ticket", () => {
    expect(INITIAL_TICKETS.length).toBeGreaterThan(0);
  });

  it("first ticket is for Brazil vs France", () => {
    expect(INITIAL_TICKETS[0].homeTeam).toBe("Brazil");
    expect(INITIAL_TICKETS[0].awayTeam).toBe("France");
  });

  it("ticket has all required fields", () => {
    const t = INITIAL_TICKETS[0];
    expect(t.id).toBeTruthy();
    expect(t.match).toBeTruthy();
    expect(t.date).toBeTruthy();
    expect(t.time).toBeTruthy();
    expect(t.venue).toBe("MetLife Stadium, New Jersey");
    expect(t.section).toBeTruthy();
    expect(t.row).toBeTruthy();
    expect(t.seat).toBeTruthy();
    expect(t.price).toBeGreaterThan(0);
    expect(t.category).toBeTruthy();
    expect(t.qrCode).toContain("qrserver.com");
  });
});

describe("Data Module — CROWD_STATS", () => {
  it("provides crowd stats for 8 sections", () => {
    expect(CROWD_STATS.length).toBe(8);
  });

  it("each section has valid occupancy between 0 and 100", () => {
    CROWD_STATS.forEach(stat => {
      expect(stat.occupancy).toBeGreaterThanOrEqual(0);
      expect(stat.occupancy).toBeLessThanOrEqual(100);
    });
  });

  it("noise levels are realistic (between 50 and 120 dB)", () => {
    CROWD_STATS.forEach(stat => {
      expect(stat.noiseLevel).toBeGreaterThanOrEqual(50);
      expect(stat.noiseLevel).toBeLessThanOrEqual(120);
    });
  });

  it("sentiments are one of the expected values", () => {
    const validSentiments = ["Ecstatic", "Cheering", "Anxious"];
    CROWD_STATS.forEach(stat => {
      expect(validSentiments).toContain(stat.sentiment);
    });
  });

  it("domination values indicate BRA, FRA, or Neutral", () => {
    const validDominations = ["BRA", "FRA", "Neutral"];
    CROWD_STATS.forEach(stat => {
      expect(validDominations).toContain(stat.domination);
    });
  });

  it("Section 302 (Cat 3) has the highest noise level", () => {
    const sec302 = CROWD_STATS.find(s => s.sectionName === "302 (Cat 3)");
    expect(sec302).toBeDefined();
    const maxNoise = Math.max(...CROWD_STATS.map(s => s.noiseLevel));
    expect(sec302!.noiseLevel).toBe(maxNoise);
  });
});
