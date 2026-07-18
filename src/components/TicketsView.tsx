import React, { useState } from "react";
import { Ticket } from "../types";
import { CreditCard, QrCode, Calendar, MapPin, Clock, ArrowRightLeft, ShieldCheck, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { jsPDF } from "jspdf";

interface TicketsViewProps {
  tickets: Ticket[];
  onTransferTicket: (ticketId: string) => void;
}

export default function TicketsView({ tickets, onTransferTicket }: TicketsViewProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [checkedInTickets, setCheckedInTickets] = useState<string[]>([]);
  const [transferringId, setTransferringId] = useState<string | null>(null);

  const downloadTicketPDF = (ticket: Ticket) => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [170, 95] // Elegant widescreen golden-ratio ticket format!
      });

      // Draw beautiful ticket background card
      doc.setFillColor(15, 23, 42); // slate-900 background
      doc.rect(0, 0, 170, 95, "F");

      // Draw aesthetic outer borders
      doc.setDrawColor(79, 70, 229); // primary indigo-600
      doc.setLineWidth(1.5);
      doc.rect(2, 2, 166, 91, "D");

      // Draw ticket divider line (perforated coupon look)
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(120, 2, 120, 93);
      doc.setLineDashPattern([], 0); // Reset dash

      // Premium glowing header accent
      doc.setFillColor(79, 70, 229);
      doc.rect(4, 4, 112, 6, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text("OFFICIAL ACCESS PASS  •  METLIFE STADIUM", 8, 8.5);

      // Unique ticket identification
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFontSize(7);
      doc.setFont("Helvetica", "normal");
      doc.text(`TICKET ID: ${ticket.id}`, 8, 15);
      doc.text(`CATEGORY: ${ticket.category.toUpperCase()}`, 75, 15);

      // Match Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.text(`${ticket.homeTeam.toUpperCase()}  vs  ${ticket.awayTeam.toUpperCase()}`, 8, 24);

      // Match Details
      doc.setTextColor(129, 140, 248); // indigo-400
      doc.setFontSize(8);
      doc.text(ticket.match.toUpperCase(), 8, 29);

      // Date & Time Box
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(4, 34, 112, 10, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("Helvetica", "bold");
      doc.text("DATE & TIME", 8, 38);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(`${ticket.date} @ ${ticket.time}`, 8, 41.5);

      // Location details
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7);
      doc.setFont("Helvetica", "normal");
      doc.text(`VENUE: ${ticket.venue.toUpperCase()}`, 8, 49);

      // Detailed seating info card
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(4, 53, 112, 16, "F");

      doc.setDrawColor(99, 102, 241); // indigo-500
      doc.rect(4, 53, 112, 16, "D");

      // Column headers
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6);
      doc.text("SECTION", 15, 57);
      doc.text("ROW", 55, 57);
      doc.text("SEAT NO.", 92, 57);

      // Seating specs values
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont("Helvetica", "bold");
      doc.text(ticket.section, 15, 65);
      doc.text(ticket.row, 55, 65);
      doc.setTextColor(234, 179, 8); // yellow-500
      doc.text(ticket.seat, 92, 65);

      // Official price indicator and bar/security seal
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7);
      doc.setFont("Helvetica", "normal");
      doc.text("PRICE PAID:", 8, 76);
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`USD $${ticket.price}.00`, 24, 76.5);

      // Terms/Footer message
      doc.setTextColor(148, 163, 184);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(5.5);
      doc.text("SUBJECT TO STADIUM TERMS AND CONDITIONS. SCAN CODE AT STADIUM ENTRY GATE.", 8, 82);
      doc.text("DO NOT DUPLICATE THIS DIGITAL PASS. VALID FOR SINGLE ADMISSION ONLY.", 8, 85);

      // Draw Security Barcode lines in bottom left corner
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      let barcodeX = 8;
      for (let i = 0; i < 24; i++) {
        const w = (i % 3 === 0 || i % 5 === 0) ? 0.9 : 0.3;
        doc.setLineWidth(w);
        doc.line(barcodeX, 88, barcodeX, 92);
        barcodeX += w + 0.5;
      }
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(5);
      doc.text(`*FIFA2026_${ticket.id}*`, 18, 91.5);

      // RIGHT STUB - PASS COUPON (Line 120 onwards)
      // Rotated side ribbon
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(122, 4, 44, 4, "F");
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(6);
      doc.text("GATE PASS", 134, 7);

      // QR Code Box Placeholder
      doc.setFillColor(255, 255, 255);
      doc.rect(128, 12, 32, 32, "F");

      // Draw dynamic faux scan pattern on the QR box so it acts as high-fidelity offline backup!
      doc.setFillColor(15, 23, 42); // Dark pixels
      // Draw outer anchor squares
      // Top Left Anchor
      doc.rect(130, 14, 6, 6, "F");
      doc.setFillColor(255, 255, 255);
      doc.rect(131.5, 15.5, 3, 3, "F");
      doc.setFillColor(15, 23, 42);
      doc.rect(132.5, 16.5, 1, 1, "F");

      // Top Right Anchor
      doc.rect(152, 14, 6, 6, "F");
      doc.setFillColor(255, 255, 255);
      doc.rect(153.5, 15.5, 3, 3, "F");
      doc.setFillColor(15, 23, 42);
      doc.rect(154.5, 16.5, 1, 1, "F");

      // Bottom Left Anchor
      doc.rect(130, 36, 6, 6, "F");
      doc.setFillColor(255, 255, 255);
      doc.rect(131.5, 37.5, 3, 3, "F");
      doc.setFillColor(15, 23, 42);
      doc.rect(132.5, 38.5, 1, 1, "F");

      // Add neat custom random QR noise blocks for a flawless authentic pass look!
      doc.rect(138, 15, 2, 1, "F");
      doc.rect(142, 17, 3, 2, "F");
      doc.rect(148, 14, 1, 3, "F");
      doc.rect(131, 23, 2, 2, "F");
      doc.rect(135, 21, 3, 1, "F");
      doc.rect(140, 25, 4, 4, "F");
      doc.rect(147, 22, 2, 3, "F");
      doc.rect(152, 24, 3, 1, "F");
      doc.rect(132, 31, 1, 3, "F");
      doc.rect(137, 33, 4, 1, "F");
      doc.rect(143, 32, 2, 4, "F");
      doc.rect(149, 30, 3, 3, "F");
      doc.rect(154, 36, 1, 2, "F");
      doc.rect(138, 38, 3, 1, "F");
      doc.rect(146, 39, 4, 2, "F");

      // QR Scanner instruction text
      doc.setTextColor(148, 163, 184);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(5);
      doc.text("FIFA GATE ENTRY SCANNER CODE", 126, 48);

      // Stub Match Info
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(`${ticket.homeTeam.substring(0, 3).toUpperCase()} VS ${ticket.awayTeam.substring(0, 3).toUpperCase()}`, 124, 55);

      doc.setTextColor(129, 140, 248);
      doc.setFontSize(6.5);
      doc.text(`ID: ${ticket.id}`, 124, 60);

      // Stub Seating Box
      doc.setFillColor(30, 41, 59);
      doc.rect(124, 64, 42, 24, "F");
      
      doc.setDrawColor(79, 70, 229);
      doc.rect(124, 64, 42, 24, "D");

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(5.5);
      doc.text("SEC", 128, 69);
      doc.text("ROW", 141, 69);
      doc.text("SEAT", 154, 69);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("Helvetica", "bold");
      doc.text(ticket.section, 128, 76);
      doc.text(ticket.row, 141, 76);
      doc.setTextColor(16, 185, 129); // emerald Green seat
      doc.text(ticket.seat, 154, 76);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(5);
      doc.setFont("Helvetica", "normal");
      doc.text("GATE OPEN: 2.5 HOURS BEFORE KICKOFF", 126, 84);

      // Save/Download Action
      doc.save(`FIFA2026_MatchTicket_${ticket.id}.pdf`);
    } catch (e) {
      console.error("Error generating PDF ticket:", e);
    }
  };

  const handleCheckIn = (ticketId: string) => {
    if (checkedInTickets.includes(ticketId)) return;
    setCheckedInTickets([...checkedInTickets, ticketId]);
  };

  const handleTransfer = (ticketId: string) => {
    setTransferringId(ticketId);
    setTimeout(() => {
      onTransferTicket(ticketId);
      setTransferringId(null);
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-surface-container/40 backdrop-blur-md px-6 py-4 rounded-xl border border-white/5 shadow-md">
        <h2 className="font-display font-extrabold text-xl tracking-tight uppercase flex items-center gap-2 text-on-surface">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-light shadow-[0_0_8px_#b0c6ff]" />
          My Ticket Wallet
        </h2>
      </div>

      {tickets.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 space-y-4 max-w-lg mx-auto">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto animate-pulse" />
          <h3 className="font-display font-bold text-lg text-on-surface">Wallet is Empty</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            You don't have any stadium seat bookings yet. Head over to the <span className="text-tertiary font-bold">Stadium</span> map to select a seat and reserve your ticket.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* List of Tickets */}
          <div className="space-y-4">
            {tickets.map((t) => {
              const isCheckedIn = checkedInTickets.includes(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`glass-panel rounded-2xl p-5 border cursor-pointer hover:border-tertiary/40 transition-all duration-300 relative overflow-hidden group ${
                    selectedTicket?.id === t.id ? "border-tertiary/60 shadow-[0_0_20px_rgba(0,229,255,0.1)]" : "border-white/5"
                  }`}
                >
                  {/* Category Side Strip */}
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-primary via-tertiary to-secondary" />

                  {/* Top line with ID and Status */}
                  <div className="flex justify-between items-center mb-4 pl-2">
                    <span className="text-[10px] font-mono text-on-surface-variant font-bold uppercase tracking-wider bg-surface-container px-2 py-1 rounded">
                      ID: {t.id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      isCheckedIn 
                        ? "bg-secondary/10 text-secondary border border-secondary/20" 
                        : "bg-tertiary/10 text-tertiary border border-tertiary/20"
                    }`}>
                      {isCheckedIn ? "Checked In • Gate Open" : "Active • Ready"}
                    </span>
                  </div>

                  {/* Teams Row */}
                  <div className="flex items-center gap-4 pl-2 mb-4">
                    <div className="flex -space-x-2">
                      <img src={t.homeFlag} alt={t.homeTeam} className="w-8 h-8 rounded-full border border-surface object-cover" />
                      <img src={t.awayFlag} alt={t.awayTeam} className="w-8 h-8 rounded-full border border-surface object-cover" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-md text-on-surface">
                        {t.homeTeam} vs {t.awayTeam}
                      </h4>
                      <p className="text-xs text-on-surface-variant">{t.match}</p>
                    </div>
                  </div>

                  {/* Seat Details row */}
                  <div className="grid grid-cols-3 gap-3 bg-surface-container-lowest/60 p-3 rounded-xl border border-white/5 text-center text-xs font-mono">
                    <div>
                      <span className="text-on-surface-variant/60 block text-[9px] uppercase">Section</span>
                      <span className="text-on-surface font-extrabold">{t.section}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant/60 block text-[9px] uppercase">Row</span>
                      <span className="text-on-surface font-extrabold">{t.row}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant/60 block text-[9px] uppercase">Seat</span>
                      <span className="text-on-surface font-extrabold">{t.seat}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center pl-2 pt-2 border-t border-white/5 text-[10px] text-on-surface-variant/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary-light" />
                      {t.date}
                    </span>
                    <span className="font-bold text-tertiary group-hover:translate-x-1 transition-transform">
                      Click to expand &gt;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ticket Pass Detail Display */}
          <div className="hidden md:block">
            {selectedTicket ? (
              <div className="glass-panel rounded-3xl border border-white/10 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full bg-gradient-to-b from-[#0b0c0e] to-[#020203]">
                {/* Luminous Top Glow */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-tertiary to-secondary" />

                <div className="space-y-6">
                  {/* Header info */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-secondary" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                        Official FIFA Wallet Pass
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-on-surface-variant/50 bg-surface-container px-3 py-1 rounded-md">
                      {selectedTicket.category}
                    </span>
                  </div>

                  {/* Large Match Headline */}
                  <div className="text-center py-4 border-b border-white/5">
                    <div className="flex justify-center items-center gap-6 mb-3">
                      <img src={selectedTicket.homeFlag} alt={selectedTicket.homeTeam} className="w-14 h-14 rounded-full border border-white/10 p-1 neon-glow-primary object-cover" />
                      <span className="font-display font-extrabold text-xl text-on-surface-variant/40">VS</span>
                      <img src={selectedTicket.awayFlag} alt={selectedTicket.awayTeam} className="w-14 h-14 rounded-full border border-white/10 p-1 object-cover" />
                    </div>
                    <h3 className="font-display font-extrabold text-2xl text-on-surface">{selectedTicket.homeTeam} vs {selectedTicket.awayTeam}</h3>
                    <p className="text-xs text-tertiary font-mono uppercase tracking-wider mt-1">{selectedTicket.match}</p>
                  </div>

                  {/* Location and Time rows */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <MapPin className="w-4 h-4 text-tertiary flex-shrink-0" />
                      <span>{selectedTicket.venue}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-on-surface-variant">
                      <span className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-primary-light" />
                        <span>{selectedTicket.date}</span>
                      </span>
                      <span className="flex items-center gap-2 font-bold font-mono">
                        <Clock className="w-4 h-4 text-[#00FF41]" />
                        <span>{selectedTicket.time}</span>
                      </span>
                    </div>
                  </div>

                  {/* Seat Grid detail pass */}
                  <div className="grid grid-cols-3 gap-4 bg-surface-container rounded-2xl p-4 text-center relative border border-white/5">
                    <div className="border-r border-white/5">
                      <span className="text-[10px] font-mono text-on-surface-variant/60 block uppercase mb-1">Section</span>
                      <span className="font-display font-extrabold text-2xl text-on-surface">{selectedTicket.section}</span>
                    </div>
                    <div className="border-r border-white/5">
                      <span className="text-[10px] font-mono text-on-surface-variant/60 block uppercase mb-1">Row</span>
                      <span className="font-display font-extrabold text-2xl text-on-surface">{selectedTicket.row}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-on-surface-variant/60 block uppercase mb-1">Seat</span>
                      <span className="font-display font-extrabold text-2xl text-secondary">{selectedTicket.seat}</span>
                    </div>
                  </div>

                  {/* QR Code and Simulator */}
                  <div className="flex flex-col items-center py-4 space-y-4">
                    <div className="bg-white p-3.5 rounded-2xl shadow-lg border border-white/20">
                      <img src={selectedTicket.qrCode} alt="Ticket Entry Barcode QR" className="w-36 h-36" />
                    </div>
                    
                    <span className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-widest text-center block">
                      Hold near gate scanner to access match
                    </span>
                  </div>
                </div>

                {/* Gate actions and Transfers */}
                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                  
                  {/* Download PDF button */}
                  <button
                    onClick={() => downloadTicketPDF(selectedTicket)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-primary-light hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 uppercase shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>Download PDF Ticket</span>
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCheckIn(selectedTicket.id)}
                      disabled={checkedInTickets.includes(selectedTicket.id)}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 uppercase transition-all ${
                        checkedInTickets.includes(selectedTicket.id)
                          ? "bg-secondary/10 border border-secondary/20 text-secondary cursor-not-allowed"
                          : "bg-surface-container border border-white/10 hover:border-secondary/30 text-on-surface cursor-pointer"
                      }`}
                    >
                      {checkedInTickets.includes(selectedTicket.id) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-secondary" />
                          <span>Gate Cleared</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4 text-secondary" />
                          <span>Simulate Scan</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleTransfer(selectedTicket.id)}
                      disabled={transferringId !== null}
                      className="flex-1 py-3 px-4 rounded-xl bg-surface-container-high hover:bg-white/5 border border-white/5 font-bold text-xs text-on-surface hover:text-error transition-all flex items-center justify-center gap-2 uppercase"
                    >
                      {transferringId === selectedTicket.id ? (
                        <div className="w-4 h-4 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <ArrowRightLeft className="w-4 h-4" />
                          <span>Transfer Ticket</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-3xl border border-dashed border-white/10 p-12 text-center flex flex-col justify-center items-center h-full">
                <CreditCard className="w-12 h-12 text-on-surface-variant/30 mb-4" />
                <h3 className="font-display font-bold text-sm text-on-surface-variant">Select a Ticket</h3>
                <p className="text-xs text-on-surface-variant/60 max-w-xs mt-1">
                  Click on any ticket in your wallet to expand and view the official gate entry pass, digital badges, and stadium check-in controls.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ticket Pass Mobile Dialog Popup */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md" onClick={() => setSelectedTicket(null)} />
          
          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-sm glass-panel rounded-3xl p-5 border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase text-on-surface-variant">
                  FIFA Pass ID: {selectedTicket.id}
                </span>
                <button onClick={() => setSelectedTicket(null)} className="text-xs text-on-surface-variant hover:text-on-surface font-bold">
                  ✕ Close
                </button>
              </div>

              {/* Match Header */}
              <div className="text-center py-2">
                <div className="flex justify-center items-center gap-4 mb-2">
                  <img src={selectedTicket.homeFlag} alt={selectedTicket.homeTeam} className="w-10 h-10 rounded-full object-cover" />
                  <span className="font-display font-extrabold text-sm text-on-surface-variant/30">VS</span>
                  <img src={selectedTicket.awayFlag} alt={selectedTicket.awayTeam} className="w-10 h-10 rounded-full object-cover" />
                </div>
                <h3 className="font-display font-extrabold text-lg text-on-surface">{selectedTicket.homeTeam} vs {selectedTicket.awayTeam}</h3>
                <p className="text-[10px] text-tertiary font-mono">{selectedTicket.match}</p>
              </div>

              {/* Grid Seat Details */}
              <div className="grid grid-cols-3 gap-3 bg-surface-container rounded-xl p-3 text-center border border-white/5">
                <div>
                  <span className="text-[9px] font-mono text-on-surface-variant block uppercase">Section</span>
                  <span className="font-display font-extrabold text-lg text-on-surface">{selectedTicket.section}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-on-surface-variant block uppercase">Row</span>
                  <span className="font-display font-extrabold text-lg text-on-surface">{selectedTicket.row}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-on-surface-variant block uppercase">Seat</span>
                  <span className="font-display font-extrabold text-lg text-secondary">{selectedTicket.seat}</span>
                </div>
              </div>

              {/* QR Image */}
              <div className="flex flex-col items-center py-2 space-y-2">
                <div className="bg-white p-2.5 rounded-xl border border-white/10">
                  <img src={selectedTicket.qrCode} alt="Entry QR" className="w-28 h-28" />
                </div>
                <span className="text-[9px] font-mono text-on-surface-variant/50 uppercase tracking-widest text-center">
                  Hold near gate scanner to access match
                </span>
              </div>
            </div>

            {/* Actions for Mobile */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-white/5 mt-4">
              
              <button
                onClick={() => downloadTicketPDF(selectedTicket)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary to-primary-light hover:opacity-95 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 uppercase transition-all cursor-pointer shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Ticket</span>
              </button>

              <div className="flex gap-2.5">
                <button
                  onClick={() => handleCheckIn(selectedTicket.id)}
                  disabled={checkedInTickets.includes(selectedTicket.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 uppercase transition-all ${
                    checkedInTickets.includes(selectedTicket.id)
                      ? "bg-secondary/10 border border-secondary/20 text-secondary cursor-not-allowed"
                      : "bg-surface-container border border-white/10 hover:border-secondary/30 text-on-surface cursor-pointer"
                  }`}
                >
                  {checkedInTickets.includes(selectedTicket.id) ? "Cleared" : "Scan Code"}
                </button>

                <button
                  onClick={() => handleTransfer(selectedTicket.id)}
                  disabled={transferringId !== null}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-surface-container-high border border-white/5 font-bold text-[10px] text-on-surface hover:text-error transition-all flex items-center justify-center gap-1 uppercase"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
