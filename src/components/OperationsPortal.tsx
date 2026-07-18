import React, { useState, useRef, useEffect } from "react";
import {
  Zap, Users, Bus, Leaf, ShieldAlert, Radio,
  CheckCircle2, Clock, MapPin, Sparkles, Send,
  AlertTriangle, Wifi, RefreshCw, ChevronRight, Activity
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface OpsMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AccessibilityRequest {
  id: string;
  type: string;
  location: string;
  status: "pending" | "assigned" | "resolved";
  priority: "high" | "medium" | "low";
  fan: string;
  time: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const GATE_DATA = [
  { gate: "Gate A", status: "moderate", crowd: 72, waitMin: 8, color: "yellow" },
  { gate: "Gate B", status: "clear",    crowd: 38, waitMin: 2, color: "green"  },
  { gate: "Gate C", status: "busy",     crowd: 91, waitMin: 14, color: "red"   },
  { gate: "Gate D", status: "clear",    crowd: 22, waitMin: 1, color: "green"  },
];

const INITIAL_ACC_REQUESTS: AccessibilityRequest[] = [
  { id: "ACC-001", type: "Wheelchair Escort",   location: "Gate C, Level 1",    status: "pending",  priority: "high",   fan: "Fan #4421", time: "21:04" },
  { id: "ACC-002", type: "Audio Headset",        location: "Section 108, Row B", status: "assigned", priority: "medium", fan: "Fan #8812", time: "21:07" },
  { id: "ACC-003", type: "Sensory Room Access",  location: "Gate B Entry",       status: "pending",  priority: "high",   fan: "Fan #2234", time: "21:09" },
  { id: "ACC-004", type: "Companion Seating",    location: "Section 110-A",      status: "resolved", priority: "low",    fan: "Fan #6109", time: "20:55" },
];

const INCIDENT_CHIPS = [
  "Gate C is severely congested — recommend action",
  "Transit buses are delayed by 15 minutes — how to manage crowd?",
  "Fan medical emergency near Section 302 — protocol?",
  "Recycling station overflow at Level 2 — next steps?",
  "Volunteer shortage at Gate A — redistribution plan?",
  "Multilingual announcement needed in Spanish",
];

const SUSTAINABILITY_METRICS = [
  { label: "Solar Energy Share",   value: "30%",  target: "35%",  icon: "☀️", color: "text-yellow-400", progress: 85 },
  { label: "Recycling Rate",       value: "68%",  target: "80%",  icon: "♻️", color: "text-green-400",  progress: 68 },
  { label: "Green Transit Share",  value: "61%",  target: "70%",  icon: "🚌", color: "text-cyan-400",   progress: 87 },
  { label: "CO₂ Offset (tonnes)", value: "2.4t", target: "5t",   icon: "🌿", color: "text-emerald-400", progress: 48 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusColor = (status: string) => {
  if (status === "clear")    return "bg-secondary/10 border-secondary/20 text-secondary";
  if (status === "moderate") return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
  return "bg-red-500/10 border-red-500/20 text-red-400";
};

const getPriorityBadge = (priority: string) => {
  if (priority === "high")   return "bg-red-500/10 border-red-500/20 text-red-400";
  if (priority === "medium") return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
  return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
};

const formatMarkdownSimple = (text: string) => {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## "))
      return <h3 key={i} className="font-display font-bold text-sm text-on-surface mt-3 mb-1">{line.replace("## ", "")}</h3>;
    if (line.startsWith("### "))
      return <h4 key={i} className="font-display font-bold text-xs text-tertiary mt-2 mb-0.5">{line.replace("### ", "")}</h4>;
    if (line.trim().startsWith("- ") || line.trim().startsWith("* "))
      return <li key={i} className="ml-4 list-disc text-xs text-on-surface-variant leading-relaxed mb-0.5">{line.trim().replace(/^[-*] /, "")}</li>;
    if (line.trim() === "") return <div key={i} className="h-1.5" />;
    return <p key={i} className="text-xs text-on-surface-variant leading-relaxed mb-1">{line}</p>;
  });
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function OperationsPortal() {
  const [activeSection, setActiveSection] = useState<"command" | "accessibility" | "sustainability">("command");
  const [role, setRole] = useState<"Organizer" | "Volunteer" | "Venue Staff">("Organizer");
  const [messages, setMessages] = useState<OpsMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content: `🏟️ **FIFA 2026 Operations Command Center — Online**

Welcome, **${role}**. All systems are operational. Current match: **Brazil 2-1 France (72')**.

**Live Alerts:**
- ⚠️ Gate C congestion: 91% capacity. Recommend activating Gate D overflow.
- ✅ NJ Transit on schedule. Next shuttle: Secaucus Junction → MetLife in 6 min.
- 🌱 Recycling rate at 68%. Bins on Level 2 require collection.

How can I assist your operations today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accRequests, setAccRequests] = useState<AccessibilityRequest[]>(INITIAL_ACC_REQUESTS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleQuery = async (query?: string) => {
    const text = (query || inputQuery).trim();
    if (!text || isLoading) return;
    if (!query) setInputQuery("");

    const userMsg: OpsMessage = { id: `u-${Date.now()}`, role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
          })),
          context: {
            role,
            mode: "operations",
            activeGates: GATE_DATA,
            currentMatch: "Brazil vs France 2-1 (72')",
          },
        }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: "ai", content: data.content || "No response.", timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "ai",
          content: "⚠️ **AI gateway offline.** Please check network connectivity or contact the technical operations team.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const dispatchVolunteer = (id: string) => {
    setAccRequests((prev) =>
      prev.map((r) => (r.id === id && r.status === "pending" ? { ...r, status: "assigned" } : r))
    );
  };

  const resolveRequest = (id: string) => {
    setAccRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))
    );
  };

  return (
    <div className="space-y-6" role="main" aria-label="Staff and Operations Portal">
      {/* ── Header ── */}
      <div className="bg-surface-container/40 backdrop-blur-md px-6 py-4 rounded-xl border border-white/5 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-xl tracking-tight uppercase flex items-center gap-2.5 text-on-surface">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] animate-pulse" aria-hidden="true" />
            Operations Command Center
          </h2>
          <p className="text-[10px] text-on-surface-variant font-mono mt-0.5 uppercase tracking-wider">
            FIFA World Cup 2026 · MetLife Stadium · Live
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex bg-surface-container rounded-xl p-1 border border-white/10 self-start md:self-auto" role="group" aria-label="Select operational role">
          {(["Organizer", "Volunteer", "Venue Staff"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              aria-pressed={role === r}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                role === r ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Summary Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Gate C Congestion", value: "91%", icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          { label: "Active Incidents",   value: "3",   icon: <Radio className="w-5 h-5" />,          color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
          { label: "Transit ETA",        value: "6 min", icon: <Bus className="w-5 h-5" />,          color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20" },
          { label: "Eco Score",          value: "68%", icon: <Leaf className="w-5 h-5" />,           color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
        ].map((kpi) => (
          <div key={kpi.label} className={`glass-panel rounded-2xl p-4 border ${kpi.bg} flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`} aria-hidden="true">
              {kpi.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/60 block">{kpi.label}</span>
              <span className={`font-display font-extrabold text-xl ${kpi.color}`}>{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section Tabs ── */}
      <div className="flex bg-surface-container rounded-xl p-1 border border-white/10 w-full md:w-auto self-start" role="tablist">
        {[
          { id: "command",       label: "🧠 AI Command", ariaLabel: "AI Command Center" },
          { id: "accessibility", label: "♿ Accessibility", ariaLabel: "Accessibility Dispatch" },
          { id: "sustainability",label: "🌱 Sustainability", ariaLabel: "Sustainability Dashboard" },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeSection === tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeSection === tab.id ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── AI Command Center ── */}
      {activeSection === "command" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" role="tabpanel" aria-label="AI Command Center">
          {/* GenAI Chat */}
          <div className="xl:col-span-7 glass-panel rounded-2xl border border-white/5 flex flex-col overflow-hidden h-[580px]">
            {/* Chat Header */}
            <div className="bg-surface-container/60 px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400" aria-hidden="true">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-on-surface uppercase flex items-center gap-2">
                  Operational Decision Support
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" aria-hidden="true" />
                </h3>
                <p className="text-[10px] text-on-surface-variant/70 font-mono">POWERED BY GenAI · STADIUM OPERATIONS MODE</p>
              </div>
            </div>

            {/* Incident Chips */}
            <div className="bg-surface-container-low/40 px-4 py-3 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none" aria-label="Quick operational queries">
              {INCIDENT_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleQuery(chip)}
                  className="flex-shrink-0 bg-surface-container/50 border border-white/5 hover:border-red-500/30 hover:bg-white/5 text-[10px] font-medium text-on-surface px-3 py-1.5 rounded-lg transition-all"
                  aria-label={`Query: ${chip}`}
                >
                  {chip.length > 45 ? chip.slice(0, 45) + "…" : chip}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4" aria-live="polite" aria-label="Operational AI conversation">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 max-w-[90%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border text-[10px] font-bold ${
                    m.role === "user"
                      ? "bg-primary-container/20 border-primary-light/10 text-primary-light"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`} aria-hidden="true">
                    {m.role === "user" ? "ME" : "⚡"}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 border text-xs ${
                    m.role === "user"
                      ? "bg-surface-container-high border-white/10"
                      : "bg-surface-container-low/60 border-white/5"
                  }`}>
                    <div className="space-y-0.5">{formatMarkdownSimple(m.content)}</div>
                    <div className="text-[8px] text-on-surface-variant/30 font-mono mt-1 text-right">
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 mr-auto">
                  <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-[10px] font-bold" aria-hidden="true">⚡</div>
                  <div className="bg-surface-container-low/60 border border-white/5 rounded-2xl px-5 py-3.5 flex items-center gap-1.5" aria-label="AI is processing">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/80 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/80 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-surface-container/30 border-t border-white/5 flex gap-3">
              <label htmlFor="ops-query-input" className="sr-only">Type an operational query</label>
              <input
                id="ops-query-input"
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                placeholder="Ask about crowd flow, gate status, incident response..."
                aria-label="Operational query input"
                className="flex-1 bg-surface-container-lowest border border-white/10 rounded-xl py-3 px-4 text-xs text-on-surface focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
              />
              <button
                onClick={() => handleQuery()}
                disabled={isLoading}
                aria-label="Send operational query"
                className="w-11 h-11 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-90 active:scale-95 transition-all text-white flex items-center justify-center shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Gate Flow Telemetry */}
          <div className="xl:col-span-5 flex flex-col gap-4">
            <div className="glass-panel rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                <Activity className="w-4 h-4 text-red-400" aria-hidden="true" />
                <h3 className="font-display font-bold text-sm uppercase tracking-wide text-on-surface">Live Gate Telemetry</h3>
                <span className="ml-auto text-[9px] font-mono text-on-surface-variant/50 flex items-center gap-1">
                  <Wifi className="w-3 h-3" aria-hidden="true" /> LIVE
                </span>
              </div>
              <div className="space-y-4" role="list" aria-label="Gate status list">
                {GATE_DATA.map((g) => (
                  <div key={g.gate} className="space-y-1.5" role="listitem">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-on-surface-variant/60" aria-hidden="true" />
                        <span className="text-xs font-bold text-on-surface font-mono">{g.gate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getStatusColor(g.status)}`}>
                          {g.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-on-surface-variant/60">~{g.waitMin}m wait</span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={g.crowd} aria-valuemin={0} aria-valuemax={100} aria-label={`${g.gate} crowd level ${g.crowd}%`}>
                      <div
                        className={`h-full transition-all duration-700 ${g.crowd > 85 ? "bg-red-500" : g.crowd > 60 ? "bg-yellow-400" : "bg-secondary"}`}
                        style={{ width: `${g.crowd}%` }}
                      />
                    </div>
                    <div className="text-[9px] font-mono text-on-surface-variant/50 text-right">{g.crowd}% capacity</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Incidents Mini Panel */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                <ShieldAlert className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                <h3 className="font-display font-bold text-sm uppercase tracking-wide text-on-surface">Active Incidents</h3>
              </div>
              <div className="space-y-2.5" role="list" aria-label="Active incident list">
                {[
                  { icon: "🚑", text: "Medical alert — Level 1, near Gate C", time: "21:06", severity: "high" },
                  { icon: "👶", text: "Lost child reported — Gate B concourse", time: "21:10", severity: "high" },
                  { icon: "🗑️", text: "Overflow recycling bin — Level 2", time: "21:12", severity: "low" },
                ].map((inc, i) => (
                  <div key={i} className={`bg-surface-container/40 rounded-xl p-3 border flex justify-between items-center ${
                    inc.severity === "high" ? "border-red-500/15" : "border-white/5"
                  }`} role="listitem">
                    <div className="flex items-center gap-2">
                      <span className="text-sm" aria-hidden="true">{inc.icon}</span>
                      <span className="text-[11px] text-on-surface-variant">{inc.text}</span>
                    </div>
                    <span className="text-[9px] font-mono text-on-surface-variant/50 ml-2 flex-shrink-0">{inc.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Accessibility Dispatcher ── */}
      {activeSection === "accessibility" && (
        <div className="glass-panel rounded-2xl p-6 border border-white/5" role="tabpanel" aria-label="Accessibility Dispatch Console">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
            <Users className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <h3 className="font-display font-bold text-lg uppercase tracking-wide text-on-surface">Accessibility Assistance Dispatch</h3>
            <span className="ml-auto text-xs font-mono text-on-surface-variant/60 bg-surface-container px-3 py-1 rounded-full border border-white/10">
              {accRequests.filter((r) => r.status === "pending").length} Pending
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Accessibility assistance requests">
            {accRequests.map((req) => (
              <div
                key={req.id}
                className={`bg-surface-container/40 rounded-2xl p-5 border flex flex-col justify-between gap-4 transition-all ${
                  req.status === "resolved" ? "opacity-50 border-white/5" : "border-cyan-500/10 hover:border-cyan-500/25"
                }`}
                role="listitem"
                aria-label={`Accessibility request ${req.id}: ${req.type}, status ${req.status}`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold text-on-surface-variant/60">{req.id}</span>
                    <div className="flex gap-2">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadge(req.priority)}`}>
                        {req.priority}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                        req.status === "resolved" ? "bg-secondary/10 border-secondary/20 text-secondary" :
                        req.status === "assigned" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                        "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-display font-extrabold text-sm text-on-surface">{req.type}</h4>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    {req.location}
                  </p>
                  <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/50">
                    <span>{req.fan}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden="true" /> {req.time}</span>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  {req.status === "pending" && (
                    <button
                      onClick={() => dispatchVolunteer(req.id)}
                      aria-label={`Dispatch volunteer for ${req.type} at ${req.location}`}
                      className="flex-1 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" /> Dispatch Volunteer
                    </button>
                  )}
                  {req.status === "assigned" && (
                    <button
                      onClick={() => resolveRequest(req.id)}
                      aria-label={`Mark ${req.type} request as resolved`}
                      className="flex-1 py-2 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary text-xs font-bold hover:bg-secondary/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Mark Resolved
                    </button>
                  )}
                  {req.status === "resolved" && (
                    <span className="flex-1 py-2 rounded-xl bg-secondary/5 border border-secondary/10 text-secondary/60 text-xs font-bold text-center">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sustainability Dashboard ── */}
      {activeSection === "sustainability" && (
        <div className="space-y-6" role="tabpanel" aria-label="Sustainability Dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SUSTAINABILITY_METRICS.map((metric) => (
              <div key={metric.label} className="glass-panel rounded-2xl p-6 border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/60 block">{metric.label}</span>
                    <h3 className={`font-display font-extrabold text-3xl mt-1 ${metric.color}`}>{metric.value}</h3>
                  </div>
                  <span className="text-3xl" role="img" aria-label={metric.label}>{metric.icon}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/50">
                    <span>Progress to target</span>
                    <span>Target: {metric.target}</span>
                  </div>
                  <div className="w-full bg-surface-container-lowest h-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={metric.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${metric.label} progress: ${metric.progress}%`}>
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${metric.progress > 80 ? "bg-secondary" : metric.progress > 60 ? "bg-yellow-400" : "bg-red-500"}`}
                      style={{ width: `${metric.progress}%` }}
                    />
                  </div>
                  <div className="text-[9px] font-mono text-right text-on-surface-variant/40">{metric.progress}% to target</div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
              <Leaf className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <h3 className="font-display font-bold text-sm uppercase tracking-wide text-on-surface">Live Eco Feed</h3>
            </div>
            <div className="space-y-3" role="log" aria-label="Live sustainability event feed" aria-live="polite">
              {[
                { time: "21:09", icon: "♻️", text: "Level 2 recycling bins at 78% capacity — Collection team dispatched." },
                { time: "21:07", icon: "🚌", text: "61% of fans arrived by NJ Transit — Record for this tournament!" },
                { time: "20:58", icon: "☀️", text: "Solar panels generated 4.2 MWh since gates opened." },
                { time: "20:45", icon: "💧", text: "Reusable cup exchange: 14,200 units returned across all stands." },
              ].map((entry, i) => (
                <div key={i} className="flex gap-3 items-start bg-surface-container/30 rounded-xl p-3.5 border border-white/5">
                  <span className="text-base flex-shrink-0" aria-hidden="true">{entry.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-on-surface-variant leading-relaxed">{entry.text}</p>
                  </div>
                  <span className="text-[9px] font-mono text-on-surface-variant/40 flex-shrink-0">{entry.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
