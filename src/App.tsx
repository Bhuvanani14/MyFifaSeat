import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import { User, Ticket } from "./types";
import { INITIAL_TICKETS, SEAT_ID_BY_LOCATION } from "./data";
import LoginView from "./components/LoginView";
import ErrorBoundary from "./components/ErrorBoundary";
import { useEscapeKey } from "./hooks/useEscapeKey";
import { 
  Compass, 
  Ticket as TicketIcon, 
  MessageSquare, 
  Users, 
  LogOut, 
  Sun, 
  Moon, 
  User as UserIcon, 
  Trophy, 
  CheckCircle,
  Menu,
  Sparkles,
  Calendar,
  Building2,
  Loader2
} from "lucide-react";

// ── Lazy-loaded route-level components for code splitting (Efficiency) ────────
const StadiumView = lazy(() => import("./components/StadiumView"));
const TicketsView = lazy(() => import("./components/TicketsView"));
const AIAssistantView = lazy(() => import("./components/AIAssistantView"));
const CrowdProfileView = lazy(() => import("./components/CrowdProfileView"));
const SoccerGameView = lazy(() => import("./components/SoccerGameView"));
const MatchScheduleView = lazy(() => import("./components/MatchScheduleView"));
const OperationsPortal = lazy(() => import("./components/OperationsPortal"));

/** Valid navigation tab identifiers. */
type TabId = "stadium" | "tickets" | "assistant" | "crowd" | "shootout" | "schedule" | "operations";

interface NavigationItem {
  id: TabId;
  label: string;
  Icon: LucideIcon;
  accent: "default" | "operations";
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "stadium", label: "Stadium", Icon: Compass, accent: "default" },
  { id: "tickets", label: "Tickets", Icon: TicketIcon, accent: "default" },
  { id: "schedule", label: "Match Schedule", Icon: Calendar, accent: "default" },
  { id: "assistant", label: "AI Assistant", Icon: MessageSquare, accent: "default" },
  { id: "crowd", label: "Crowd Profile", Icon: Users, accent: "default" },
  { id: "operations", label: "Operations", Icon: Building2, accent: "operations" },
  { id: "shootout", label: "Shootout Game", Icon: Trophy, accent: "default" },
];

/** Alert notification displayed as a toast banner. */
interface AlertState {
  message: string;
  type: "success" | "info";
}

/** Loading fallback component displayed while lazy components load. */
function TabLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" role="status" aria-label="Loading content">
      <Loader2 className="w-8 h-8 text-tertiary animate-spin" aria-hidden="true" />
      <p className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">Loading module…</p>
    </div>
  );
}

/**
 * Root application component for Pitch Precision 26.
 * 
 * Handles authentication state, tab navigation, ticket management,
 * theme toggling, and renders the appropriate view based on active tab.
 * All heavy view components are lazy-loaded for optimal bundle splitting.
 */
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("stadium");
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [darkMode, setDarkMode] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync dark mode class with HTML document
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => () => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
  }, []);

  // ── Memoized computed values (Efficiency) ──────────────────────────────────
  /** Track purchased seat IDs to mark seats as taken on the stadium map. */
  const purchasedSeatIds = useMemo(() => {
    return tickets
      .map((ticket) => SEAT_ID_BY_LOCATION.get(`${ticket.section}:${ticket.row}:${ticket.seat}`))
      .filter((seatId): seatId is string => Boolean(seatId));
  }, [tickets]);

  // ── Stable callbacks (Efficiency — prevent re-renders) ─────────────────────
  /** Show a toast notification for a set duration. */
  const triggerAlert = useCallback((message: string, type: "success" | "info") => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlert({ message, type });
    alertTimeoutRef.current = setTimeout(() => {
      setAlert(null);
      alertTimeoutRef.current = null;
    }, 4000);
  }, []);

  /** Handle a completed seat purchase: add ticket and switch to wallet. */
  const handleSeatPurchase = useCallback((newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
    triggerAlert(
      `Seat ${newTicket.section}-${newTicket.row}-${newTicket.seat} reserved successfully! Ticket added to your wallet.`,
      "success"
    );
    setActiveTab("tickets");
  }, [triggerAlert]);

  /** Remove a ticket from the wallet after transfer. */
  const handleTransferTicket = useCallback((ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    triggerAlert("Ticket transferred successfully.", "info");
  }, [triggerAlert]);

  /** Sign the user out and reset profile menu. */
  const handleLogout = useCallback(() => {
    setUser(null);
    setShowProfileMenu(false);
  }, []);

  /** Switch active tab and move focus to main content for accessibility. */
  const switchTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
    // Shift focus to main content region for screen readers (WCAG 2.4.3)
    requestAnimationFrame(() => {
      mainContentRef.current?.focus();
    });
  }, []);

  // If not authenticated, render LoginView
  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans pb-24 md:pb-0 pt-16 md:pt-0 relative">
      
      {/* Background 3D Elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-5 dark:opacity-25 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-600 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-emerald-600 rounded-full blur-[160px]" />
      </div>

      {/* Background Stadium Glow Images */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center opacity-5 dark:opacity-35 transition-opacity duration-500" 
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmKLU2QVd9K6KvX8QRnmDPwP934JjEgV7a4SvO-yuhq2uFUe3OStwjHoZDKQS2sUm7yQeAT24GQqTnEek-YhaqEIxtDCOQpVFnCE0O7fWKvZ4ew25yRf8s5WOMivO_xbEKKEnB7DZ7kwlKUk33MdZiVtmAkq7GwjUjiO-o_xgZ5-W7taJ84Q7HXUGgxHsiRK3pup20JRaH87VeRQ7nNc7eTm_sbZZP4QV3yi4JYz5dCgk84MnG1Pka')" 
        }} 
        role="presentation"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[-1] bg-gradient-to-t from-background via-background/95 to-transparent" aria-hidden="true" />

      {/* Global Notifications/Alerts Toast Banner */}
      {alert && (
        <div
          className="fixed top-20 right-6 z-[100] max-w-sm glass-panel rounded-xl p-4 border border-white/15 shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-300"
          role="status"
          aria-live="polite"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            alert.type === "success" ? "bg-secondary/10 text-secondary" : "bg-primary-light/10 text-primary-light"
          }`}>
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs font-bold block text-on-surface">System Notification</span>
            <p className="text-[11px] text-on-surface-variant leading-normal mt-0.5">{alert.message}</p>
          </div>
        </div>
      )}

      {/* Top Mobile Header (Matches standard UI height of 16) */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5 h-16 flex justify-between items-center px-6 md:hidden" role="banner">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-tertiary" aria-hidden="true" />
          <h1 className="font-display font-extrabold text-sm uppercase tracking-wider text-on-surface">
            FIFA WORLD CUP 2026
          </h1>
        </div>
        
        {/* Profile Dropdown trigger on Mobile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-surface-container overflow-hidden border border-white/10 active:scale-95 duration-150 cursor-pointer"
            aria-label="Open profile menu"
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
          >
            <img className="w-full h-full object-cover" alt={`${user.name} avatar`} src={user.avatar} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2.5 w-48 glass-panel rounded-xl border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150" role="menu">
              <div className="px-3 py-2 border-b border-white/5 mb-1 text-xs">
                <div className="font-bold text-on-surface">{user.name}</div>
                <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">Section {user.section}, Seat {user.seat}</div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all text-left"
                role="menuitem"
                aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
              >
                {darkMode ? <Sun className="w-4 h-4 text-yellow-400" aria-hidden="true" /> : <Moon className="w-4 h-4 text-blue-400" aria-hidden="true" />}
                <span>{darkMode ? "Light Theme" : "Dark Theme"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-error hover:bg-red-500/10 transition-all text-left"
                role="menuitem"
                aria-label="Sign out of your account"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Desktop Navigation Left Sidebar */}
      <nav className="hidden md:flex flex-col h-full w-80 rounded-r-2xl bg-surface-container-high divide-y divide-white/5 shadow-2xl py-8 fixed top-0 left-0 z-40 border-r border-white/5" aria-label="Main navigation">
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2.5 mb-6">
            <Trophy className="w-7 h-7 text-secondary" aria-hidden="true" />
            <h1 className="font-display font-extrabold text-xl text-on-surface tracking-tight uppercase">
              FIFA 26
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface overflow-hidden border border-white/10">
              <img className="w-full h-full object-cover" alt={`${user.name} avatar`} src={user.avatar} />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-on-surface">{user.name}</div>
              <div className="font-mono text-[10px] text-on-surface-variant mt-0.5">Section {user.section}, Seat {user.seat}</div>
              <div className="font-mono text-[9px] text-secondary font-bold tracking-wider uppercase mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" aria-hidden="true" /> Premium Fan
              </div>
            </div>
          </div>
        </div>

        {/* Desktop nav tabs */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2.5" role="tablist" aria-label="Application sections">
          {([
            { id: "stadium" as TabId,    label: "Stadium",        icon: <Compass className="w-5 h-5 text-tertiary" aria-hidden="true" /> },
            { id: "tickets" as TabId,    label: "Tickets",        icon: <TicketIcon className="w-5 h-5 text-tertiary" aria-hidden="true" /> },
            { id: "schedule" as TabId,   label: "Match Schedule",  icon: <Calendar className="w-5 h-5 text-tertiary" aria-hidden="true" /> },
            { id: "assistant" as TabId,  label: "AI Assistant",    icon: <MessageSquare className="w-5 h-5 text-tertiary" aria-hidden="true" /> },
            { id: "crowd" as TabId,      label: "Crowd Profile",   icon: <Users className="w-5 h-5 text-tertiary" aria-hidden="true" /> },
            { id: "operations" as TabId, label: "Operations",      icon: <Building2 className="w-5 h-5 text-red-400" aria-hidden="true" /> },
            { id: "shootout" as TabId,   label: "Shootout Game",   icon: <Trophy className="w-5 h-5 text-tertiary" aria-hidden="true" /> },
          ]).map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="main-content"
              onClick={() => switchTab(tab.id)}
              id={`desktop-nav-${tab.id}-button`}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-display font-bold text-sm transition-all text-left duration-200 hover:translate-x-1 ${
                activeTab === tab.id
                  ? tab.id === "operations"
                    ? "bg-primary-container text-on-primary border-l-4 border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.2)]"
                    : "bg-primary-container text-on-primary border-l-4 border-tertiary shadow-[0_0_15px_rgba(0,70,167,0.3)]"
                  : "text-on-surface-variant hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Desktop Footer utilities */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full bg-surface-container border border-white/5 hover:border-white/10 text-xs font-bold text-on-surface-variant hover:text-on-surface py-3 px-4 rounded-xl flex items-center justify-between transition-all"
            aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
          >
            <span>Switch Theme</span>
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" aria-hidden="true" /> : <Moon className="w-4 h-4 text-blue-400" aria-hidden="true" />}
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-surface-container border border-white/5 hover:border-red-500/20 text-xs font-bold text-error py-3 px-4 rounded-xl flex items-center justify-between transition-all group"
            aria-label="Sign out of your account"
          >
            <span>Sign Out</span>
            <LogOut className="w-4 h-4 opacity-60 group-hover:opacity-100" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main
        id="main-content"
        ref={mainContentRef}
        className="md:ml-80 p-6 md:p-10 max-w-[1440px] mx-auto min-h-screen"
        role="main"
        tabIndex={-1}
        aria-label={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view`}
      >
        <ErrorBoundary>
          <Suspense fallback={<TabLoadingFallback />}>
            {activeTab === "stadium" && (
              <StadiumView 
                onSeatPurchase={handleSeatPurchase} 
                purchasedSeats={purchasedSeatIds}
                darkMode={darkMode}
                onTriggerAlert={triggerAlert}
              />
            )}
            {activeTab === "tickets" && (
              <TicketsView 
                tickets={tickets} 
                onTransferTicket={handleTransferTicket} 
              />
            )}
            {activeTab === "schedule" && (
              <MatchScheduleView onSelectStadium={() => switchTab("stadium")} />
            )}
            {activeTab === "assistant" && (
              <AIAssistantView user={user} />
            )}
            {activeTab === "crowd" && (
              <CrowdProfileView />
            )}
            {activeTab === "operations" && (
              <OperationsPortal />
            )}
            {activeTab === "shootout" && (
              <SoccerGameView />
            )}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Bottom Mobile Tab Navigation Bar (Hidden on Desktop) */}
      <nav
        className="fixed bottom-0 w-full z-50 rounded-t-2xl bg-surface/90 backdrop-blur-2xl border-t border-white/15 shadow-[0_-4px_25px_rgba(0,0,0,0.6)] flex justify-around items-center h-20 px-2 pb-safe md:hidden overflow-x-auto scrollbar-none"
        aria-label="Mobile navigation"
        role="tablist"
      >
        {([
          { id: "stadium" as TabId,    label: "Stadium",  icon: <Compass className="w-4 h-4" aria-hidden="true" /> },
          { id: "tickets" as TabId,    label: "Tickets",  icon: <TicketIcon className="w-4 h-4" aria-hidden="true" /> },
          { id: "schedule" as TabId,   label: "Schedule", icon: <Calendar className="w-4 h-4" aria-hidden="true" /> },
          { id: "assistant" as TabId,  label: "AI Chat",  icon: <MessageSquare className="w-4 h-4" aria-hidden="true" /> },
          { id: "operations" as TabId, label: "Ops",      icon: <Building2 className="w-4 h-4" aria-hidden="true" /> },
          { id: "crowd" as TabId,      label: "Crowd",    icon: <Users className="w-4 h-4" aria-hidden="true" /> },
          { id: "shootout" as TabId,   label: "Game",     icon: <Trophy className="w-4 h-4" aria-hidden="true" /> },
        ]).map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls="main-content"
            onClick={() => switchTab(tab.id)}
            id={`mobile-nav-${tab.id}-button`}
            className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 transition-all duration-200 active:scale-90 ${
              activeTab === tab.id
                ? tab.id === "operations"
                  ? "bg-red-600/80 text-white shadow-[0_0_12px_rgba(248,113,113,0.4)]"
                  : "bg-primary text-on-primary shadow-[0_0_12px_rgba(0,70,167,0.4)]"
                : "text-on-surface-variant/70 hover:text-on-surface"
            }`}
          >
            {tab.icon}
            <span className="text-[9px] font-mono font-bold mt-1 uppercase">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
