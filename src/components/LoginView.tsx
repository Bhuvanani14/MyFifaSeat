import React, { useState } from "react";
import { User } from "../types";
import { LogIn, ShieldAlert, Sparkles, Trophy } from "lucide-react";

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      // Check credentials
      if (email === "fan@fifa.com" && password === "fifa") {
        const dummyUser: User = {
          email: "fan@fifa.com",
          name: "Alex Morgan",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfRhSQ2F8Q5e03zmkijDvkam9vU9sJqH-Vg28sWwbITAamatIEJv24qdcmKd5bBnI_K2OWL-VFMnTdHj79KhAR4GcLhnWbDipcXSFjFBwfKyRLOu2eenKlH7h2YdInQIuFEu1Xhm-kXdnH7nqN2HXYwxxHpiFm9Op5k4YH4QNZ2vyqbhXnML1X-InB_kLXeLb7g3iFdDWvsWgvnj-KV5yLFub6UUMgBLWlzSUd3ADaKOQq6gwbF_yX",
          section: "302",
          seat: "12",
          isPremium: true
        };
        onLogin(dummyUser);
      } else {
        setError("Invalid credentials. Try using the Quick Login credentials.");
      }
      setIsLoading(false);
    }, 800);
  };

  const handleQuickLogin = () => {
    setEmail("fan@fifa.com");
    setPassword("fifa");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background with Stadium Glow */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-30 filter brightness-[0.3]"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmKLU2QVd9K6KvX8QRnmDPwP934JjEgV7a4SvO-yuhq2uFUe3OStwjHoZDKQS2sUm7yQeAT24GQqTnEek-YhaqEIxtDCOQpVFnCE0O7fWKvZ4ew25yRf8s5WOMivO_xbEKKEnB7DZ7kwlKUk33MdZiVtmAkq7GwjUjiO-o_xgZ5-W7taJ84Q7HXUGgxHsiRK3pup20JRaH87VeRQ7nNc7eTm_sbZZP4QV3yi4JYz5dCgk84MnG1Pka')" }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-background via-background/90 to-transparent" />

      {/* Background 3D Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-25 overflow-hidden">
        <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-600 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-emerald-600 rounded-full blur-[160px]" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md glass-panel rounded-2xl p-8 border border-white/10 shadow-[0_0_50px_rgba(0,70,167,0.15)] overflow-hidden">
        {/* Neon Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-primary via-tertiary to-secondary shadow-[0_0_15px_rgba(0,229,255,0.8)]" />
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-container/20 border border-tertiary/20 mb-4 neon-glow-tertiary text-tertiary">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-on-surface">
            FIFA WORLD CUP 2026
          </h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Stadium Seats & Real-time Crowd Management
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3 text-error text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g., fan@fifa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="e.g., fifa"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-tertiary text-on-primary font-bold py-3.5 px-4 rounded-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-200 neon-glow-primary flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In to Stadium</span>
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative bg-[#0b0c0e] px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant/50">
            Or Test Access
          </span>
        </div>

        <button
          onClick={handleQuickLogin}
          type="button"
          className="w-full bg-surface-container border border-white/5 hover:border-secondary/20 hover:bg-white/5 text-on-surface text-sm font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
          <Sparkles className="w-4 h-4 text-secondary group-hover:animate-pulse" />
          <span>Quick Login (fan@fifa.com / fifa)</span>
        </button>
      </div>
    </div>
  );
}
