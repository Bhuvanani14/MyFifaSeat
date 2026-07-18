import React, { useState } from "react";
import { CROWD_STATS } from "../data";
import { Users, Volume2, Smile, AlertCircle, Sparkles, Map, Clock, Zap } from "lucide-react";

export default function CrowdProfileView() {
  const [activeTab, setActiveTab] = useState<"noise" | "concessions">("noise");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Total Summary values
  const totalAttendance = 81308;
  const averageNoise = 94.5;
  const mainSentiment = "Electric";

  // Demographics split
  const brazilSplit = 58;
  const franceSplit = 32;
  const neutralSplit = 10;

  // Mock cheering feed
  const CHEERS_FEED = [
    { time: "72'", type: "goal", text: "🚨 UNBELIEVABLE ROAR! Section 302 erupts as Brazil takes the lead (2-1). Peak noise reached 112dB!" },
    { time: "68'", type: "song", text: "🎵 France supporters in Section 318 singing 'La Marseillaise' in unison, trying to lift spirits." },
    { time: "61'", type: "tension", text: "🤫 Collective silence across VIP Section 101 as Mbappe warms up on the touchline." },
    { time: "55'", type: "chant", text: "🥁 Yellow Wall in Sector 204 chanting 'Brasil, Olé Olé Olé' non-stop." }
  ];

  // Concessions Wait Times
  const CONCESSIONS = [
    { name: "Arena Draft & Brew", location: "Level 1 Near Sec 108", queue: "Short (2 mins)", waitSec: 120, status: "green" },
    { name: "FIFA Fan Burgers", location: "Level 2 Near Sec 215", queue: "Medium (8 mins)", waitSec: 480, status: "yellow" },
    { name: "Maracanã Taco Express", location: "Level 3 Near Sec 302", queue: "Long (18 mins)", waitSec: 1080, status: "red" },
    { name: "Copacabana Refresh", location: "Level 1 Near Sec 101", queue: "Short (1 min)", waitSec: 60, status: "green" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-container/40 backdrop-blur-md px-6 py-4 rounded-xl border border-white/5 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-xl tracking-tight uppercase flex items-center gap-2 text-on-surface">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_#00FF41]" />
            Crowd Telemetry Profile
          </h2>
          <p className="text-[10px] text-on-surface-variant font-mono mt-0.5 uppercase">Real-time stadium sensor grid diagnostics</p>
        </div>
        
        {/* Toggle selectors */}
        <div className="flex bg-surface-container rounded-xl p-1 border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("noise")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === "noise" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Stadium Sound Map
          </button>
          <button
            onClick={() => setActiveTab("concessions")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === "concessions" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Concession Queues
          </button>
        </div>
      </div>

      {/* Main Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary-light/10 flex items-center justify-center text-primary-light">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/50 block">Current Attendance</span>
            <h3 className="font-display font-extrabold text-2xl text-on-surface">
              {totalAttendance.toLocaleString()} <span className="text-xs text-on-surface-variant font-normal">/ 82.5K</span>
            </h3>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/5 rounded-bl-full pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/10 flex items-center justify-center text-secondary">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/50 block">Average Sound Level</span>
            <h3 className="font-display font-extrabold text-2xl text-on-surface">
              {averageNoise} <span className="text-xs text-on-surface-variant font-normal">decibels</span>
            </h3>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-tertiary/5 rounded-bl-full pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/10 flex items-center justify-center text-tertiary">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/50 block">Overall Mood</span>
            <h3 className="font-display font-extrabold text-2xl text-tertiary uppercase tracking-tight flex items-center gap-2">
              {mainSentiment}
              <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
            </h3>
          </div>
        </div>
      </div>

      {activeTab === "noise" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sound Heatmap & Stadium SVG Representation */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between items-center min-h-[420px] relative overflow-hidden">
            <div className="w-full flex justify-between items-start mb-4">
              <div>
                <h4 className="font-display font-bold text-sm text-on-surface uppercase">Arena Noise Distribution</h4>
                <p className="text-[10px] text-on-surface-variant/70 font-mono">Click sectors below to query zone telemetry</p>
              </div>
              <span className="text-[10px] font-mono bg-error/10 border border-error/20 text-error px-2.5 py-1 rounded-full flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> High Cheer Advisory
              </span>
            </div>

            {/* Stadium Bowl SVG map */}
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center py-6">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-45">
                {/* Stadium pitch center */}
                <rect x="80" y="80" width="40" height="40" rx="3" fill="#134e4a" stroke="#4ade80" strokeWidth="0.5" opacity="0.8" />
                <circle cx="100" cy="100" r="10" fill="none" stroke="#4ade80" strokeWidth="0.5" opacity="0.6" />
                
                {/* VIP Sector 101 (Arc Bottom) */}
                <path
                  d="M 60,100 A 40,40 0 0,1 100,60"
                  fill="none"
                  stroke={selectedSector === "101 (VIP)" ? "#ffffff" : "#FFD700"}
                  strokeWidth={selectedSector === "101 (VIP)" ? "14" : "10"}
                  className="cursor-pointer transition-all duration-200 hover:opacity-90"
                  onClick={() => setSelectedSector("101 (VIP)")}
                  opacity="0.6"
                />
                
                {/* Cat 1 Sector 108 */}
                <path
                  d="M 100,60 A 40,40 0 0,1 140,100"
                  fill="none"
                  stroke={selectedSector === "108 (Cat 1)" ? "#ffffff" : "#3b82f6"}
                  strokeWidth={selectedSector === "108 (Cat 1)" ? "14" : "10"}
                  className="cursor-pointer transition-all duration-200 hover:opacity-90"
                  onClick={() => setSelectedSector("108 (Cat 1)")}
                  opacity="0.8"
                />

                {/* Cat 1 Sector 112 */}
                <path
                  d="M 140,100 A 40,40 0 0,1 100,140"
                  fill="none"
                  stroke={selectedSector === "112 (Cat 1)" ? "#ffffff" : "#3b82f6"}
                  strokeWidth={selectedSector === "112 (Cat 1)" ? "14" : "10"}
                  className="cursor-pointer transition-all duration-200 hover:opacity-90"
                  onClick={() => setSelectedSector("112 (Cat 1)")}
                  opacity="0.85"
                />

                {/* Cat 2 Sector 204 */}
                <path
                  d="M 100,140 A 40,40 0 0,1 60,100"
                  fill="none"
                  stroke={selectedSector === "204 (Cat 2)" ? "#ffffff" : "#10b981"}
                  strokeWidth={selectedSector === "204 (Cat 2)" ? "14" : "10"}
                  className="cursor-pointer transition-all duration-200 hover:opacity-90"
                  onClick={() => setSelectedSector("204 (Cat 2)")}
                  opacity="0.9"
                />

                {/* Cat 2 Sector 215 (Outer Arc top-left) */}
                <path
                  d="M 45,100 A 55,55 0 0,1 100,45"
                  fill="none"
                  stroke={selectedSector === "215 (Cat 2)" ? "#ffffff" : "#10b981"}
                  strokeWidth={selectedSector === "215 (Cat 2)" ? "12" : "8"}
                  className="cursor-pointer transition-all duration-200 hover:opacity-90"
                  onClick={() => setSelectedSector("215 (Cat 2)")}
                  opacity="0.75"
                />

                {/* Cat 3 Sector 302 (Outer Arc top-right - Loudest) */}
                <path
                  d="M 100,45 A 55,55 0 0,1 155,100"
                  fill="none"
                  stroke={selectedSector === "302 (Cat 3)" ? "#ffffff" : "#ec4899"}
                  strokeWidth={selectedSector === "302 (Cat 3)" ? "12" : "8"}
                  className="cursor-pointer transition-all duration-200 hover:opacity-90 hover:stroke-pink-400"
                  onClick={() => setSelectedSector("302 (Cat 3)")}
                  opacity="0.98"
                />

                {/* Cat 3 Sector 318 */}
                <path
                  d="M 155,100 A 55,55 0 0,1 100,155"
                  fill="none"
                  stroke={selectedSector === "318 (Cat 3)" ? "#ffffff" : "#a855f7"}
                  strokeWidth={selectedSector === "318 (Cat 3)" ? "12" : "8"}
                  className="cursor-pointer transition-all duration-200 hover:opacity-90"
                  onClick={() => setSelectedSector("318 (Cat 3)")}
                  opacity="0.95"
                />
              </svg>

              {/* Legend Helper */}
              <div className="absolute bottom-2 right-2 text-[9px] font-mono text-on-surface-variant/40 bg-surface-container-lowest px-2 py-1 rounded">
                Note: Pink indicates &gt;100 dB sound level
              </div>
            </div>

            {/* Demographics / Crowd split row */}
            <div className="w-full space-y-2 mt-4 bg-surface-container-lowest/50 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between text-xs font-mono font-bold text-on-surface-variant">
                <span className="text-yellow-400">🇧🇷 Brazil Fans: {brazilSplit}%</span>
                <span className="text-blue-400">🇫🇷 France Fans: {franceSplit}%</span>
                <span className="text-on-surface-variant/60">Neutral: {neutralSplit}%</span>
              </div>
              <div className="w-full h-3 rounded-full flex overflow-hidden">
                <div className="h-full bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.4)]" style={{ width: `${brazilSplit}%` }} />
                <div className="h-full bg-blue-500" style={{ width: `${franceSplit}%` }} />
                <div className="h-full bg-gray-600" style={{ width: `${neutralSplit}%` }} />
              </div>
            </div>
          </div>

          {/* Sector detail analysis & Cheering log list */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Real-time Cheering Feed logs */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4 flex-1">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Sparkles className="w-4 h-4 text-tertiary" />
                <h4 className="font-display font-bold text-xs uppercase tracking-wide text-on-surface">Live Cheering Alerts</h4>
              </div>
              
              <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                {CHEERS_FEED.map((feed, idx) => (
                  <div key={idx} className="bg-surface-container/30 border border-white/5 rounded-xl p-3 flex gap-3 text-xs leading-relaxed">
                    <span className="font-mono font-bold text-tertiary flex-shrink-0">{feed.time}</span>
                    <p className="text-on-surface-variant">{feed.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Queried Sector Sensor Details */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Map className="w-4 h-4 text-secondary" />
                <h4 className="font-display font-bold text-xs uppercase tracking-wide text-on-surface">Sector Sensor Check</h4>
              </div>

              {selectedSector ? (
                (() => {
                  const data = CROWD_STATS.find(s => s.sectionName === selectedSector);
                  if (!data) return null;
                  
                  return (
                    <div className="space-y-3.5 font-mono text-xs">
                      <div className="flex justify-between items-center bg-surface-container p-2.5 rounded-lg">
                        <span className="text-on-surface-variant/70">Selected Zone</span>
                        <span className="text-white font-extrabold">{data.sectionName}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant/70">Section Occupancy</span>
                          <span className="text-on-surface font-bold">{data.occupancy}%</span>
                        </div>
                        <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                          <div className="bg-[#00FF41] h-full" style={{ width: `${data.occupancy}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant/70">Sound Pressure (dB)</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                          data.noiseLevel > 100 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse" 
                            : data.noiseLevel > 85 
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {data.noiseLevel} dB
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-on-surface-variant/70">Cheer Dominance</span>
                        <span className="text-tertiary font-bold">{data.domination} supporters</span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-6 text-xs text-on-surface-variant/40 flex flex-col items-center justify-center gap-1.5 font-mono">
                  <AlertCircle className="w-5 h-5 text-on-surface-variant/20" />
                  <span>Select any segment on the stadium sound map above to view exact microphone telemetry data.</span>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* Concessions queues list */
        <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h4 className="font-display font-bold text-sm text-on-surface uppercase">Real-Time Concession wait times</h4>
              <p className="text-[10px] text-on-surface-variant/70 font-mono">Synced with bluetooth queue tracking beacons</p>
            </div>
            <Clock className="w-5 h-5 text-tertiary animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONCESSIONS.map((item, idx) => (
              <div key={idx} className="bg-surface-container/40 hover:bg-surface-container-high/60 border border-white/5 rounded-2xl p-4 flex justify-between items-center gap-4 transition-all duration-200">
                <div className="space-y-1">
                  <h5 className="font-display font-extrabold text-sm text-on-surface">{item.name}</h5>
                  <p className="text-[10px] font-mono text-on-surface-variant/60 flex items-center gap-1">
                    📍 {item.location}
                  </p>
                </div>
                
                <div className="text-right">
                  <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full block border ${
                    item.status === "green" 
                      ? "bg-secondary/10 border-secondary/20 text-secondary" 
                      : item.status === "yellow" 
                      ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" 
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    {item.queue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
