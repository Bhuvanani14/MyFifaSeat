import React, { useState } from "react";
import { Seat, Ticket } from "../types";
import { SEATS } from "../data";
import { Eye, HelpCircle, Check, Info, Sparkles, Filter, CreditCard, ChevronRight, CheckCircle, Trophy, Gamepad2, ThumbsUp, ChevronDown, ChevronUp, RefreshCw, Bell, BellOff } from "lucide-react";
import { motion } from "motion/react";
import SeatPanoramicPreview from "./SeatPanoramicPreview";

const QUIZ_QUESTIONS = [
  {
    question: "Which country has won the most FIFA World Cup titles?",
    options: ["Germany", "Italy", "Brazil", "Argentina"],
    correct: 2,
    fact: "Brazil has won the World Cup 5 times (1958, 1962, 1970, 1994, 2002) and is the only nation to play in every tournament!"
  },
  {
    question: "Who is the all-time top goalscorer in Men's FIFA World Cup history?",
    options: ["Pelé", "Miroslav Klose", "Ronaldo", "Lionel Messi"],
    correct: 1,
    fact: "Germany's Miroslav Klose scored 16 goals across 4 World Cups (2002-2014) to claim the crown!"
  },
  {
    question: "Which stadium is hosting the historic FIFA World Cup 2026 Final?",
    options: ["MetLife Stadium (NY/NJ)", "Azteca Stadium", "SoFi Stadium", "AT&T Stadium"],
    correct: 0,
    fact: "MetLife Stadium in East Rutherford, New Jersey, is officially selected to host the grand final of the 2026 FIFA World Cup on July 19, 2026!"
  },
  {
    question: "In which year and country was the first-ever FIFA World Cup held?",
    options: ["1934 in Italy", "1930 in Uruguay", "1950 in Brazil", "1928 in Switzerland"],
    correct: 1,
    fact: "The inaugural World Cup took place in Uruguay in July 1930, where Uruguay defeated Argentina in the final!"
  },
  {
    question: "Which legendary player scored the famous 'Hand of God' goal in 1986?",
    options: ["Diego Maradona", "Pelé", "Zinedine Zidane", "Johan Cruyff"],
    correct: 0,
    fact: "Diego Maradona scored the goal using his hand against England in the 1986 quarterfinal, later describing it as 'a little with the head of Maradona and a little with the hand of God'!"
  }
];

interface StadiumViewProps {
  onSeatPurchase: (ticket: Ticket) => void;
  purchasedSeats: string[]; // List of seat IDs already purchased
  darkMode: boolean;
  onTriggerAlert?: (message: string, type: "success" | "info") => void;
}

export default function StadiumView({ onSeatPurchase, purchasedSeats, darkMode, onTriggerAlert }: StadiumViewProps) {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [is3D, setIs3D] = useState(true);
  
  // Availability Alerts State
  const [sectionAlerts, setSectionAlerts] = useState<string[]>([]);
  const [releasedSeats, setReleasedSeats] = useState<string[]>([]);
  
  // Interactive 3D Perspective States
  const [rotateX, setRotateX] = useState(48);
  const [rotateZ, setRotateZ] = useState(-10);
  const [zoomScale, setZoomScale] = useState(0.95);
  const [zHeight, setZHeight] = useState(5);
  
  // Filters state
  const [filterUnder200, setFilterUnder200] = useState(false);
  const [filterAccessible, setFilterAccessible] = useState(false);
  const [filterShaded, setFilterShaded] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "soldout">("all");

  // Checkout modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // FIFA Trivia Quiz States
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizState, setQuizState] = useState<"idle" | "question" | "feedback" | "completed">("idle");
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizShowFact, setQuizShowFact] = useState(false);

  // Filter seats based on choices
  const filteredSeats = SEATS.map(seat => {
    // Overwrite availability if user has already bought it or if it is pre-sold, or if it was released by alerts
    let isActuallyAvailable = purchasedSeats.includes(seat.id) ? false : seat.isAvailable;
    if (releasedSeats.includes(seat.id)) {
      isActuallyAvailable = true;
    }
    
    let matches = true;
    if (filterUnder200 && seat.price >= 200) matches = false;
    if (filterAccessible && !seat.isAccessible) matches = false;
    if (filterShaded && !seat.isShaded) matches = false;
    
    if (availabilityFilter === "available" && !isActuallyAvailable) matches = false;
    if (availabilityFilter === "soldout" && isActuallyAvailable) matches = false;
    
    return {
      ...seat,
      isHighlighted: matches,
      isAvailable: isActuallyAvailable
    };
  });

  const hasQuizDiscount = quizState === "completed" && quizScore >= 3;

  // Dynamic AI suggestions from the list of available seats
  const availableSeats = filteredSeats.filter(s => s.isAvailable);
  const suggestedVip = availableSeats.find(s => s.category === "VIP") || SEATS.find(s => s.category === "VIP");
  const suggestedValue = availableSeats.find(s => s.category === "Category 1" || s.category === "Category 2") || SEATS.find(s => s.category === "Category 1");
  const suggestedBudget = availableSeats.find(s => s.category === "Category 3") || SEATS.find(s => s.category === "Category 3");

  const handleMiniMapSectionClick = (sectionName: string) => {
    // Find first available seat in this section
    const sectionSeats = filteredSeats.filter(s => s.section === sectionName);
    const available = sectionSeats.find(s => s.isAvailable);
    if (available) {
      setSelectedSeat(available);
    } else if (sectionSeats.length > 0) {
      setSelectedSeat(sectionSeats[0]);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isAvailable && !purchasedSeats.includes(seat.id)) return; // Can't select already taken seats
    setSelectedSeat(seat);
  };

  const handlePurchase = () => {
    if (!selectedSeat) return;
    setShowCheckout(true);
  };

  const confirmCheckout = () => {
    if (!selectedSeat) return;
    
    // Create new ticket
    const ticketId = `TCK-${Math.floor(10000 + Math.random() * 90000)}B`;
    const finalPrice = hasQuizDiscount ? Number((selectedSeat.price * 0.95).toFixed(2)) : selectedSeat.price;
    const newTicket: Ticket = {
      id: ticketId,
      match: "Match 24 - Group Stage",
      homeTeam: "Brazil",
      awayTeam: "France",
      homeFlag: "https://lh3.googleusercontent.com/aida-public/AB6AXuB__zI4mGg8Bhr40RVBkPLsvTo9iXVYSchIO_sMaFyYqRwhi7Z1AIfk_fwhUVcONWEKFViNQqvwYIf5XNxh0cNBxsewwqNdv-6BhbyNGIKJIFdvjiLa3gLxz4X6d0vo-3E7QYhUxln8IGOMUz2U65Th2YL8u8rTJ_S5LqtUqnKV_xSMC-p99pys8ZcIFlHPXFh2b3rYQjIbmVglIyvEo6XzFwJj70GUbP-jKcdj1_WmGvzSOO5OSC7g",
      awayFlag: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWHbA-mmzXDk3R7PVpRXjCkfu4MuqrkYLkYeGYJSH9JIIzwFJrAfCKnWQ6x8pq4ji5Fx2ESd5ZaOl3Yv5014xGMVULBptDRJfdTT5h66F_Bku6E5uSKr82duL0a7hKR6m0_Et2NjtxyQe1wSfpJTvI9cfPmJ_FpNciq1pNlYqrAiNuUPH0eu5l9nm1AW2Qxt5lY0BarDcvO-GKNk8nUcXelrC0pMARry_YVlASWwZqFsaJUr-JbT41",
      date: "July 20, 2026",
      time: "19:00",
      venue: "MetLife Stadium, New Jersey",
      section: selectedSeat.section,
      row: selectedSeat.row,
      seat: selectedSeat.number.toString(),
      price: finalPrice,
      category: selectedSeat.category,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FIFA2026_${ticketId}_SEC${selectedSeat.section}_ROW${selectedSeat.row}_SEAT${selectedSeat.number}`
    };

    setCheckoutSuccess(true);
    setTimeout(() => {
      onSeatPurchase(newTicket);
      setShowCheckout(false);
      setCheckoutSuccess(false);
      setSelectedSeat(null);
    }, 2000);
  };

  // Helper colors for categories
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "VIP": return "from-[#FFD700] to-[#FFA500]"; // Gold
      case "Category 1": return "from-[#0046A7] to-blue-500"; // FIFA Blue
      case "Category 2": return "from-[#00FF41] to-emerald-500"; // Pitch Green
      case "Category 3": return "from-purple-500 to-pink-500"; // Warm violet
      case "Accessible": return "from-[#00E5FF] to-cyan-500"; // AI Neon
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Seating Top Header */}
      <div className="flex justify-between items-center bg-surface-container/40 backdrop-blur-md px-6 py-4 rounded-xl border border-white/5 shadow-md">
        <h2 className="font-display font-extrabold text-xl tracking-tight uppercase flex items-center gap-2 text-on-surface">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_#00FF41]" />
          Select Seat
        </h2>
        
        <button
          onClick={() => setIs3D(!is3D)}
          className="bg-surface-container border border-white/10 text-xs font-bold text-on-surface hover:text-tertiary px-4 py-2 rounded-lg flex items-center gap-2 duration-200"
          id="toggle-view-button"
        >
          <Eye className="w-4 h-4 text-tertiary" />
          <span>Toggle View: {is3D ? "3D Pitch" : "2D Grid"}</span>
        </button>
      </div>

      {/* Seating Canvas and Controls Container */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Stadium Seating Visual Stage (Interactive map) */}
        <div className="xl:col-span-8 glass-panel rounded-2xl p-6 border border-white/5 relative flex flex-col justify-between min-h-[500px] overflow-hidden">
          
          {/* Seating Map Legend */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-3 text-[10px] bg-surface-container-lowest/80 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="font-bold text-on-surface-variant">VIP ($450)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="font-bold text-on-surface-variant">Cat 1 ($250)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF41]" />
              <span className="font-bold text-on-surface-variant">Cat 2 ($180)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="font-bold text-on-surface-variant">Cat 3 ($120)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="font-bold text-on-surface-variant">Acc ($150)</span>
            </div>
          </div>

          {/* Floating Radar Mini-Map */}
          <div className="absolute top-4 right-4 z-20 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center w-36 select-none" id="radar-minimap">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
              <span className="text-[9px] font-mono font-extrabold tracking-wider text-on-surface-variant uppercase">Radar Mini-Map</span>
            </div>
            
            <svg viewBox="0 0 120 100" className="w-28 h-24 mt-1">
              {/* Green field inside */}
              <rect x="45" y="38" width="30" height="24" rx="2.5" fill="#10B981" fillOpacity="0.12" stroke="#10B981" strokeWidth="0.75" strokeOpacity="0.3" />
              <line x1="60" y1="38" x2="60" y2="62" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.3" />
              <circle cx="60" cy="50" r="3.5" fill="none" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.3" />
              
              {/* Interactive Segments */}
              {[
                { name: "112", cat: "Category 1", d: "M 40,22 Q 60,16 80,22 L 76,29 Q 60,25 44,29 Z", activeColor: "#3b82f6", defaultColor: "rgba(59, 130, 246, 0.2)" },
                { name: "101", cat: "VIP", d: "M 40,78 Q 60,84 80,78 L 76,71 Q 60,75 44,71 Z", activeColor: "#facc15", defaultColor: "rgba(250, 204, 21, 0.2)" },
                { name: "108", cat: "Category 1", d: "M 98,36 Q 104,50 98,64 L 91,60 Q 95,50 91,40 Z", activeColor: "#3b82f6", defaultColor: "rgba(59, 130, 246, 0.2)" },
                { name: "110-A", cat: "Accessible", d: "M 22,36 Q 16,50 22,64 L 29,60 Q 25,50 29,40 Z", activeColor: "#22d3ee", defaultColor: "rgba(34, 211, 238, 0.2)" },
                { name: "215", cat: "Category 2", d: "M 83,23 Q 92,29 97,35 L 90,41 Q 86,36 80,31 Z", activeColor: "#34d399", defaultColor: "rgba(52, 211, 153, 0.2)" },
                { name: "204", cat: "Category 2", d: "M 97,65 Q 92,71 83,77 L 80,69 Q 86,64 90,59 Z", activeColor: "#34d399", defaultColor: "rgba(52, 211, 153, 0.2)" },
                { name: "318", cat: "Category 3", d: "M 23,35 Q 28,29 37,23 L 40,31 Q 34,36 30,41 Z", activeColor: "#a855f7", defaultColor: "rgba(168, 85, 247, 0.2)" },
                { name: "302", cat: "Category 3", d: "M 37,77 Q 28,71 23,65 L 30,59 Q 34,64 40,69 Z", activeColor: "#a855f7", defaultColor: "rgba(168, 85, 247, 0.2)" }
              ].map(sec => {
                const isSelected = selectedSeat?.section === sec.name;
                return (
                  <path
                    key={sec.name}
                    d={sec.d}
                    fill={isSelected ? sec.activeColor : sec.defaultColor}
                    fillOpacity={isSelected ? 0.95 : 0.35}
                    stroke={isSelected ? "#ffffff" : sec.activeColor}
                    strokeWidth={isSelected ? 1.25 : 0.75}
                    className="cursor-pointer transition-all duration-300 hover:fill-opacity-80"
                    onClick={() => handleMiniMapSectionClick(sec.name)}
                  >
                    <title>{`Sec ${sec.name} (${sec.cat}) - Click to inspect`}</title>
                  </path>
                );
              })}
            </svg>
            
            <div className="mt-1 text-center font-mono">
              <span className="text-[8px] uppercase font-bold text-on-surface-variant/50 block">Focus Area</span>
              <span className={`text-[10px] font-bold tracking-tight block ${selectedSeat ? "text-indigo-400" : "text-on-surface-variant/60"}`}>
                {selectedSeat ? `Section ${selectedSeat.section}` : "None Selected"}
              </span>
            </div>
          </div>

          {/* Stadium Virtual Arena */}
          <div className="relative w-full flex-1 flex items-center justify-center py-10 min-h-[420px]">
            
            {/* 3D / 2D Perspective Frame */}
            <div 
              className="relative w-full max-w-[620px] aspect-[4/3] transition-all duration-300 ease-out"
              style={
                is3D 
                  ? {
                      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(0deg) rotateZ(${rotateZ}deg) scale(${zoomScale})`,
                      transformStyle: "preserve-3d"
                    } 
                  : { transform: "none" }
              }
            >
              {/* Outer Stadium Glow & Boundary */}
              <div className="absolute inset-0 border border-dashed border-white/5 rounded-full stadium-pulse scale-105" />

              {/* Soccer Field Pitch in the center - mathematically aligned at top-[35%] with seats */}
              <div 
                className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-emerald-950/80 rounded-lg border-2 border-emerald-400/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.15)] overflow-hidden"
                style={is3D ? { transform: "translateZ(-15px) translate(-50%, -50%)" } : {}}
              >
                {/* Field markings */}
                <div className="absolute left-0 top-0 bottom-0 w-1/2 border-r border-emerald-400/20" />
                <div className="w-12 h-12 rounded-full border border-emerald-400/20 absolute" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 absolute" />
                <div className="w-6 h-10 border border-emerald-400/20 absolute left-0 top-1/2 -translate-y-1/2 border-l-0" />
                <div className="w-6 h-10 border border-emerald-400/20 absolute right-0 top-1/2 -translate-y-1/2 border-r-0" />
                
                {/* Live Pitch Labels */}
                <div className="absolute text-[8px] font-mono text-emerald-400/30 uppercase tracking-widest flex justify-between w-full px-4 select-none">
                  <span>BRA</span>
                  <span>FRA</span>
                </div>
              </div>

              {/* Render Stadium Seats */}
              {filteredSeats.map((seat) => {
                const isSelected = selectedSeat?.id === seat.id;
                
                // Color mapping based on seat category and state
                let seatColor = "bg-gray-700";
                
                if (isSelected) {
                  seatColor = "bg-white ring-4 ring-tertiary scale-150 animate-pulse z-50 shadow-[0_0_15px_#00E5FF]";
                } else if (!seat.isHighlighted) {
                  // Not matching active filters: highly dimmed
                  seatColor = seat.isAvailable 
                    ? "bg-gray-600/20 opacity-10" 
                    : "bg-red-500/10 opacity-5 cursor-not-allowed";
                } else {
                  // Matching active filters
                  if (!seat.isAvailable) {
                    // Highlighted sold-out seat
                    seatColor = "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)] cursor-not-allowed opacity-80";
                  } else {
                    switch (seat.category) {
                      case "VIP": seatColor = "bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.4)]"; break;
                      case "Category 1": seatColor = "bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.4)]"; break;
                      case "Category 2": seatColor = "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.4)]"; break;
                      case "Category 3": seatColor = "bg-purple-500 shadow-[0_0_4px_rgba(168,85,247,0.4)]"; break;
                      case "Accessible": seatColor = "bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.4)]"; break;
                    }
                  }
                }

                return (
                  <motion.button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={!seat.isAvailable && !purchasedSeats.includes(seat.id)}
                    whileHover={seat.isAvailable ? {
                      scale: 1.35,
                      boxShadow: "0px 0px 8px rgba(99, 102, 241, 0.8)",
                      zIndex: 30
                    } : {}}
                    animate={{
                      scale: isSelected ? 1.45 : 1,
                      boxShadow: isSelected 
                        ? "0px 0px 12px #6366f1" 
                        : "0px 0px 0px rgba(0,0,0,0)"
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                    className={`absolute w-3.5 h-3.5 rounded-sm outline-none cursor-pointer ${seatColor}`}
                    style={{
                      left: `${seat.x}%`,
                      top: `${seat.y}%`,
                      transform: is3D 
                        ? `translateZ(${seat.z * zHeight}px)` 
                        : "none"
                    }}
                    title={`Sec ${seat.section} Row ${seat.row} Seat ${seat.number} - $${seat.price}`}
                  />
                );
              })}
            </div>

            {/* Floating Interactive 3D HUD Controller Overlay (Visible only in 3D Mode) */}
            {is3D && (
              <div className="absolute bottom-4 right-4 z-20 bg-slate-950/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl w-60 text-xs space-y-3 font-sans">
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="font-bold text-indigo-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    3D Perspective HUD
                  </span>
                  <button 
                    onClick={() => {
                      setRotateX(48);
                      setRotateZ(-10);
                      setZoomScale(0.95);
                      setZHeight(5);
                    }}
                    className="text-[9px] text-on-surface-variant hover:text-indigo-400 font-mono transition bg-white/5 px-1.5 py-0.5 rounded border border-white/5"
                  >
                    Reset
                  </button>
                </div>
                
                {/* Sliders */}
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between font-mono text-[9px] text-on-surface-variant mb-1">
                      <span>Tilt Angle (X)</span>
                      <span className="text-indigo-400 font-bold">{rotateX}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="15" 
                      max="75" 
                      value={rotateX} 
                      onChange={(e) => setRotateX(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-[9px] text-on-surface-variant mb-1">
                      <span>Orbit Rotation (Z)</span>
                      <span className="text-indigo-400 font-bold">{rotateZ}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="-180" 
                      max="180" 
                      value={rotateZ} 
                      onChange={(e) => setRotateZ(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-[9px] text-on-surface-variant mb-1">
                      <span>Field Zoom (Scale)</span>
                      <span className="text-indigo-400 font-bold">{zoomScale.toFixed(2)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="1.5" 
                      step="0.05"
                      value={zoomScale} 
                      onChange={(e) => setZoomScale(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-[9px] text-on-surface-variant mb-1">
                      <span>3D Elevation Extrusion</span>
                      <span className="text-indigo-400 font-bold">{zHeight}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="15" 
                      value={zHeight} 
                      onChange={(e) => setZHeight(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Presets */}
                <div className="pt-2 border-t border-white/5">
                  <div className="text-[9px] font-mono font-bold text-on-surface-variant/60 uppercase mb-1.5">Preset Camera Nodes</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button 
                      onClick={() => { setRotateX(60); setRotateZ(0); setZoomScale(0.95); setZHeight(5); }}
                      className="px-2 py-1 bg-white/5 hover:bg-indigo-500/15 hover:text-indigo-300 rounded text-[9px] text-left transition border border-white/5 cursor-pointer"
                    >
                      📺 Sideline TV
                    </button>
                    <button 
                      onClick={() => { setRotateX(55); setRotateZ(-90); setZoomScale(1.1); setZHeight(6); }}
                      className="px-2 py-1 bg-white/5 hover:bg-indigo-500/15 hover:text-indigo-300 rounded text-[9px] text-left transition border border-white/5 cursor-pointer"
                    >
                      🥅 Behind Goal
                    </button>
                    <button 
                      onClick={() => { setRotateX(15); setRotateZ(0); setZoomScale(0.85); setZHeight(2); }}
                      className="px-2 py-1 bg-white/5 hover:bg-indigo-500/15 hover:text-indigo-300 rounded text-[9px] text-left transition border border-white/5 cursor-pointer"
                    >
                      🦅 Tactical top
                    </button>
                    <button 
                      onClick={() => { setRotateX(68); setRotateZ(-45); setZoomScale(1.0); setZHeight(8); }}
                      className="px-2 py-1 bg-white/5 hover:bg-indigo-500/15 hover:text-indigo-300 rounded text-[9px] text-left transition border border-white/5 cursor-pointer"
                    >
                      🎙️ Executive
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Arena Info */}
          <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-on-surface-variant bg-surface-container-lowest/60 p-4 rounded-xl border border-white/5">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-tertiary" />
              <span>Rotate view to see accurate altitude and sightline details.</span>
            </span>
            <div className="flex gap-4">
              <span>🏟️ Capacity: 82,500</span>
              <span>🌡️ Air Temp: 22°C</span>
            </div>
          </div>
        </div>

        {/* Filters and Selection Sidebar */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Filters Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Filter className="w-4 h-4 text-tertiary" />
              <h3 className="font-display font-bold text-sm uppercase tracking-wide text-on-surface">Filters</h3>
            </div>
            
            {/* Availability Toggle Segment Control */}
            <div className="flex flex-col gap-2 pb-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-on-surface-variant/70 uppercase">
                Seat Availability
              </span>
              <div className="grid grid-cols-3 bg-slate-950/80 p-1 rounded-xl border border-white/5" id="availability-filter-group">
                <button
                  onClick={() => setAvailabilityFilter('all')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                    availabilityFilter === 'all'
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                  }`}
                  id="availability-filter-all"
                >
                  All Seats
                </button>
                <button
                  onClick={() => setAvailabilityFilter('available')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    availabilityFilter === 'available'
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                  }`}
                  id="availability-filter-available"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Available
                </button>
                <button
                  onClick={() => setAvailabilityFilter('soldout')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    availabilityFilter === 'soldout'
                      ? "bg-red-600/90 text-white shadow-md shadow-red-600/20"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                  }`}
                  id="availability-filter-soldout"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Sold Out
                </button>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3">
              <span className="text-[10px] font-mono font-bold tracking-wider text-on-surface-variant/70 uppercase block mb-2">
                Additional Criteria
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setFilterUnder200(!filterUnder200)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                    filterUnder200
                      ? "bg-tertiary/10 border-tertiary text-tertiary"
                      : "bg-surface-container/50 border-white/10 text-on-surface hover:bg-white/5"
                  }`}
                  id="filter-under-200-button"
                >
                  <span>$ Under $200</span>
                  {filterUnder200 && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setFilterAccessible(!filterAccessible)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                    filterAccessible
                      ? "bg-tertiary/10 border-tertiary text-tertiary"
                      : "bg-surface-container/50 border-white/10 text-on-surface hover:bg-white/5"
                  }`}
                  id="filter-accessible-button"
                >
                  <span>♿ Accessible</span>
                  {filterAccessible && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setFilterShaded(!filterShaded)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                    filterShaded
                      ? "bg-tertiary/10 border-tertiary text-tertiary"
                      : "bg-surface-container/50 border-white/10 text-on-surface hover:bg-white/5"
                  }`}
                  id="filter-shaded-button"
                >
                  <span>☀️ Shaded</span>
                  {filterShaded && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Seat Opening Alerts Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4 relative overflow-hidden" id="availability-alerts-card">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Bell className="w-4 h-4 text-indigo-400" />
              <h3 className="font-display font-bold text-sm uppercase tracking-wide text-on-surface">Seat Opening Alerts</h3>
            </div>
            
            <p className="text-xs text-on-surface-variant/80 leading-relaxed">
              Enable alert monitors for specific sections. We will monitor the ticketing pool and notify you instantly if a sold-out seat becomes available!
            </p>

            <div className="grid grid-cols-2 gap-2">
              {["101", "112", "108", "110-A", "215", "204", "318", "302"].map(sec => {
                const hasAlert = sectionAlerts.includes(sec);
                return (
                  <button
                    key={sec}
                    onClick={() => {
                      if (hasAlert) {
                        setSectionAlerts(prev => prev.filter(s => s !== sec));
                        onTriggerAlert?.(`🔔 Alerts disabled for Section ${sec}`, "info");
                      } else {
                        setSectionAlerts(prev => [...prev, sec]);
                        onTriggerAlert?.(`🔔 Active alert setup for Section ${sec}! We will notify you if seats open up.`, "success");
                      }
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition duration-150 flex items-center justify-between cursor-pointer ${
                      hasAlert
                        ? "bg-indigo-500/15 border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                        : "bg-surface-container-low/40 border-white/5 hover:border-white/10 hover:bg-white/5 text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span>Sec {sec}</span>
                    {hasAlert ? (
                      <Bell className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
                    ) : (
                      <BellOff className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/5 mt-1">
              <button
                onClick={() => {
                  if (sectionAlerts.length === 0) {
                    onTriggerAlert?.("⚠️ Please activate a section alert above first!", "info");
                    return;
                  }
                  
                  // Pick a random alerted section
                  const randomSec = sectionAlerts[Math.floor(Math.random() * sectionAlerts.length)];
                  
                  // Find currently sold-out seats in this section
                  const sectionSeats = SEATS.filter(s => s.section === randomSec);
                  const soldOutSeatsInSec = sectionSeats.filter(
                    s => !s.isAvailable && !purchasedSeats.includes(s.id) && !releasedSeats.includes(s.id)
                  );
                  
                  if (soldOutSeatsInSec.length === 0) {
                    onTriggerAlert?.(`All seats in Section ${randomSec} are already available or purchased!`, "info");
                    return;
                  }
                  
                  // Release a random sold-out seat in that section
                  const seatToRelease = soldOutSeatsInSec[Math.floor(Math.random() * soldOutSeatsInSec.length)];
                  setReleasedSeats(prev => [...prev, seatToRelease.id]);
                  
                  // Dispatch notification
                  onTriggerAlert?.(
                    `🎉 LIVE TICKET ALERT: Seat ${seatToRelease.number} (Row ${seatToRelease.row}) in Section ${randomSec} has just opened up! Reserve it immediately.`,
                    "success"
                  );
                }}
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-indigo-600 border border-indigo-500/25 hover:border-indigo-500 hover:text-white text-indigo-300 text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simulate Seat Release</span>
              </button>
            </div>
          </div>

          {/* Selection & Checkout Info Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-tertiary/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-on-surface-variant/60 uppercase block mb-1">
                  Selected Seat
                </span>
                <h3 className="font-display font-extrabold text-3xl text-on-surface tracking-tight">
                  {selectedSeat 
                    ? `Sec ${selectedSeat.section}, Row ${selectedSeat.row}` 
                    : "Select a Seat"
                  }
                </h3>
                {selectedSeat && (
                  <span className="text-xs font-bold text-tertiary mt-1 block">
                    Seat Number: {selectedSeat.number} ({selectedSeat.category})
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-on-surface-variant/60 uppercase block mb-1">
                  Price
                </span>
                <h4 className="font-display font-extrabold text-4xl text-secondary">
                  {selectedSeat ? `$${selectedSeat.price}` : "—"}
                </h4>
              </div>

              {/* AI insight container */}
              <div className="bg-surface-container-low/80 border border-tertiary/10 rounded-xl p-4 flex gap-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-tertiary" />
                <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0 text-tertiary animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-tertiary block mb-1">
                    AI Insight
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {selectedSeat 
                      ? selectedSeat.aiInsight 
                      : "Interact with the 3D map to see real-time AI seating insights, elevation parameters, and shadow forecasts."
                    }
                  </p>
                </div>
              </div>

              {/* 3D Seat Panoramic Previewer (Three.js) */}
              <SeatPanoramicPreview seat={selectedSeat} />

              {/* Smart Recommendations Section */}
              <div className="pt-3 border-t border-white/5 space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-secondary animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-on-surface-variant/65 uppercase block">
                    AI Suggested Seats
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* VIP Recommendation */}
                  <button
                    onClick={() => {
                      if (suggestedVip) {
                        setSelectedSeat(suggestedVip);
                        setRotateX(55);
                        setRotateZ(-10);
                      }
                    }}
                    className={`p-2 rounded-xl border text-left duration-200 cursor-pointer flex flex-col justify-between min-h-[58px] ${
                      selectedSeat?.id === suggestedVip?.id
                        ? "bg-yellow-500/15 border-yellow-500 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.2)]"
                        : "bg-surface-container-low/40 border-white/5 hover:border-white/10 hover:bg-white/5 text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="text-[9px] font-extrabold uppercase tracking-wide truncate">👑 Elite VIP</span>
                    <span className="text-xs font-mono font-extrabold mt-0.5">
                      {suggestedVip ? `Sec ${suggestedVip.section}` : "N/A"}
                    </span>
                    <span className="text-[9px] font-mono opacity-80 block">
                      {suggestedVip ? `$${suggestedVip.price}` : ""}
                    </span>
                  </button>

                  {/* Value Recommendation */}
                  <button
                    onClick={() => {
                      if (suggestedValue) {
                        setSelectedSeat(suggestedValue);
                        setRotateX(60);
                        setRotateZ(-45);
                      }
                    }}
                    className={`p-2 rounded-xl border text-left duration-200 cursor-pointer flex flex-col justify-between min-h-[58px] ${
                      selectedSeat?.id === suggestedValue?.id
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.2)]"
                        : "bg-surface-container-low/40 border-white/5 hover:border-white/10 hover:bg-white/5 text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="text-[9px] font-extrabold uppercase tracking-wide truncate">🎯 Best View</span>
                    <span className="text-xs font-mono font-extrabold mt-0.5">
                      {suggestedValue ? `Sec ${suggestedValue.section}` : "N/A"}
                    </span>
                    <span className="text-[9px] font-mono opacity-80 block">
                      {suggestedValue ? `$${suggestedValue.price}` : ""}
                    </span>
                  </button>

                  {/* Budget Recommendation */}
                  <button
                    onClick={() => {
                      if (suggestedBudget) {
                        setSelectedSeat(suggestedBudget);
                        setRotateX(45);
                        setRotateZ(90);
                      }
                    }}
                    className={`p-2 rounded-xl border text-left duration-200 cursor-pointer flex flex-col justify-between min-h-[58px] ${
                      selectedSeat?.id === suggestedBudget?.id
                        ? "bg-purple-500/15 border-purple-500 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.2)]"
                        : "bg-surface-container-low/40 border-white/5 hover:border-white/10 hover:bg-white/5 text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="text-[9px] font-extrabold uppercase tracking-wide truncate">🔥 Fan Zone</span>
                    <span className="text-xs font-mono font-extrabold mt-0.5">
                      {suggestedBudget ? `Sec ${suggestedBudget.section}` : "N/A"}
                    </span>
                    <span className="text-[9px] font-mono opacity-80 block">
                      {suggestedBudget ? `$${suggestedBudget.price}` : ""}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={!selectedSeat}
              className={`w-full py-4 px-6 rounded-xl font-display font-bold text-sm tracking-wide uppercase transition-all duration-300 mt-6 flex items-center justify-center gap-2 ${
                selectedSeat
                  ? "bg-gradient-to-r from-primary to-tertiary text-on-primary hover:translate-y-[-1px] active:translate-y-[1px] neon-glow-primary cursor-pointer"
                  : "bg-surface-container border border-white/5 text-on-surface-variant/30 cursor-not-allowed"
              }`}
            >
              <span>{selectedSeat ? "Reserve Seat" : "Please Select Seat"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* FIFA Trivia Quiz Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col gap-4 mt-6" id="fifa-trivia-quiz-card">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setQuizOpen(!quizOpen)}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Trophy className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                    🏆 FIFA Trivia Challenge
                  </h3>
                  <p className="text-[10px] text-on-surface-variant font-medium">
                    Answer 3+ questions right to unlock 5% ticket discount!
                  </p>
                </div>
              </div>
              <button className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                {quizOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {quizOpen && (
              <div className="pt-2 border-t border-white/5 flex flex-col gap-4">
                {quizState === "idle" && (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Prove your World Cup wisdom! Take our 5-question stadium challenge and instantly unlock a <strong>5% Smart Fan Discount</strong> applicable directly on your ticket checkout.
                    </p>
                    <button
                      onClick={() => {
                        setQuizState("question");
                        setQuizQuestionIdx(0);
                        setQuizSelectedAnswer(null);
                        setQuizScore(0);
                        setQuizShowFact(false);
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition duration-200 cursor-pointer shadow-md shadow-indigo-600/10 uppercase tracking-wider"
                    >
                      Start Challenge
                    </button>
                  </div>
                )}

                {quizState === "question" && (
                  <div className="space-y-4">
                    {/* Progress */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-on-surface-variant">
                      <span>QUESTION {quizQuestionIdx + 1} OF 5</span>
                      <span className="text-indigo-400 font-bold">Score: {quizScore}</span>
                    </div>

                    {/* Question text */}
                    <h4 className="text-xs font-bold text-on-surface leading-snug">
                      {QUIZ_QUESTIONS[quizQuestionIdx].question}
                    </h4>

                    {/* Options */}
                    <div className="flex flex-col gap-2">
                      {QUIZ_QUESTIONS[quizQuestionIdx].options.map((opt, oIdx) => {
                        return (
                          <button
                            key={oIdx}
                            onClick={() => setQuizSelectedAnswer(oIdx)}
                            className={`w-full p-2.5 text-left text-xs rounded-xl border transition-all duration-150 cursor-pointer font-medium ${
                              quizSelectedAnswer === oIdx
                                ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                                : "bg-slate-950/40 border-white/5 hover:bg-white/5 text-on-surface-variant hover:text-on-surface"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Action */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          if (quizSelectedAnswer === null) return;
                          
                          const isCorrect = quizSelectedAnswer === QUIZ_QUESTIONS[quizQuestionIdx].correct;
                          if (isCorrect) {
                            setQuizScore(prev => prev + 1);
                          }
                          setQuizState("feedback");
                        }}
                        disabled={quizSelectedAnswer === null}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition uppercase tracking-wider ${
                          quizSelectedAnswer === null
                            ? "bg-white/5 text-on-surface-variant/40 cursor-not-allowed"
                            : "bg-indigo-600 text-white cursor-pointer hover:bg-indigo-500"
                        }`}
                      >
                        Submit Answer
                      </button>
                    </div>
                  </div>
                )}

                {quizState === "feedback" && (
                  <div className="space-y-4">
                    {/* Status header */}
                    <div className="flex items-center gap-2">
                      {quizSelectedAnswer === QUIZ_QUESTIONS[quizQuestionIdx].correct ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                          <CheckCircle className="w-4 h-4" />
                          <span>Correct Answer!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                          <span className="w-4 h-4 rounded-full bg-red-400/20 flex items-center justify-center text-[10px] font-bold">✕</span>
                          <span>Incorrect Answer</span>
                        </div>
                      )}
                    </div>

                    {/* Show what the user selected and the correct answer */}
                    <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 text-xs text-on-surface-variant">
                      <p className="mb-1">
                        Your answer: <span className="text-on-surface font-semibold">{QUIZ_QUESTIONS[quizQuestionIdx].options[quizSelectedAnswer ?? 0]}</span>
                      </p>
                      {quizSelectedAnswer !== QUIZ_QUESTIONS[quizQuestionIdx].correct && (
                        <p>
                          Correct answer: <span className="text-emerald-400 font-semibold">{QUIZ_QUESTIONS[quizQuestionIdx].options[QUIZ_QUESTIONS[quizQuestionIdx].correct]}</span>
                        </p>
                      )}
                    </div>

                    {/* Trivia Fact */}
                    <div className="bg-indigo-950/25 border border-indigo-500/10 p-3.5 rounded-xl">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                        Did you know?
                      </span>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        {QUIZ_QUESTIONS[quizQuestionIdx].fact}
                      </p>
                    </div>

                    {/* Next Question / Finish Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          if (quizQuestionIdx < QUIZ_QUESTIONS.length - 1) {
                            setQuizQuestionIdx(prev => prev + 1);
                            setQuizSelectedAnswer(null);
                            setQuizState("question");
                          } else {
                            setQuizState("completed");
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition uppercase tracking-wider cursor-pointer"
                      >
                        {quizQuestionIdx < QUIZ_QUESTIONS.length - 1 ? "Next Question" : "Finish Quiz"}
                      </button>
                    </div>
                  </div>
                )}

                {quizState === "completed" && (
                  <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400">
                      <Trophy className="w-8 h-8" />
                    </div>
                    
                    <div>
                      <h4 className="font-display font-extrabold text-lg text-on-surface">
                        Trivia Finished!
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-1">
                        You scored <span className="text-indigo-400 font-bold text-sm">{quizScore} out of 5</span> correct answers.
                      </p>
                    </div>

                    {quizScore >= 3 ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-1.5 shadow-lg shadow-emerald-500/5">
                        <span className="text-xs font-bold text-emerald-400 block">🎉 5% Smart Fan Discount Unlocked!</span>
                        <p className="text-[10px] text-on-surface-variant leading-relaxed">
                          Your World Cup excellence earned you a discount. We've applied it directly to all seat prices on your checkout!
                        </p>
                      </div>
                    ) : (
                      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl space-y-1.5">
                        <span className="text-xs font-bold text-red-400 block">Close, but not quite!</span>
                        <p className="text-[10px] text-on-surface-variant leading-relaxed">
                          You need at least 3 correct answers to unlock the discount. Give it another shot!
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 justify-center pt-2">
                      <button
                        onClick={() => {
                          setQuizState("question");
                          setQuizQuestionIdx(0);
                          setQuizSelectedAnswer(null);
                          setQuizScore(0);
                          setQuizShowFact(false);
                        }}
                        className="px-4 py-2 bg-surface-container hover:bg-white/5 border border-white/10 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Retry Challenge</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Summary Modal */}
      {showCheckout && selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md" onClick={() => !checkoutSuccess && setShowCheckout(false)} />
          
          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-md glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {checkoutSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary mb-2 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-on-surface">Reservation Confirmed!</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Your ticket for <span className="text-secondary font-bold">Sec {selectedSeat.section}, Row {selectedSeat.row}, Seat {selectedSeat.number}</span> has been booked successfully.
                </p>
                <div className="text-[10px] font-mono text-on-surface-variant/50 pt-4">
                  Redirecting to your wallet...
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-on-surface">Confirm Seating Reservation</h3>
                    <p className="text-xs text-on-surface-variant">Match 24: Brazil vs France</p>
                  </div>
                  <span className="text-xs font-mono bg-surface-container px-2.5 py-1 rounded-md text-tertiary">
                    {selectedSeat.category}
                  </span>
                </div>

                {/* Ticket Seat Summary */}
                <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center justify-between border border-white/5">
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant/60 block uppercase">Section</span>
                    <span className="font-display font-extrabold text-xl text-on-surface">{selectedSeat.section}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant/60 block uppercase">Row</span>
                    <span className="font-display font-extrabold text-xl text-on-surface">{selectedSeat.row}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant/60 block uppercase">Seat</span>
                    <span className="font-display font-extrabold text-xl text-on-surface">{selectedSeat.number}</span>
                  </div>
                </div>

                {/* Costs Detail */}
                <div className="space-y-3 font-mono text-xs text-on-surface-variant border-b border-white/5 pb-4">
                  <div className="flex justify-between">
                    <span>Base Ticket Fare</span>
                    <span className="text-on-surface font-semibold">${selectedSeat.price.toFixed(2)}</span>
                  </div>
                  {hasQuizDiscount && (
                    <div className="flex justify-between text-emerald-400">
                      <span>🏆 Smart Fan Discount (5%)</span>
                      <span className="font-semibold">-${(selectedSeat.price * 0.05).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>AI Environmental Seating Fee</span>
                    <span className="text-tertiary font-semibold">$5.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stadium VAT & Security Tax (8%)</span>
                    <span className="text-on-surface font-semibold">
                      ${((hasQuizDiscount ? selectedSeat.price * 0.95 : selectedSeat.price) * 0.08).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-sm text-on-surface">Total Amount Due</span>
                  <span className="font-display font-extrabold text-2xl text-secondary">
                    ${((hasQuizDiscount ? selectedSeat.price * 0.95 : selectedSeat.price) * 1.08 + 5).toFixed(2)}
                  </span>
                </div>

                {/* Pay buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 font-bold text-xs text-on-surface transition-all uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmCheckout}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-tertiary font-bold text-xs text-on-primary hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Securely</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
