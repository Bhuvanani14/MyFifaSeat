import React, { useState } from "react";
import { Calendar, Clock, MapPin, Search, Trophy, Sparkles, Ticket, ChevronRight, Filter } from "lucide-react";
import { motion } from "motion/react";

interface Match {
  id: string;
  matchNumber: number;
  stage: string;
  date: string;
  time: string;
  stadium: string;
  city: string;
  teamA: { name: string; flag: string; code: string };
  teamB: { name: string; flag: string; code: string };
  isPopular?: boolean;
}

const MATCHES_DATA: Match[] = [
  {
    id: "m-1",
    matchNumber: 1,
    stage: "Opening Match (Group A)",
    date: "June 11, 2026",
    time: "17:00 Local",
    stadium: "Estadio Azteca",
    city: "Mexico City, Mexico",
    teamA: { name: "Mexico", flag: "🇲🇽", code: "MEX" },
    teamB: { name: "Group A Opponent", flag: "🌍", code: "TBD" },
    isPopular: true
  },
  {
    id: "m-2",
    matchNumber: 2,
    stage: "Group Stage (Group B)",
    date: "June 12, 2026",
    time: "19:00 Local",
    stadium: "SoFi Stadium",
    city: "Los Angeles, USA",
    teamA: { name: "United States", flag: "🇺🇸", code: "USA" },
    teamB: { name: "Group B Opponent", flag: "🌍", code: "TBD" },
    isPopular: true
  },
  {
    id: "m-24",
    matchNumber: 24,
    stage: "Group Stage (Group C)",
    date: "June 18, 2026",
    time: "20:00 Local",
    stadium: "MetLife Stadium",
    city: "East Rutherford, NJ/NY",
    teamA: { name: "Argentina", flag: "🇦🇷", code: "ARG" },
    teamB: { name: "Netherlands", flag: "🇳🇱", code: "NED" },
    isPopular: true
  },
  {
    id: "m-50",
    matchNumber: 50,
    stage: "Round of 32",
    date: "June 27, 2026",
    time: "18:00 Local",
    stadium: "BC Place",
    city: "Vancouver, Canada",
    teamA: { name: "Group C Winner", flag: "🏆", code: "W-C" },
    teamB: { name: "Group D Runner-up", flag: "🏃", code: "RU-D" }
  },
  {
    id: "m-86",
    matchNumber: 86,
    stage: "Round of 16",
    date: "July 2, 2026",
    time: "15:00 Local",
    stadium: "AT&T Stadium",
    city: "Dallas, USA",
    teamA: { name: "Round of 32 Winner 1", flag: "⚽", code: "W-32" },
    teamB: { name: "Round of 32 Winner 2", flag: "⚽", code: "W-32" }
  },
  {
    id: "m-101",
    matchNumber: 101,
    stage: "Quarterfinal",
    date: "July 9, 2026",
    time: "19:00 Local",
    stadium: "Gillette Stadium",
    city: "Boston, USA",
    teamA: { name: "Round of 16 Winner 5", flag: "⭐", code: "W-16" },
    teamB: { name: "Round of 16 Winner 6", flag: "⭐", code: "W-16" },
    isPopular: true
  },
  {
    id: "m-102",
    matchNumber: 102,
    stage: "Semifinal",
    date: "July 14, 2026",
    time: "20:00 Local",
    stadium: "Mercedes-Benz Stadium",
    city: "Atlanta, USA",
    teamA: { name: "Quarterfinal Winner 1", flag: "🥇", code: "W-QF" },
    teamB: { name: "Quarterfinal Winner 2", flag: "🥇", code: "W-QF" },
    isPopular: true
  },
  {
    id: "m-104",
    matchNumber: 104,
    stage: "FIFA World Cup Final",
    date: "July 19, 2026",
    time: "16:00 Local",
    stadium: "MetLife Stadium",
    city: "East Rutherford, NJ/NY",
    teamA: { name: "Semifinal Winner 1", flag: "👑", code: "FINAList 1" },
    teamB: { name: "Semifinal Winner 2", flag: "👑", code: "FINAList 2" },
    isPopular: true
  }
];

interface MatchScheduleViewProps {
  onSelectStadium: () => void;
}

export default function MatchScheduleView({ onSelectStadium }: MatchScheduleViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");

  const stages = ["All", "Group Stage", "Knockouts", "Popular Matches"];

  const filteredMatches = MATCHES_DATA.filter(match => {
    // Stage Filter
    if (selectedStage === "Group Stage" && !match.stage.includes("Group")) return false;
    if (selectedStage === "Knockouts" && match.stage.includes("Group")) return false;
    if (selectedStage === "Popular Matches" && !match.isPopular) return false;

    // Search Query (Stadium, City, Teams)
    const q = searchQuery.toLowerCase();
    return (
      match.stadium.toLowerCase().includes(q) ||
      match.city.toLowerCase().includes(q) ||
      match.stage.toLowerCase().includes(q) ||
      match.teamA.name.toLowerCase().includes(q) ||
      match.teamB.name.toLowerCase().includes(q) ||
      match.teamA.code.toLowerCase().includes(q) ||
      match.teamB.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-high border border-white/5 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 font-mono text-[10px] font-extrabold uppercase tracking-widest animate-pulse">
            <Trophy className="w-3.5 h-3.5" />
            <span>Official Schedule</span>
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-on-surface tracking-tight uppercase">
            FIFA World Cup 2026 Matches
          </h2>
          <p className="text-xs md:text-sm text-on-surface-variant font-medium max-w-xl">
            Stay ahead of the game. Track group stages, historic knockouts, and plan your stadium journey with our instant seat locator system.
          </p>
        </div>
        <button
          onClick={onSelectStadium}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-3 bg-secondary hover:bg-secondary/95 text-on-secondary text-xs font-bold font-display rounded-2xl transition duration-200 cursor-pointer shadow-lg shadow-secondary/10 uppercase tracking-wider"
        >
          <Ticket className="w-4 h-4" />
          <span>Book Tickets Now</span>
        </button>
      </div>

      {/* Interactive Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-stretch md:items-center bg-slate-950/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams, stadiums, or host cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition duration-200"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto gap-1.5 scrollbar-none pb-1 md:pb-0">
          {stages.map(stage => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition duration-150 cursor-pointer ${
                selectedStage === stage
                  ? "bg-indigo-600/15 border border-indigo-500 text-indigo-400"
                  : "bg-white/5 border border-transparent text-on-surface-variant hover:text-on-surface hover:bg-white/10"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match, idx) => {
            const isMetlife = match.stadium === "MetLife Stadium";
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="glass-panel rounded-3xl p-5 border border-white/5 hover:border-white/10 shadow-lg hover:shadow-2xl relative overflow-hidden flex flex-col justify-between group transition-all duration-300"
              >
                {/* Visual Accent/Glow */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br rounded-bl-full pointer-events-none opacity-10 group-hover:opacity-20 transition duration-300 ${
                  isMetlife ? "from-emerald-500" : "from-indigo-500"
                }`} />

                <div>
                  {/* Top Header */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[9px] font-extrabold text-on-surface-variant/60 uppercase tracking-widest">
                      MATCH #{match.matchNumber} • {match.stage}
                    </span>
                    {match.isPopular && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                        <Sparkles className="w-2.5 h-2.5" /> High Demand
                      </span>
                    )}
                  </div>

                  {/* Teams Duel Presentation */}
                  <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 mb-4">
                    {/* Team A */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl leading-none">{match.teamA.flag}</span>
                        <span className="text-xs font-extrabold text-on-surface">{match.teamA.name}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-on-surface-variant bg-white/5 px-2 py-0.5 rounded">
                        {match.teamA.code}
                      </span>
                    </div>

                    {/* Divider VS */}
                    <div className="relative flex items-center justify-center my-0.5">
                      <div className="absolute inset-x-0 h-px bg-white/5" />
                      <span className="relative font-display font-black text-[9px] text-on-surface-variant bg-[#0b0f19] px-2.5 border border-white/5 rounded-full uppercase tracking-wider">
                        VS
                      </span>
                    </div>

                    {/* Team B */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl leading-none">{match.teamB.flag}</span>
                        <span className="text-xs font-extrabold text-on-surface">{match.teamB.name}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-on-surface-variant bg-white/5 px-2 py-0.5 rounded">
                        {match.teamB.code}
                      </span>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="space-y-2 text-[11px] text-on-surface-variant font-medium mb-5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{match.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{match.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate">{match.stadium}, <strong className="text-on-surface">{match.city}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Direct Stadium Booking Connection */}
                <button
                  onClick={onSelectStadium}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 duration-200 cursor-pointer ${
                    isMetlife
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10"
                      : "bg-white/5 hover:bg-white/10 text-on-surface hover:text-white border border-white/5"
                  }`}
                >
                  <span>{isMetlife ? "Explore MetLife Seats" : "Browse Stadium Venue"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-950/20 rounded-3xl border border-white/5 space-y-3">
          <p className="text-sm text-on-surface-variant">No matches matched your search criteria.</p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedStage("All"); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
