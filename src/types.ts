export interface User {
  email: string;
  name: string;
  avatar: string;
  section: string;
  seat: string;
  isPremium: boolean;
}

export interface Seat {
  id: string;
  section: string;
  row: string;
  number: number;
  category: "VIP" | "Category 1" | "Category 2" | "Category 3" | "Accessible";
  price: number;
  isAvailable: boolean;
  isAccessible: boolean;
  isShaded: boolean;
  x: number; // 2D layout coordinates
  y: number;
  z: number; // 3D depth relative coordinate
  aiInsight: string;
}

export interface Ticket {
  id: string;
  match: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  date: string;
  time: string;
  venue: string;
  section: string;
  row: string;
  seat: string;
  price: number;
  qrCode: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: Date;
}

export interface CrowdStat {
  sectionName: string;
  occupancy: number;
  noiseLevel: number; // Decibels
  sentiment: string; // "Ecstatic" | "Anxious" | "Cheering"
  domination: string; // "BRA" | "FRA" | "Neutral"
}
