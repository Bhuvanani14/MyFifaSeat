import { Seat, Ticket, CrowdStat } from "./types";

// Generate a realistic list of seats for the interactive stadium view
export const SEATS: Seat[] = [];

const sections = [
  { name: "101", category: "VIP" as const, price: 450, shaded: true, accessible: false },
  { name: "108", category: "Category 1" as const, price: 250, shaded: true, accessible: false },
  { name: "112", category: "Category 1" as const, price: 250, shaded: false, accessible: false },
  { name: "110-A", category: "Accessible" as const, price: 150, shaded: true, accessible: true },
  { name: "204", category: "Category 2" as const, price: 180, shaded: false, accessible: false },
  { name: "215", category: "Category 2" as const, price: 180, shaded: true, accessible: false },
  { name: "302", category: "Category 3" as const, price: 120, shaded: false, accessible: false },
  { name: "318", category: "Category 3" as const, price: 120, shaded: false, accessible: false }
];

const rows = ["A", "B", "C", "D", "E"];

// Generate around 80 seats in beautiful patterns
let seatCounter = 1;
sections.forEach((sec, sIdx) => {
  rows.forEach((row, rIdx) => {
    const numSeats = sec.category === "VIP" ? 6 : 10;
    for (let num = 1; num <= numSeats; num++) {
      // Calculate coordinates in a curved stadium-bowl pattern
      // sIdx determines the angle sector, rIdx is the distance/height
      const baseAngle = (sIdx * Math.PI) / 4 - Math.PI / 8;
      const angleOffset = ((num - numSeats / 2) * 0.04);
      const angle = baseAngle + angleOffset;
      const radius = 180 + rIdx * 25 + (sec.category === "VIP" ? -30 : 20);

      // 2D Projection coordinates
      const x = 50 + 35 * Math.cos(angle) * (radius / 250);
      const y = 35 + 25 * Math.sin(angle) * (radius / 250);
      const z = rIdx; // Height/tier index

      // Distinct AI Seating Insights based on sector and row
      let aiInsight = "";
      if (sec.category === "VIP") {
        aiInsight = `👑 Premium VIP Sector ${sec.name}. Offers perfect field-level sideline coverage, proximity to players, and complimentary catering access.`;
      } else if (sec.accessible) {
        aiInsight = `♿ Accessible Sector ${sec.name}. Level entry, spacious companion seating, excellent sightlines over the standing sections.`;
      } else if (sec.category === "Category 1") {
        aiInsight = `🔥 Category 1. Superb tactical viewing near the midfield. High value for analysis and perfect photo-taking lighting.`;
      } else if (sec.category === "Category 2") {
        aiInsight = `⚡ Category 2 corner view. High action viewing of set pieces and penalty area. Shaded and extremely popular with local fans.`;
      } else {
        aiInsight = `📣 High energy Category 3 supporter area. Unrivaled singing atmosphere, birds-eye game view, best pricing.`;
      }

      SEATS.push({
        id: `seat-${seatCounter++}`,
        section: sec.name,
        row,
        number: num,
        category: sec.category,
        price: sec.price,
        // Deterministic mock availability keeps the map stable across renders,
        // tests, and server/client hydration while preserving a realistic mix.
        isAvailable: ((sIdx * 31 + rIdx * 11 + num * 7) % 100) < 65,
        isAccessible: sec.accessible,
        isShaded: sec.shaded,
        x,
        y,
        z,
        aiInsight
      });
    }
  });
});

/** Fast lookup for ticket-to-seat reconciliation in the application shell. */
export const SEAT_ID_BY_LOCATION = new Map(
  SEATS.map((seat) => [`${seat.section}:${seat.row}:${seat.number}`, seat.id]),
);

// Mock Initial Tickets
export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "TCK-8721A",
    match: "Match 24 - Group Stage",
    homeTeam: "Brazil",
    awayTeam: "France",
    homeFlag: "https://lh3.googleusercontent.com/aida-public/AB6AXuB__zI4mGg8Bhr40RVBkPLsvTo9iXVYSchIO_sMaFyYqRwhi7Z1AIfk_fwhUVcONWEKFViNQqvwYIf5XNxh0cNBxsewwqNdv-6BhbyNGIKJIFdvjiLa3gLxz4X6d0vo-3E7QYhUxln8IGOMUz2U65Th2YL8u8rTJ_S5LqtUqnKV_xSMC-p99pys8ZcIFlHPXFh2b3rYQjIbmVglIyvEo6XzFwJj70GUbP-jKcdj1_WmGvzSOO5OSC7g",
    awayFlag: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWHbA-mmzXDk3R7PVpRXjCkfu4MuqrkYLkYeGYJSH9JIIzwFJrAfCKnWQ6x8pq4ji5Fx2ESd5ZaOl3Yv5014xGMVULBptDRJfdTT5h66F_Bku6E5uSKr82duL0a7hKR6m0_Et2NjtxyQe1wSfpJTvI9cfPmJ_FpNciq1pNlYqrAiNuUPH0eu5l9nm1AW2Qxt5lY0BarDcvO-GKNk8nUcXelrC0pMARry_YVlASWwZqFsaJUr-JbT41",
    date: "July 20, 2026",
    time: "19:00",
    venue: "MetLife Stadium, New Jersey",
    section: "302",
    row: "D",
    seat: "12",
    price: 120,
    category: "Category 3",
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FIFA2026_TCK8721A_SEC302_ROWD_SEAT12"
  }
];

// Mock Crowd Stats per Sector
export const CROWD_STATS: CrowdStat[] = [
  { sectionName: "101 (VIP)", occupancy: 95, noiseLevel: 78, sentiment: "Anxious", domination: "Neutral" },
  { sectionName: "108 (Cat 1)", occupancy: 88, noiseLevel: 88, sentiment: "Ecstatic", domination: "BRA" },
  { sectionName: "112 (Cat 1)", occupancy: 91, noiseLevel: 85, sentiment: "Cheering", domination: "BRA" },
  { sectionName: "110-A (Acc)", occupancy: 80, noiseLevel: 82, sentiment: "Cheering", domination: "Neutral" },
  { sectionName: "204 (Cat 2)", occupancy: 94, noiseLevel: 92, sentiment: "Ecstatic", domination: "BRA" },
  { sectionName: "215 (Cat 2)", occupancy: 87, noiseLevel: 89, sentiment: "Cheering", domination: "FRA" },
  { sectionName: "302 (Cat 3)", occupancy: 99, noiseLevel: 104, sentiment: "Ecstatic", domination: "BRA" },
  { sectionName: "318 (Cat 3)", occupancy: 98, noiseLevel: 101, sentiment: "Anxious", domination: "FRA" }
];
