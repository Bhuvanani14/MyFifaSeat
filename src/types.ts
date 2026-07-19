/**
 * Pitch Precision 26 — Core Application Types
 *
 * Defines the data models used across the frontend application
 * for users, seats, tickets, chat messages, and crowd telemetry.
 * 
 * @module types
 * @description Core TypeScript interfaces and types for the FIFA 2026 stadium application
 */

/**
 * Authenticated user profile containing personal information and seating assignment.
 * @interface User
 */
export interface User {
  /** User's email address (login identifier). */
  email: string;
  /** Display name. */
  name: string;
  /** URL to the user's avatar image. */
  avatar: string;
  /** Stadium section assignment. */
  section: string;
  /** Seat identifier within the section. */
  seat: string;
  /** Whether the user holds a premium fan pass. */
  isPremium: boolean;
}

/** A single seat in the interactive stadium map. */
export interface Seat {
  /** Unique seat identifier (e.g., "seat-42"). */
  id: string;
  /** Section name (e.g., "302", "110-A"). */
  section: string;
  /** Row letter (A–E). */
  row: string;
  /** Seat number within the row. */
  number: number;
  /** Pricing category for the seat. */
  category: "VIP" | "Category 1" | "Category 2" | "Category 3" | "Accessible";
  /** Price in USD. */
  price: number;
  /** Whether the seat is currently available for purchase. */
  isAvailable: boolean;
  /** Whether the seat is wheelchair accessible. */
  isAccessible: boolean;
  /** Whether the seat is under a shaded overhang. */
  isShaded: boolean;
  /** 2D layout X coordinate for the stadium map. */
  x: number;
  /** 2D layout Y coordinate for the stadium map. */
  y: number;
  /** 3D depth/tier index for the panoramic view. */
  z: number;
  /** AI-generated insight about this seat's value proposition. */
  aiInsight: string;
}

/** A purchased match ticket stored in the user's wallet. */
export interface Ticket {
  /** Unique ticket identifier (e.g., "TCK-8721A"). */
  id: string;
  /** Match description (e.g., "Match 24 - Group Stage"). */
  match: string;
  /** Home team name. */
  homeTeam: string;
  /** Away team name. */
  awayTeam: string;
  /** URL to the home team flag image. */
  homeFlag: string;
  /** URL to the away team flag image. */
  awayFlag: string;
  /** Match date string (e.g., "July 20, 2026"). */
  date: string;
  /** Match kickoff time (e.g., "19:00"). */
  time: string;
  /** Venue name and location. */
  venue: string;
  /** Stadium section. */
  section: string;
  /** Seat row. */
  row: string;
  /** Seat number as a string. */
  seat: string;
  /** Ticket price in USD. */
  price: number;
  /** URL to a QR code image for gate entry. */
  qrCode: string;
  /** Ticket pricing category label. */
  category: string;
}

/** A single message in the AI Assistant chat conversation. */
export interface ChatMessage {
  /** Unique message identifier. */
  id: string;
  /** Role of the message sender. */
  role: "user" | "model" | "system";
  /** Text content of the message (may include Markdown). */
  content: string;
  /** Timestamp when the message was created. */
  timestamp: Date;
}

/** Real-time crowd telemetry data for a single stadium section. */
export interface CrowdStat {
  /** Section display name (e.g., "302 (Cat 3)"). */
  sectionName: string;
  /** Section occupancy percentage (0–100). */
  occupancy: number;
  /** Current noise level in decibels. */
  noiseLevel: number;
  /** Crowd sentiment descriptor. */
  sentiment: string;
  /** Dominant fan group abbreviation (e.g., "BRA", "FRA", "Neutral"). */
  domination: string;
}
