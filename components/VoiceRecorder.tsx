"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import FallingStars from "./FallingStars";
import Link from "next/link";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type Message = { role: "user" | "assistant"; content: string };
type Session = { id: string; title: string; messages: Message[]; ts: number };

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function sessionTitle(messages: Message[]) {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New chat";
  return first.content.length > 36
    ? first.content.slice(0, 36) + "…"
    : first.content;
}

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
export default function VoiceRecorder() {
  const [sessions, setSessions]         = useState<Session[]>([]);
  const [activeId, setActiveId]         = useState<string>("");
  const [listening, setListening]       = useState(false);
  const [loading, setLoading]           = useState(false);
  const [speaking, setSpeaking]         = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [voices, setVoices]             = useState<SpeechSynthesisVoice[]>([]);
  const [selectedLang, setSelectedLang] = useState<"hindi" | "english">("english");
  const scrollRef = useRef<HTMLDivElement>(null);

  /* active session messages */
  const activeSession = sessions.find((s) => s.id === activeId) ?? null;
  const messages      = activeSession?.messages ?? [];

  /* load voices */
  useEffect(() => {
    const load = () => setVoices(speechSynthesis.getVoices());
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  /* auto-scroll */
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  /* start a brand-new chat */
  const newChat = () => {
    const id: string = makeId();
    const session: Session = { id, title: "New chat", messages: [], ts: Date.now() };
    setSessions((prev) => [session, ...prev]);
    setActiveId(id);
  };

  /* ensure there's always at least one session */
  useEffect(() => {
    if (sessions.length === 0) newChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* update messages in the active session */
  const pushMessage = (msg: Message) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeId) return s;
        const updated = [...s.messages, msg];
        return { ...s, messages: updated, title: sessionTitle(updated) };
      })
    );
  };

  /* delete a session */
  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (id === activeId) {
        if (next.length === 0) {
          const fresh: Session = { id: makeId(), title: "New chat", messages: [], ts: Date.now() };
          setActiveId(fresh.id);
          return [fresh];
        }
        setActiveId(next[0].id);
      }
      return next;
    });
  };

  /* ── TTS helpers ── */
  const stripMarkdown = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/`{1,3}[^`]*`{1,3}/g, "")
      .replace(/[-*+]\s/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .trim();

  const stopSpeaking = () => { speechSynthesis.cancel(); setSpeaking(false); };

  /* ── Speech recognition ── */
  const startListening = () => {
    stopSpeaking();
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }

    const rec = new SR();
    rec.lang = selectedLang === "hindi" ? "hi-IN" : "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.start();
    setListening(true);

    rec.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      pushMessage({ role: "user", content: transcript });
      setListening(false);
      askAI(transcript);
    };
    rec.onerror = () => setListening(false);
  };

  /* ── AI call ── */
  const askAI = async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, lang: selectedLang }),
      });
      const data = await res.json();
      pushMessage({ role: "assistant", content: data.answer });

      const clean    = stripMarkdown(data.answer);
      const langCode = selectedLang === "english" ? "en-US" : "hi-IN";
      const utt      = new SpeechSynthesisUtterance(clean);
      utt.lang  = langCode;
      utt.rate  = 0.92;
      utt.pitch = 1.05;

      const pref =
        voices.find((v) => v.lang === langCode && !v.name.toLowerCase().includes("google")) ||
        voices.find((v) => v.lang === langCode);
      if (pref) utt.voice = pref;

      speechSynthesis.cancel();
      setSpeaking(true);
      utt.onend   = () => setSpeaking(false);
      utt.onerror = () => setSpeaking(false);
      speechSynthesis.speak(utt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────── */
  return (
    <div className="relative h-screen bg-black text-white overflow-hidden font-sans flex">
      <FallingStars />

      {/* ═══════════════════════════════
          SIDEBAR
      ═══════════════════════════════ */}
      <aside
        className={`relative z-20 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 ${
          sidebarOpen ? "w-72" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 rounded-r-3xl overflow-hidden">

          {/* sidebar header */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
              <span className="text-sm uppercase font-light tracking-widest">
                Nova <span className="font-bold text-blue-400">AI</span>
              </span>
            </div>
            <button
              onClick={newChat}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 transition-all duration-200"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
          </div>

          {/* session list */}
          <div
            className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5"
            style={{ scrollbarWidth: "none" }}
          >
            {sessions.length === 0 && (
              <p className="text-xs text-gray-600 text-center mt-6 uppercase tracking-widest">No chats yet</p>
            )}
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`group w-full flex items-start gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                  s.id === activeId
                    ? "bg-blue-600/20 border border-blue-500/30 shadow-[0_0_12px_#3b82f610]"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                {/* chat icon */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center mt-0.5 ${
                  s.id === activeId ? "bg-blue-500/30" : "bg-white/5"
                }`}>
                  <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${s.id === activeId ? "text-white" : "text-gray-400"}`}>
                    {s.title}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {s.messages.length} message{s.messages.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* delete btn */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-all duration-150 mt-1"
                >
                  <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* sidebar footer */}
          <div className="px-5 py-4 border-t border-white/10">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════
          MAIN AREA
      ═══════════════════════════════ */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 h-screen">

        {/* ── Top bar ── */}
        <header className="flex items-center gap-4 px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/10">
          {/* sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* title */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {activeSession?.title ?? "New chat"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Voice Interface v2.0</p>
          </div>

          {/* lang toggle */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 flex-shrink-0">
            <button
              onClick={() => setSelectedLang("english")}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                selectedLang === "english"
                  ? "bg-blue-600 text-white shadow-[0_0_10px_#2563eb60]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🇺🇸 EN
            </button>
            <button
              onClick={() => setSelectedLang("hindi")}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                selectedLang === "hindi"
                  ? "bg-orange-500 text-white shadow-[0_0_10px_#f9731660]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🇮🇳 हि
            </button>
          </div>
        </header>

        {/* ── Chat messages ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
          style={{ scrollbarWidth: "none" }}
        >
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-40 select-none">
              <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-light">Tap the mic and start talking</p>
                <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest">Nova is ready</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

              {/* Nova avatar */}
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_12px_#3b82f650] mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              )}

              <div
                className={`max-w-[75%] px-4 py-3 shadow-xl transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-blue-600/20 border border-blue-500/25 text-blue-50 backdrop-blur-sm rounded-3xl rounded-br-lg"
                    : "bg-white/[0.05] border border-white/10 text-gray-200 backdrop-blur-sm rounded-3xl rounded-bl-lg"
                }`}
              >
                <div className="text-[9px] uppercase tracking-widest opacity-35 mb-1.5 font-medium">
                  {msg.role === "user" ? "You" : "Nova"}
                </div>
                <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>

              {/* User avatar */}
              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {/* Thinking dots */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_12px_#3b82f650] mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="bg-white/[0.05] border border-white/10 px-5 py-4 rounded-3xl rounded-bl-lg flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
        </div>

        {/* ── Controls bar ── */}
        <div className="flex-shrink-0 px-6 py-5 border-t border-white/10 backdrop-blur-md bg-black/20">
          <div className="flex items-center justify-center gap-6">

            {/* Stop button */}
            {speaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/8 border border-white/15 hover:bg-white/15 transition-all duration-200"
                title="Stop speaking"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            )}

            {/* Mic button */}
            <button
              onClick={startListening}
              disabled={loading}
              className={`group relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 disabled:opacity-50 ${
                listening
                  ? "bg-red-500 shadow-[0_0_28px_#ef444480]"
                  : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_#2563eb70] hover:shadow-[0_0_28px_#3b82f690]"
              }`}
            >
              {listening && (
                <div className="absolute inset-0 rounded-2xl animate-ping bg-red-500 opacity-60" />
              )}
              <svg
                className={`w-7 h-7 text-white transition-transform ${listening ? "scale-110" : "group-hover:scale-105"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* New chat shortcut */}
            <button
              onClick={newChat}
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              title="New chat"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Status label */}
          <p className={`text-center text-xs tracking-widest uppercase mt-3 transition-all duration-300 ${
            listening  ? "text-red-400 opacity-100" :
            speaking   ? "text-blue-300 opacity-100" :
                         "text-gray-600 opacity-60"
          }`}>
            {listening ? "Listening…" : speaking ? "Nova is speaking…" : "Tap mic to speak"}
          </p>
        </div>
      </div>
    </div>
  );
}
