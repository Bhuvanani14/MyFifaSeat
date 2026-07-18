import React, { useState, useEffect } from "react";
import { User, Ticket } from "./types";
import { INITIAL_TICKETS, SEATS } from "./data";
import LoginView from "./components/LoginView";
import StadiumView from "./components/StadiumView";
import TicketsView from "./components/TicketsView";
import AIAssistantView from "./components/AIAssistantView";
import CrowdProfileView from "./components/CrowdProfileView";
import SoccerGameView from "./components/SoccerGameView";
import MatchScheduleView from "./components/MatchScheduleView";
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
  Calendar
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"stadium" | "tickets" | "assistant" | "crowd" | "shootout" | "schedule">("stadium");
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [darkMode, setDarkMode] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "info" } | null>(null);

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

  // Purchased seat IDs tracker to mark seats as taken after a checkout by mapping tickets to SEATS entries
  const purchasedSeatIds = tickets.map(t => {
    const found = SEATS.find(s => s.section === t.section && s.row === t.row && s.number.toString() === t.seat);
    return found ? found.id : "";
  }).filter(id => id !== "");

  const handleSeatPurchase = (newTicket: Ticket) => {
    setTickets([newTicket, ...tickets]);

    // Show booking alert
    triggerAlert(`Seat ${newTicket.section}-${newTicket.row}-${newTicket.seat} reserved successfully! Ticket added to your wallet.`, "success");
    // Switch to tickets view to show the ticket!
    setActiveTab("tickets");
  };

  const handleTransferTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    triggerAlert("Ticket transferred successfully.", "info");
  };

  const triggerAlert = (message: string, type: "success" | "info") => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const handleLogout = () => {
    setUser(null);
    setShowProfileMenu(false);
  };

  // If not authenticated, render LoginView
  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans pb-24 md:pb-0 pt-16 md:pt-0 relative">
      
      {/* Background 3D Elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-5 dark:opacity-25 overflow-hidden">
        <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-600 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-emerald-600 rounded-full blur-[160px]" />
      </div>

      {/* Background Stadium Glow Images */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center opacity-5 dark:opacity-35 transition-opacity duration-500" 
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmKLU2QVd9K6KvX8QRnmDPwP934JjEgV7a4SvO-yuhq2uFUe3OStwjHoZDKQS2sUm7yQeAT24GQqTnEek-YhaqEIxtDCOQpVFnCE0O7fWKvZ4ew25yRf8s5WOMivO_xbEKKEnB7DZ7kwlKUk33MdZiVtmAkq7GwjUjiO-o_xgZ5-W7taJ84Q7HXUGgxHsiRK3pup20JRaH87VeRQ7nNc7eTm_sbZZP4QV3yi4JYz5dCgk84MnG1Pka')" 
        }} 
      />
      <div className="fixed inset-0 z-[-1] bg-gradient-to-t from-background via-background/95 to-transparent" />

      {/* Global Notifications/Alerts Toast Banner */}
      {alert && (
        <div className="fixed top-20 right-6 z-[100] max-w-sm glass-panel rounded-xl p-4 border border-white/15 shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            alert.type === "success" ? "bg-secondary/10 text-secondary" : "bg-primary-light/10 text-primary-light"
          }`}>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block text-on-surface">System Notification</span>
            <p className="text-[11px] text-on-surface-variant leading-normal mt-0.5">{alert.message}</p>
          </div>
        </div>
      )}

      {/* Top Mobile Header (Matches standard UI height of 16) */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5 h-16 flex justify-between items-center px-6 md:hidden">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-tertiary" />
          <h1 className="font-display font-extrabold text-sm uppercase tracking-wider text-on-surface">
            FIFA WORLD CUP 2026
          </h1>
        </div>
        
        {/* Profile Dropdown trigger on Mobile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-surface-container overflow-hidden border border-white/10 active:scale-95 duration-150 cursor-pointer"
          >
            <img className="w-full h-full object-cover" alt="Alex Morgan Avatar" src={user.avatar} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2.5 w-48 glass-panel rounded-xl border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-white/5 mb-1 text-xs">
                <div className="font-bold text-on-surface">{user.name}</div>
                <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">Section 302, Seat 12</div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all text-left"
              >
                {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
                <span>{darkMode ? "Light Theme" : "Dark Theme"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-error hover:bg-red-500/10 transition-all text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Desktop Navigation Left Sidebar (Hidden on Mobile, spans 80px) */}
      <nav className="hidden md:flex flex-col h-full w-80 rounded-r-2xl bg-surface-container-high divide-y divide-white/5 shadow-2xl py-8 fixed top-0 left-0 z-40 border-r border-white/5">
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2.5 mb-6">
            <Trophy className="w-7 h-7 text-secondary" />
            <h1 className="font-display font-extrabold text-xl text-on-surface tracking-tight uppercase">
              FIFA 26
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface overflow-hidden border border-white/10">
              <img className="w-full h-full object-cover" alt="Alex Morgan Avatar" src={user.avatar} />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-on-surface">{user.name}</div>
              <div className="font-mono text-[10px] text-on-surface-variant mt-0.5">Section 302, Seat 12</div>
              <div className="font-mono text-[9px] text-secondary font-bold tracking-wider uppercase mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Premium Fan
              </div>
            </div>
          </div>
        </div>

        {/* Desktop nav tabs */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2.5">
          <button
            onClick={() => setActiveTab("stadium")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-display font-bold text-sm transition-all text-left duration-200 hover:translate-x-1 ${
              activeTab === "stadium"
                ? "bg-primary-container text-on-primary border-l-4 border-tertiary shadow-[0_0_15px_rgba(0,70,167,0.3)]"
                : "text-on-surface-variant hover:bg-white/5"
            }`}
          >
            <Compass className="w-5 h-5 text-tertiary" />
            <span>Stadium</span>
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-display font-bold text-sm transition-all text-left duration-200 hover:translate-x-1 ${
              activeTab === "tickets"
                ? "bg-primary-container text-on-primary border-l-4 border-tertiary shadow-[0_0_15px_rgba(0,70,167,0.3)]"
                : "text-on-surface-variant hover:bg-white/5"
            }`}
          >
            <TicketIcon className="w-5 h-5 text-tertiary" />
            <span>Tickets</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-display font-bold text-sm transition-all text-left duration-200 hover:translate-x-1 ${
              activeTab === "schedule"
                ? "bg-primary-container text-on-primary border-l-4 border-tertiary shadow-[0_0_15px_rgba(0,70,167,0.3)]"
                : "text-on-surface-variant hover:bg-white/5"
            }`}
          >
            <Calendar className="w-5 h-5 text-tertiary" />
            <span>Match Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab("assistant")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-display font-bold text-sm transition-all text-left duration-200 hover:translate-x-1 ${
              activeTab === "assistant"
                ? "bg-primary-container text-on-primary border-l-4 border-tertiary shadow-[0_0_15px_rgba(0,70,167,0.3)]"
                : "text-on-surface-variant hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-5 h-5 text-tertiary" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab("crowd")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-display font-bold text-sm transition-all text-left duration-200 hover:translate-x-1 ${
              activeTab === "crowd"
                ? "bg-primary-container text-on-primary border-l-4 border-tertiary shadow-[0_0_15px_rgba(0,70,167,0.3)]"
                : "text-on-surface-variant hover:bg-white/5"
            }`}
          >
            <Users className="w-5 h-5 text-tertiary" />
            <span>Crowd Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("shootout")}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-display font-bold text-sm transition-all text-left duration-200 hover:translate-x-1 ${
              activeTab === "shootout"
                ? "bg-primary-container text-on-primary border-l-4 border-tertiary shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                : "text-on-surface-variant hover:bg-white/5"
            }`}
            id="desktop-nav-shootout-button"
          >
            <Trophy className="w-5 h-5 text-tertiary" />
            <span>Shootout Game</span>
          </button>
        </div>

        {/* Desktop Footer utilities */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full bg-surface-container border border-white/5 hover:border-white/10 text-xs font-bold text-on-surface-variant hover:text-on-surface py-3 px-4 rounded-xl flex items-center justify-between transition-all"
          >
            <span>Switch Theme</span>
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-surface-container border border-white/5 hover:border-red-500/20 text-xs font-bold text-error py-3 px-4 rounded-xl flex items-center justify-between transition-all group"
          >
            <span>Sign Out</span>
            <LogOut className="w-4 h-4 opacity-60 group-hover:opacity-100" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="md:ml-80 p-6 md:p-10 max-w-[1440px] mx-auto min-h-screen">
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
          <MatchScheduleView onSelectStadium={() => setActiveTab("stadium")} />
        )}
        {activeTab === "assistant" && (
          <AIAssistantView user={user} />
        )}
        {activeTab === "crowd" && (
          <CrowdProfileView />
        )}
        {activeTab === "shootout" && (
          <SoccerGameView />
        )}
      </main>

      {/* Bottom Mobile Tab Navigation Bar (Hidden on Desktop) */}
      <nav className="fixed bottom-0 w-full z-50 rounded-t-2xl bg-surface/90 backdrop-blur-2xl border-t border-white/15 shadow-[0_-4px_25px_rgba(0,0,0,0.6)] flex justify-around items-center h-20 px-2 pb-safe md:hidden overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("stadium")}
          className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 transition-all duration-200 active:scale-90 ${
            activeTab === "stadium"
              ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(0,70,167,0.4)]"
              : "text-on-surface-variant/70 hover:text-on-surface"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[9px] font-mono font-bold mt-1 uppercase">Stadium</span>
        </button>

        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 transition-all duration-200 active:scale-90 ${
            activeTab === "tickets"
              ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(0,70,167,0.4)]"
              : "text-on-surface-variant/70 hover:text-on-surface"
          }`}
        >
          <TicketIcon className="w-4 h-4" />
          <span className="text-[9px] font-mono font-bold mt-1 uppercase">Tickets</span>
        </button>

        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 transition-all duration-200 active:scale-90 ${
            activeTab === "schedule"
              ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(0,70,167,0.4)]"
              : "text-on-surface-variant/70 hover:text-on-surface"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[9px] font-mono font-bold mt-1 uppercase">Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab("assistant")}
          className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 transition-all duration-200 active:scale-90 ${
            activeTab === "assistant"
              ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(0,70,167,0.4)]"
              : "text-on-surface-variant/70 hover:text-on-surface"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[9px] font-mono font-bold mt-1 uppercase">AI Chat</span>
        </button>

        <button
          onClick={() => setActiveTab("crowd")}
          className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 transition-all duration-200 active:scale-90 ${
            activeTab === "crowd"
              ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(0,70,167,0.4)]"
              : "text-on-surface-variant/70 hover:text-on-surface"
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[9px] font-mono font-bold mt-1 uppercase">Crowd</span>
        </button>

        <button
          onClick={() => setActiveTab("shootout")}
          className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 transition-all duration-200 active:scale-90 ${
            activeTab === "shootout"
              ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(79,70,229,0.4)]"
              : "text-on-surface-variant/70 hover:text-on-surface"
          }`}
          id="mobile-nav-shootout-button"
        >
          <Trophy className="w-4 h-4" />
          <span className="text-[9px] font-mono font-bold mt-1 uppercase">Game</span>
        </button>
      </nav>
    </div>
  );
}
