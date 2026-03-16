"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FallingStars from "../../components/FallingStars";

/* ─────────────────────────────────────────
   Features data
───────────────────────────────────────── */
const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Voice First",
    desc: "Just tap and speak. Nova listens, understands, and responds — no typing needed.",
    color: "blue",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    title: "Hindi & English",
    desc: "Switch between Hindi and English instantly. Nova speaks your language, literally.",
    color: "orange",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI-Powered Tutor",
    desc: "Backed by Amazon Nova — answers questions, explains concepts, and keeps it conversational.",
    color: "purple",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Instant Responses",
    desc: "No lag, no wait. Get clear answers in real time and keep the learning flowing.",
    color: "sky",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Chat History",
    desc: "Every conversation is saved in-session so you can scroll back and review anytime.",
    color: "green",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Private & Secure",
    desc: "Your conversations stay yours. Nothing is stored on external servers without consent.",
    color: "rose",
  },
];

const STEPS = [
  { num: "01", title: "Pick your language", desc: "Toggle between 🇺🇸 English and 🇮🇳 Hindi before you start." },
  { num: "02", title: "Tap the mic", desc: "Hold the glowing button and speak your question naturally." },
  { num: "03", title: "Nova replies", desc: "Get a warm, conversational answer spoken back to you instantly." },
];

/* ─────────────────────────────────────────
   Live Demo widget
───────────────────────────────────────── */
type DemoMsg = { role: "user" | "nova"; text: string };

const DEMO_SCRIPT: DemoMsg[] = [
  { role: "user",  text: "What is photosynthesis?" },
  { role: "nova",  text: "Photosynthesis is how plants make their own food using sunlight, water, and carbon dioxide. They basically turn light energy into sugar — pretty cool right? 🌿" },
  { role: "user",  text: "Explain it in Hindi" },
  { role: "nova",  text: "प्रकाश संश्लेषण वो प्रक्रिया है जिसमें पौधे सूरज की रोशनी, पानी और CO₂ से अपना खाना बनाते हैं। सीधे शब्दों में — पौधे धूप को शक्कर में बदलते हैं! 🌱" },
  { role: "user",  text: "How fast is light?" },
  { role: "nova",  text: "Light travels at about 3 lakh km per second — so fast it can circle the Earth 7 times in just one second! ⚡" },
];

function LiveDemo() {
  const [messages, setMessages] = useState<DemoMsg[]>([]);
  const [typing, setTyping]     = useState("");       // partial user text being typed
  const [phase, setPhase]       = useState<"typing" | "thinking" | "replying" | "pause">("pause");
  const [scriptIdx, setScriptIdx] = useState(0);
  const [replyIdx, setReplyIdx]   = useState(0);       // char index inside nova reply
  const [active, setActive]       = useState(false);   // started after mount
  const scrollRef = useRef<HTMLDivElement>(null);

  // auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, phase]);

  // start after 800ms on mount
  useEffect(() => {
    const t = setTimeout(() => setActive(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!active) return;

    const pair = DEMO_SCRIPT[scriptIdx % DEMO_SCRIPT.length];

    if (phase === "pause") {
      // wait then start typing the user message
      const t = setTimeout(() => { setTyping(""); setPhase("typing"); }, 900);
      return () => clearTimeout(t);
    }

    if (phase === "typing") {
      // only user messages are typed char by char
      if (pair.role !== "user") { setPhase("pause"); return; }
      if (typing.length < pair.text.length) {
        const t = setTimeout(() => setTyping(pair.text.slice(0, typing.length + 1)), 55);
        return () => clearTimeout(t);
      }
      // finished typing — commit user bubble and show thinking
      const t = setTimeout(() => {
        setMessages(prev => [...prev, { role: "user", text: pair.text }]);
        setTyping("");
        setPhase("thinking");
      }, 300);
      return () => clearTimeout(t);
    }

    if (phase === "thinking") {
      const t = setTimeout(() => { setReplyIdx(0); setPhase("replying"); }, 1200);
      return () => clearTimeout(t);
    }

    if (phase === "replying") {
      const novaMsg = DEMO_SCRIPT[(scriptIdx + 1) % DEMO_SCRIPT.length];
      if (novaMsg.role !== "nova") { advanceScript(); return; }
      if (replyIdx < novaMsg.text.length) {
        const t = setTimeout(() => setReplyIdx(r => r + 1), 18);
        return () => clearTimeout(t);
      }
      // reply complete — commit nova bubble
      const t = setTimeout(() => {
        setMessages(prev => [...prev, { role: "nova", text: novaMsg.text }]);
        advanceScript();
      }, 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, phase, typing, replyIdx, scriptIdx]);

  const advanceScript = () => {
    setScriptIdx(i => {
      const next = i + 2; // skip user+nova pair
      if (next >= DEMO_SCRIPT.length) {
        // reset entire demo
        setTimeout(() => {
          setMessages([]);
          setTyping("");
          setReplyIdx(0);
          setPhase("pause");
        }, 2200);
        return 0;
      }
      setPhase("pause");
      return next;
    });
  };

  const novaPartial = phase === "replying"
    ? DEMO_SCRIPT[(scriptIdx + 1) % DEMO_SCRIPT.length]?.text.slice(0, replyIdx)
    : "";

  return (
    <div className="relative backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ height: 420 }}>
      {/* window bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03] flex-shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-gray-500">Nova AI — Live Demo</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_4px_#4ade80]" />
          <span className="text-[9px] text-green-400 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

        {messages.length === 0 && phase === "pause" && !typing && (
          <div className="flex items-center justify-center h-full opacity-30">
            <p className="text-xs uppercase tracking-widest text-gray-400">Starting demo…</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "nova" && (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 shadow-[0_0_8px_#3b82f6]">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            )}
            <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
              m.role === "user"
                ? "bg-blue-600/25 border border-blue-500/30 text-blue-50"
                : "bg-white/5 border border-white/10 text-gray-200"
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {/* live typing — user */}
        {phase === "typing" && typing && (
          <div className="flex justify-end">
            <div className="max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed bg-blue-600/25 border border-blue-500/30 text-blue-50">
              {typing}<span className="inline-block w-0.5 h-3 bg-blue-300 ml-0.5 animate-pulse" />
            </div>
          </div>
        )}

        {/* thinking dots */}
        {phase === "thinking" && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-0 flex-shrink-0 shadow-[0_0_8px_#3b82f6]">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-2xl flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}

        {/* live streaming nova reply */}
        {phase === "replying" && novaPartial && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 shadow-[0_0_8px_#3b82f6]">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed bg-white/5 border border-white/10 text-gray-200">
              {novaPartial}<span className="inline-block w-0.5 h-3 bg-blue-400 ml-0.5 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* fake input bar */}
      <div className="flex-shrink-0 border-t border-white/10 px-4 py-3 flex items-center gap-3 bg-white/[0.02]">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-600 italic">
          {phase === "typing" ? typing || "Ask Nova anything…" : "Ask Nova anything…"}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
          phase === "thinking" || phase === "replying"
            ? "bg-blue-600 shadow-[0_0_12px_#3b82f6]"
            : "bg-blue-600/40 border border-blue-500/30"
        }`}>
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────
   Contact form (inside panel)
───────────────────────────────────────── */
function ContactPanelForm() {
  const [form, setForm]           = useState({ name: "", email: "", message: "" });
  const [state, setState]         = useState<"idle"|"sending"|"sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    await new Promise((r) => setTimeout(r, 1600));
    setState("sent");
  };

  if (state === "sent") return (
    <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shadow-[0_0_24px_#3b82f640]">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-base font-semibold">Message Sent!</h3>
      <p className="text-gray-400 text-sm">Thanks {form.name}, we’ll get back to you soon.</p>
      <button
        onClick={() => { setForm({ name: "", email: "", message: "" }); setState("idle"); }}
        className="text-xs uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
      >
        ← Send another
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Send a Message</h3>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-widest text-gray-500">Name</label>
        <input type="text" placeholder="Your name" value={form.name} required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-all duration-200" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-widest text-gray-500">Email</label>
        <input type="email" placeholder="you@example.com" value={form.email} required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-all duration-200" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-widest text-gray-500">Message</label>
        <textarea placeholder="What’s on your mind?" value={form.message} required rows={4}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-all duration-200 resize-none" />
      </div>

      <button type="submit" disabled={state === "sending"}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium rounded-xl px-6 py-3 transition-all duration-300 shadow-[0_0_16px_#2563eb50]"
      >
        {state === "sending" ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</>
        ) : (
          <>Send Message
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────
   Animated AI Robot — panels open/close like a screw machine
───────────────────────────────────────── */
function RobotModel() {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  // cycle: closed (2s) → opening (1.2s) → open (2s) → closing (1.2s) → repeat
  useEffect(() => {
    const phases = [2000, 1200, 2000, 1200];
    let idx = 0;
    let tId: ReturnType<typeof setTimeout>;
    const run = () => {
      tId = setTimeout(() => {
        idx = (idx + 1) % 4;
        setOpen(idx === 1 || idx === 2); // open during phase 1 & 2
        setTick(t => t + 1);
        run();
      }, phases[idx]);
    };
    run();
    return () => clearTimeout(tId);
  }, []);

  const t = `transition-all duration-[1200ms] ease-in-out`;

  return (
    <div className="relative select-none" style={{ width: 340, height: 420 }}>

      {/* outer glow */}
      <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-1000 ${
        open ? 'bg-blue-500/20' : 'bg-blue-500/8'
      } pointer-events-none`} />

      <svg viewBox="0 0 340 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          {/* core glow */}
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </radialGradient>
          {/* body metal */}
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          {/* panel metal */}
          <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          {/* screw */}
          <radialGradient id="screwGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>
        </defs>

        {/* ── BODY ── */}
        <rect x="95" y="160" width="150" height="160" rx="18" fill="url(#bodyGrad)" stroke="#334155" strokeWidth="1.5" />

        {/* body panel lines */}
        <line x1="95" y1="200" x2="245" y2="200" stroke="#334155" strokeWidth="1" />
        <line x1="95" y1="240" x2="245" y2="240" stroke="#334155" strokeWidth="1" />
        <line x1="95" y1="280" x2="245" y2="280" stroke="#334155" strokeWidth="1" />

        {/* ── CHEST PANEL DOORS (open/close like screw-machine clam) ── */}
        {/* Left door — rotates open to the left around its right edge (x=170) */}
        <g
          style={{
            transformOrigin: '170px 250px',
            transform: open ? 'rotateY(-70deg)' : 'rotateY(0deg)',
            transition: 'transform 1200ms ease-in-out',
          }}
        >
          <rect x="100" y="205" width="68" height="90" rx="6" fill="url(#panelGrad)" stroke="#475569" strokeWidth="1.2" />
          {/* screw top-left */}
          <circle cx="110" cy="215" r="4" fill="url(#screwGrad)" />
          <line x1="107" y1="215" x2="113" y2="215" stroke="#1e293b" strokeWidth="1" />
          <line x1="110" y1="212" x2="110" y2="218" stroke="#1e293b" strokeWidth="1" />
          {/* screw bottom-left */}
          <circle cx="110" cy="284" r="4" fill="url(#screwGrad)" />
          <line x1="107" y1="284" x2="113" y2="284" stroke="#1e293b" strokeWidth="1" />
          <line x1="110" y1="281" x2="110" y2="287" stroke="#1e293b" strokeWidth="1" />
          {/* panel detail lines */}
          <line x1="118" y1="222" x2="160" y2="222" stroke="#475569" strokeWidth="0.8" />
          <line x1="118" y1="230" x2="155" y2="230" stroke="#475569" strokeWidth="0.8" />
          <line x1="118" y1="260" x2="160" y2="260" stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.5" />
        </g>

        {/* Right door — rotates open to the right around its left edge (x=170) */}
        <g
          style={{
            transformOrigin: '170px 250px',
            transform: open ? 'rotateY(70deg)' : 'rotateY(0deg)',
            transition: 'transform 1200ms ease-in-out',
          }}
        >
          <rect x="172" y="205" width="68" height="90" rx="6" fill="url(#panelGrad)" stroke="#475569" strokeWidth="1.2" />
          {/* screw top-right */}
          <circle cx="230" cy="215" r="4" fill="url(#screwGrad)" />
          <line x1="227" y1="215" x2="233" y2="215" stroke="#1e293b" strokeWidth="1" />
          <line x1="230" y1="212" x2="230" y2="218" stroke="#1e293b" strokeWidth="1" />
          {/* screw bottom-right */}
          <circle cx="230" cy="284" r="4" fill="url(#screwGrad)" />
          <line x1="227" y1="284" x2="233" y2="284" stroke="#1e293b" strokeWidth="1" />
          <line x1="230" y1="281" x2="230" y2="287" stroke="#1e293b" strokeWidth="1" />
          {/* panel detail lines */}
          <line x1="180" y1="222" x2="222" y2="222" stroke="#475569" strokeWidth="0.8" />
          <line x1="185" y1="230" x2="222" y2="230" stroke="#475569" strokeWidth="0.8" />
          <line x1="180" y1="260" x2="222" y2="260" stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.5" />
        </g>

        {/* ── CORE — visible when panels open ── */}
        <g style={{ opacity: open ? 1 : 0, transition: 'opacity 600ms ease-in-out 400ms' }}>
          {/* glow disc */}
          <circle cx="170" cy="250" r="34" fill="url(#coreGlow)" />
          {/* outer ring */}
          <circle cx="170" cy="250" r="34" fill="none" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.6" />
          {/* mid ring */}
          <circle cx="170" cy="250" r="22" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeOpacity="0.7" />
          {/* inner orb */}
          <circle cx="170" cy="250" r="11" fill="#3b82f6" />
          <circle cx="170" cy="250" r="6" fill="#bfdbfe" />
          {/* rotating ring marks */}
          {[0,45,90,135,180,225,270,315].map((deg) => (
            <line
              key={deg}
              x1={170 + 27 * Math.cos(deg * Math.PI / 180)}
              y1={250 + 27 * Math.sin(deg * Math.PI / 180)}
              x2={170 + 32 * Math.cos(deg * Math.PI / 180)}
              y2={250 + 32 * Math.sin(deg * Math.PI / 180)}
              stroke="#93c5fd" strokeWidth="1.5" strokeOpacity="0.8"
            />
          ))}
        </g>

        {/* ── NECK ── */}
        <rect x="155" y="145" width="30" height="18" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <line x1="162" y1="148" x2="162" y2="160" stroke="#475569" strokeWidth="1" />
        <line x1="170" y1="148" x2="170" y2="160" stroke="#475569" strokeWidth="1" />
        <line x1="178" y1="148" x2="178" y2="160" stroke="#475569" strokeWidth="1" />

        {/* ── HEAD ── */}
        <rect x="105" y="68" width="130" height="80" rx="20" fill="url(#bodyGrad)" stroke="#334155" strokeWidth="1.5" />

        {/* head top panel */}
        <rect x="120" y="62" width="100" height="14" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        {/* antenna */}
        <line x1="170" y1="62" x2="170" y2="44" stroke="#475569" strokeWidth="2" />
        <circle cx="170" cy="40" r="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
        <circle
          cx="170" cy="40" r="3"
          fill={open ? '#60a5fa' : '#1e40af'}
          style={{ transition: 'fill 600ms ease-in-out' }}
        />

        {/* ── EYES ── */}
        {/* left eye */}
        <rect x="122" y="90" width="34" height="22" rx="8" fill="#0f172a" stroke="#1d4ed8" strokeWidth="1.5" />
        <rect
          x="126" y="94" width="26" height="14" rx="6"
          fill={open ? '#3b82f6' : '#1e3a8a'}
          style={{ transition: 'fill 800ms ease-in-out' }}
        />
        {/* eye shine */}
        <circle cx="144" cy="99" r="3" fill="white" fillOpacity={open ? 0.9 : 0.2} style={{ transition: 'fill-opacity 800ms' }} />

        {/* right eye */}
        <rect x="184" y="90" width="34" height="22" rx="8" fill="#0f172a" stroke="#1d4ed8" strokeWidth="1.5" />
        <rect
          x="188" y="94" width="26" height="14" rx="6"
          fill={open ? '#3b82f6' : '#1e3a8a'}
          style={{ transition: 'fill 800ms ease-in-out' }}
        />
        <circle cx="206" cy="99" r="3" fill="white" fillOpacity={open ? 0.9 : 0.2} style={{ transition: 'fill-opacity 800ms' }} />

        {/* ── MOUTH ── */}
        <rect x="140" y="124" width="60" height="14" rx="7" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        {/* mouth segments — light up when open */}
        {[0,1,2,3,4].map(i => (
          <rect
            key={i}
            x={144 + i * 11} y={127} width={8} height={8} rx={2}
            fill={open ? '#3b82f6' : '#1e3a8a'}
            fillOpacity={open ? (0.5 + i * 0.1) : 0.3}
            style={{ transition: `fill 600ms ease-in-out ${i * 80}ms` }}
          />
        ))}

        {/* ── SHOULDERS / ARMS ── */}
        {/* left shoulder */}
        <rect x="58" y="165" width="36" height="100" rx="12" fill="url(#bodyGrad)" stroke="#334155" strokeWidth="1.2" />
        <circle cx="76" cy="175" r="6" fill="url(#screwGrad)" />
        <line x1="73" y1="175" x2="79" y2="175" stroke="#1e293b" strokeWidth="1" />
        <line x1="76" y1="172" x2="76" y2="178" stroke="#1e293b" strokeWidth="1" />
        {/* left hand */}
        <rect x="62" y="268" width="28" height="20" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />

        {/* right shoulder */}
        <rect x="246" y="165" width="36" height="100" rx="12" fill="url(#bodyGrad)" stroke="#334155" strokeWidth="1.2" />
        <circle cx="264" cy="175" r="6" fill="url(#screwGrad)" />
        <line x1="261" y1="175" x2="267" y2="175" stroke="#1e293b" strokeWidth="1" />
        <line x1="264" y1="172" x2="264" y2="178" stroke="#1e293b" strokeWidth="1" />
        {/* right hand */}
        <rect x="250" y="268" width="28" height="20" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />

        {/* ── LEGS ── */}
        <rect x="115" y="322" width="42" height="68" rx="10" fill="url(#bodyGrad)" stroke="#334155" strokeWidth="1.2" />
        <rect x="183" y="322" width="42" height="68" rx="10" fill="url(#bodyGrad)" stroke="#334155" strokeWidth="1.2" />
        {/* feet */}
        <rect x="110" y="382" width="50" height="16" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <rect x="180" y="382" width="50" height="16" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />



        {/* ── SCREW CORNERS on body ── */}
        {[[100,165],[235,165],[100,310],[235,310]].map(([cx,cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={5} fill="url(#screwGrad)" />
            <line x1={cx-3} y1={cy} x2={cx+3} y2={cy} stroke="#1e293b" strokeWidth="1" />
            <line x1={cx} y1={cy-3} x2={cx} y2={cy+3} stroke="#1e293b" strokeWidth="1" />
          </g>
        ))}

      </svg>
    </div>
  );
}

const colorAccent: Record<string, string> = {
  blue:   "text-blue-400   border-blue-500/30   bg-blue-500/10   shadow-[0_0_20px_#3b82f615]",
  orange: "text-orange-400 border-orange-500/30 bg-orange-500/10 shadow-[0_0_20px_#f9731615]",
  purple: "text-purple-400 border-purple-500/30 bg-purple-500/10 shadow-[0_0_20px_#a855f715]",
  sky:    "text-sky-400    border-sky-400/30    bg-sky-400/10    shadow-[0_0_20px_#38bdf815]",
  green:  "text-green-400  border-green-500/30  bg-green-500/10  shadow-[0_0_20px_#4ade8015]",
  rose:   "text-rose-400   border-rose-500/30   bg-rose-500/10   shadow-[0_0_20px_#fb718515]",
};

/* ─────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────── */
function useCounter(target: number, duration = 1800, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);
  return count;
}

/* ─────────────────────────────────────────
   Stats strip
───────────────────────────────────────── */
const STATS = [
  { label: "Languages supported", value: 2, suffix: "" },
  { label: "Avg response time", value: 1, suffix: "s" },
  { label: "Questions answered", value: 10, suffix: "k+" },
  { label: "Uptime", value: 99, suffix: "%" },
];

function StatCard({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const count = useCounter(value, 1600, visible);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="text-3xl md:text-4xl font-bold text-white tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-xs uppercase tracking-widest text-gray-500">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Smooth scroll helper
───────────────────────────────────────── */
function smoothScroll(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled]       = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll only when contact panel is open
  useEffect(() => {
    if (contactOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [contactOpen]);

  return (
    <div className="relative bg-black text-white overflow-x-hidden font-sans">

      <FallingStars />

      {/* ── Ambient glows ── */}
      <div className="fixed top-[-15%] left-[10%]  w-[600px] h-[600px] bg-blue-600/10   rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[40%]  right-[-5%] w-[400px] h-[400px] bg-indigo-500/8  rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0   left-[30%]  w-[500px] h-[400px] bg-blue-900/10   rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ══════════════════════════════════
          NAVBAR
      ══════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 pt-4">
        <div className={`max-w-6xl mx-auto px-6 py-3 flex justify-between items-center rounded-2xl transition-all duration-500 ${scrolled ? "bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-xl" : "bg-transparent border border-transparent"}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
            <span className="text-lg uppercase font-light tracking-widest">
              Nova <span className="font-bold text-blue-400">AI</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-gray-400">
            <button onClick={() => smoothScroll("features")} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => smoothScroll("how")}      className="hover:text-white transition-colors">How it works</button>
            <button onClick={() => setContactOpen(true)}     className="hover:text-white transition-colors">Contact</button>
          </div>

          {/* CTA */}
          <Link
            href="/app"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium uppercase tracking-widest rounded-full px-5 py-2.5 transition-all duration-300 shadow-[0_0_16px_#2563eb60] hover:shadow-[0_0_24px_#3b82f680]"
          >
            Launch App
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex items-center px-6 pt-24 pb-20">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT — text */}
          <div className="flex flex-col items-start">
            <h1 className="text-5xl md:text-6xl font-light leading-tight tracking-tight">
              Your AI Tutor,<br />
              <span className="font-bold text-white relative">
                Voice First
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />
              </span>
              <span className="text-blue-400">.</span>
            </h1>

            <p className="mt-7 text-gray-400 text-base md:text-lg max-w-lg leading-relaxed">
              Ask anything in <span className="text-white font-medium">Hindi</span> or{" "}
              <span className="text-white font-medium">English</span>. Nova listens, understands,
              and responds like a brilliant friend who always has time for you.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/app"
                className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-2xl px-8 py-4 transition-all duration-300 shadow-[0_0_30px_#2563eb60] hover:shadow-[0_0_40px_#3b82f6a0] text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Start Talking to Nova
              </Link>
              <button
                onClick={() => smoothScroll("features")}
                className="flex items-center gap-2 border border-white/10 hover:border-white/30 text-gray-300 hover:text-white rounded-2xl px-8 py-4 transition-all duration-300 text-sm"
              >
                See Features
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Scroll hint */}
            <div className="mt-16 flex items-center gap-2 opacity-30">
              <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-[10px] uppercase tracking-widest">Scroll to explore</span>
            </div>
          </div>

          {/* RIGHT — animated AI robot */}
          <div className="flex items-center justify-center">
            <RobotModel />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════
          STATS STRIP
      ══════════════════════════════════ */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} suffix={s.suffix} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          FEATURES
      ══════════════════════════════════ */}
      <section id="features" className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-3">What Nova offers</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">
              Everything you need to <span className="font-bold text-white">learn faster</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group relative backdrop-blur-sm bg-white/[0.03] border rounded-3xl p-7 transition-all duration-400 hover:-translate-y-1 hover:bg-white/[0.05] ${colorAccent[f.color]}`}
              >
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-5 ${colorAccent[f.color]}`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════ */}
      <section id="how" className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">
              How <span className="font-bold text-white">Nova</span> works
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Left — steps */}
            <div className="relative flex flex-col gap-0">
              <div className="absolute left-[26px] top-10 bottom-10 w-px bg-gradient-to-b from-blue-500/40 via-blue-500/20 to-transparent hidden md:block" />
              {STEPS.map((step) => (
                <div key={step.num} className="flex items-start gap-7 py-8 border-b border-white/5 last:border-0">
                  <div className="relative flex-shrink-0 w-14 h-14 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_#3b82f620]">
                    <span className="text-xs font-bold text-blue-400 tracking-widest">{step.num}</span>
                  </div>
                  <div className="pt-3">
                    <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — live demo */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-gray-500">Live preview</span>
              </div>
              <LiveDemo />
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          LANGUAGE SECTION
      ══════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* English card */}
          <div className="group backdrop-blur-md bg-white/[0.03] border border-blue-500/20 rounded-3xl p-9 hover:bg-blue-500/[0.06] hover:border-blue-500/40 transition-all duration-400 hover:-translate-y-1">
            <div className="text-4xl mb-4">🇺🇸</div>
            <h3 className="text-xl font-semibold text-white mb-2">English Mode</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Ask questions, get explanations, or just have a conversation — all in natural, flowing English.
              Nova matches your pace and vocabulary.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Science", "Maths", "History", "Coding", "Grammar"].map((tag) => (
                <span key={tag} className="text-[10px] uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full px-3 py-1">{tag}</span>
              ))}
            </div>
          </div>

          {/* Hindi card */}
          <div className="group backdrop-blur-md bg-white/[0.03] border border-orange-500/20 rounded-3xl p-9 hover:bg-orange-500/[0.06] hover:border-orange-500/40 transition-all duration-400 hover:-translate-y-1">
            <div className="text-4xl mb-4">🇮🇳</div>
            <h3 className="text-xl font-semibold text-white mb-2">हिंदी मोड</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              अपनी भाषा में पूछो, अपनी भाषा में जवाब पाओ। Nova हिंदी में बात करता है जैसे कोई अपना दोस्त करता है।
            </p>
            <div className="flex flex-wrap gap-2">
              {["विज्ञान", "गणित", "इतिहास", "व्याकरण", "सामान्य ज्ञान"].map((tag) => (
                <span key={tag} className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-300 rounded-full px-3 py-1.5">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CTA BANNER
      ══════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          {/* Glow inside card */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_#3b82f640]">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>

            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
              Ready to start <span className="font-bold text-white">learning?</span>
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              No sign-up, no setup. Just open Nova, pick your language, and start talking.
            </p>

            <Link
              href="/app"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-2xl px-9 py-4 transition-all duration-300 shadow-[0_0_30px_#2563eb60] hover:shadow-[0_0_40px_#3b82f6a0] text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Open Nova AI
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer className="relative z-10 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
                <span className="text-sm uppercase font-light tracking-widest text-gray-400">
                  Nova <span className="font-bold text-blue-400">AI</span>
                </span>
              </div>
              <div className="flex items-center gap-8 text-xs uppercase tracking-widest text-gray-500">
                <Link href="/app"      className="hover:text-white transition-colors">App</Link>
                <button onClick={() => setContactOpen(true)} className="hover:text-white transition-colors">Contact</button>
                <button onClick={() => smoothScroll("features")} className="hover:text-white transition-colors">Features</button>
              </div>
              <p className="text-xs text-gray-600 uppercase tracking-widest">
                © {new Date().getFullYear()} Nova AI · Built with ♥
              </p>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════
          CONTACT SLIDE PANEL
      ══════════════════════════════════ */}

      {/* Backdrop */}
      <div
        onClick={() => setContactOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
          contactOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-lg flex flex-col bg-[#080c14] border-l border-white/10 shadow-2xl transition-transform duration-500 ease-in-out ${
          contactOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 flex-shrink-0">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-0.5">Get in touch</p>
            <h2 className="text-xl font-light">Say <span className="font-bold text-white">Hello</span> to Nova</h2>
          </div>
          <button
            onClick={() => setContactOpen(false)}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 relative" style={{ scrollbarWidth: "none" }}>

          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

          {/* About */}
          <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-3xl p-6">
            <h3 className="text-sm font-semibold mb-2">About Nova AI</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Nova is your voice-powered AI tutor — built to teach, converse, and help you learn in both Hindi and English.
              Always open to feedback, partnerships, and new ideas.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_#4ade80]" />
              Online &amp; ready to help
            </div>
          </div>

          {/* Contact form */}
          <ContactPanelForm />

          {/* Social links */}
          <div className="flex flex-col gap-3">
            {[
              { label: "Email", value: "hello@nova-ai.dev", href: "mailto:nextgenova28@gmail.com", color: "#3b82f6" },
              { label: "GitHub", value: "github.com/nova-ai", href: "https://github.com/NEGO2522/nova-voice-tutor", color: "#a855f7" },
              { label: "Twitter / X", value: "@nova_ai_dev", href: "https://x.com/Kshitij197372", color: "#38bdf8" },
              { label: "LinkedIn", value: "linkedin.com/in/nova-ai", href: "https://www.linkedin.com/in/kshitij-jain-422025342/", color: "#3b82f6" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-2xl px-5 py-4 transition-all duration-200"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: link.color }} />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">{link.label}</span>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">{link.value}</span>
                </div>
                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-300 transition-all group-hover:translate-x-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}
