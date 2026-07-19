/**
 * Pitch Precision 26 — Express Server
 *
 * Serves the React SPA (via Vite dev middleware or static files in production)
 * and exposes a secured AI chat endpoint at POST /api/ai/chat.
 *
 * Security: Helmet headers, CORS, rate limiting, input validation, payload limits.
 */
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { OpenRouter } from "@openrouter/sdk";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {
  formatMessagesForProvider,
  validateChatRequest,
} from "./src/lib/server/chatValidation";
import {
  extractCompletionContent,
  type CompletionResponse,
} from "./src/lib/server/completionParser";

dotenv.config();

// ── Environment validation ───────────────────────────────────────────────────
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PORT = parseInt(process.env.PORT || "3000", 10);
const APP_URL = process.env.APP_URL || "https://ai.studio/build";
const NODE_ENV = process.env.NODE_ENV || "development";

if (!OPENROUTER_API_KEY) {
  console.warn(
    "⚠️  OPENROUTER_API_KEY is not set. The AI assistant will use fallback responses."
  );
}

interface ChatSendClient {
  chat: {
    send: (args: {
      chatRequest: { model: string; messages: Array<{ role: string; content: string }> };
    }) => Promise<CompletionResponse>;
  };
}

/** Send a chat completion request through the OpenRouter SDK. */
async function sendChatCompletion(
  client: OpenRouter,
  model: string,
  messages: Array<{ role: string; content: string }>,
): Promise<CompletionResponse> {
  return (client as unknown as ChatSendClient).chat.send({
    chatRequest: { model, messages },
  });
}

const AI_FALLBACK_RESPONSE = `✅ **FIFA 2026 Stadium Assistant Ready**

Based on the live match — **Brazil 2-1 France (72')** — here's what I can help with:

- 🗺️ **Navigation**: Gate A is MODERATE (8-min queue). Gate D is CLEAR.
- ♿ **Accessibility**: Wheelchair escorts available at Gates A & C. Sensory room open at Level 2 near Sec 110-A.
- 🚌 **Transit**: Next NJ Transit shuttle from Secaucus Junction departs in 6 minutes.
- 🌱 **Sustainability**: Recycling diversion at 68%. Use blue bins for recyclables, green for food waste.
- 🎫 **Seats**: Category 2 corners (Section 215, $180) offer shaded sightlines. VIP Section 101 ($450) for full luxury.

What specific assistance do you need?`;

// ── Server ───────────────────────────────────────────────────────────────────
async function startServer(): Promise<void> {
  const app = express();

  // ── Security: HTTP headers via Helmet ──────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", "https://openrouter.ai", "https://api.qrserver.com"],
          workerSrc: ["'self'", "blob:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── CORS: Restrict origins in production ───────────────────────────────────
  app.use((req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = NODE_ENV === "production"
      ? [APP_URL]
      : ["http://localhost:3000", "http://localhost:5173"];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(express.json({ limit: "50kb" }));

  // ── Rate Limiter: Protect AI endpoint from abuse ───────────────────────────
  const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please wait a moment before sending another message.",
    },
  });

  // ── Lazy initialize OpenRouter client ──────────────────────────────────────
  let openRouterClient: OpenRouter | null = null;

  /** Returns a cached OpenRouter client instance. Throws if API key is missing. */
  function getOpenRouter(): OpenRouter {
    if (!openRouterClient) {
      if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not defined");
      }
      openRouterClient = new OpenRouter({
        apiKey: OPENROUTER_API_KEY,
        httpReferer: APP_URL,
        appTitle: "Pitch Precision 26",
      });
    }
    return openRouterClient;
  }

  // ── AI Chat Endpoint ───────────────────────────────────────────────────────
  app.post("/api/ai/chat", aiRateLimiter, async (req: Request, res: Response) => {
    try {
      if (!req.is("application/json")) {
        return res.status(415).json({ error: "Content-Type must be application/json." });
      }

      const validation = validateChatRequest(req.body);
      if (!validation.ok) {
        return res.status(400).json({ error: validation.error });
      }

      const { messages, context } = validation.data;
      const client = getOpenRouter();

      // ── Comprehensive FIFA 2026 World Cup Stadium AI System Prompt ───────
      const systemMessage = {
        role: "system",
        content: `You are the Pitch Precision AI Assistant — the official GenAI-powered stadium intelligence system for the FIFA World Cup 2026.

You serve FANS, ORGANIZERS, VOLUNTEERS, and VENUE STAFF at MetLife Stadium, New Jersey.

## CORE CAPABILITIES

### 🗺️ Navigation & Stadium Guidance
- Direct fans and staff to specific gates (A, B, C, D), entrances, sections, and amenities.
- Provide turn-by-turn directions within the stadium (e.g., "From Gate B, take the Level 1 concourse south to reach Section 108 in 3 minutes").
- Highlight accessible routes, elevators, and ramp access points.

### 👥 Crowd Management & Operations (For Organizers/Staff)
- Real-time crowd flow recommendations for congested gates.
- Suggest crowd redistribution strategies (e.g., "Open Gate D overflow area, redirect arrivals from Gate A").
- Predict crowd surge points based on match timeline (halftime, final whistle).
- Volunteer deployment suggestions for high-traffic zones.

### ♿ Accessibility Services
- Wheelchair escort services (available at Gates A and C ground level).
- Sensory quiet rooms: Level 2, near Section 110-A (capacity: 15 fans).
- Audio description headsets: Available at the accessibility desk, Gate B.
- Companion seating arrangements in Section 110-A with a clear sightline and level access.
- Captioning screens: Installed at 12 positions throughout the concourse.

### 🚌 Transportation & Transit
- NJ Transit trains from Penn Station (Newark) to MetLife Stadium on match days: every 12 minutes from 3 hours before kickoff.
- Shuttle buses from Secaucus Junction: 8-minute journey, free with ticket.
- Park-and-ride lots: Lots 1, 5, and 17 (capacity: 2,800 cars). Current wait: ~22 minutes.
- Rideshare (Uber/Lyft) drop-off zone: East entrance, Gate A.
- Accessible transport: Accessible shuttle service from Lot 5 with 4 dedicated vehicles.

### 🌱 Sustainability & Eco-Operations
- MetLife Stadium is powered 30% by renewable solar energy during the tournament.
- Recycling bins (blue) and composting bins (green) are placed every 30 meters.
- Zero single-use plastic policy: reusable water cups at all 48 concession stands.
- Current recycling diversion rate: 68% (target: 80%).
- Carbon offset program: Each ticket purchase offsets 2.4 kg of CO₂.
- Green transit share (fans arriving by transit): 61%.

### 🌍 Multilingual Assistance
- Detect the language of the user's message and respond in the SAME LANGUAGE.
- Support: English, Spanish (Español), French (Français), Portuguese (Português), Arabic (العربية), German (Deutsch), Italian (Italiano), Japanese (日本語), Korean (한국어).
- For official announcements, provide bilingual (English + detected language) responses.

### 🎫 Seating & Ticket Intelligence
- VIP Lounge (Section 101): $450 — premium catering, plush seats, best field-level view.
- Category 1 (Section 108, 112): $250 — amazing lower-tier sideline view.
- Category 2 (Section 204, 215): $180 — mid-tier corner views, balanced price-experience.
- Category 3 (Section 302, 318): $120 — upper-tier goal line view, high energy.
- Accessible Seating (Section 110-A): $150 — wheelchair accessible, companion seating.

### ⚡ Real-Time Decision Support (Operational Intelligence)
- Active match status: Brazil 2-1 France, 72nd min (Brazil controlling possession).
- Gate A congestion: MODERATE (est. 8-min queue for late arrivals).
- Gate D: CLEAR — recommend redirecting overflow.
- Medical station: Level 1 concourse, Sections 108 and 302.
- Lost & Found: Gate B, Level 1 (staffed until 2 hours after final whistle).
- Security escalation line: Ext. 2400 (internal) / 911 (emergency).

## RESPONSE GUIDELINES
- Be helpful, professional, and concise — stadium conditions are time-sensitive.
- Use emojis sparingly to improve readability (✅, ⚠️, 📍, ♿, 🚌).
- For operational staff queries, prioritize safety and crowd safety protocols.
- Format with Markdown (headers, bullets, bold) for clarity.
- Always offer a follow-up action or resource.

User Context: ${JSON.stringify(context || {})}`,
      };

      const formattedMessages = [
        systemMessage,
        ...formatMessagesForProvider(messages),
      ];

      let responseContent = "";

      try {
        const completion = await sendChatCompletion(client, "openai/gpt-4o-mini", formattedMessages);
        responseContent = extractCompletionContent(completion);
        if (!responseContent) {
          throw new Error("No choices returned from OpenRouter API.");
        }
      } catch (err: unknown) {
        const primaryError = err instanceof Error ? err.message : "Unknown error";
        console.warn("Primary model failed, trying fallback:", primaryError);
        try {
          const fallbackCompletion = await sendChatCompletion(
            client,
            "google/gemini-2.5-flash",
            formattedMessages,
          );
          responseContent = extractCompletionContent(fallbackCompletion);
          if (!responseContent) {
            throw err;
          }
        } catch (fallbackErr: unknown) {
          const fbMessage = fallbackErr instanceof Error ? fallbackErr.message : "Unknown error";
          console.error("All AI gateways failed:", fbMessage);
          responseContent = AI_FALLBACK_RESPONSE;
        }
      }

      res.json({ content: responseContent });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during AI processing.";
      console.error("AI endpoint error:", error);
      res.status(500).json({ error: errorMessage });
    }
  });

  // ── Health check endpoint ──────────────────────────────────────────────────
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      version: "1.0.0",
      uptime: process.uptime(),
      environment: NODE_ENV,
    });
  });

  // ── Vite middleware for development ────────────────────────────────────────
  if (NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🏟️  Pitch Precision 26 server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   AI API Key: ${OPENROUTER_API_KEY ? "✅ configured" : "⚠️  missing"}`);
  });
}

startServer();
