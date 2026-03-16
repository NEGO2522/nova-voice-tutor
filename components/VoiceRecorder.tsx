"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import FallingStars from "./FallingStars";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function VoiceRecorder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  // Language selected by the user — drives mic locale + API lang + TTS voice
  const [selectedLang, setSelectedLang] = useState<"hindi" | "english">("english");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load available TTS voices (browsers load them async)
  useEffect(() => {
    const loadVoices = () => setVoices(speechSynthesis.getVoices());
    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);


  // Strip markdown symbols so TTS reads cleanly
  const stripMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/`{1,3}[^`]*`{1,3}/g, "")
      .replace(/[-*+]\s/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .trim();
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
  };

  const startListening = () => {
    // Always stop any ongoing speech before listening
    stopSpeaking();
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    // Use the locale that matches what the user selected
    recognition.lang = selectedLang === "hindi" ? "hi-IN" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();
    setListening(true);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const userMessage = { role: "user" as const, content: transcript };
      setMessages((prev) => [...prev, userMessage]);
      setListening(false);
      askAI(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };
  };

  const askAI = async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the user-selected language directly — no guessing
        body: JSON.stringify({ question: text, lang: selectedLang }),
      });

      const data = await res.json();
      const aiMessage = { role: "assistant" as const, content: data.answer };
      setMessages((prev) => [...prev, aiMessage]);

      // Clean text before speaking — remove markdown symbols
      const cleanText = stripMarkdown(data.answer);

      // TTS locale matches user-selected language
      const langCode = selectedLang === "english" ? "en-US" : "hi-IN";

      const speech = new SpeechSynthesisUtterance(cleanText);
      speech.lang = langCode;
      speech.rate = 0.92;   // slightly slower for clarity
      speech.pitch = 1.05;  // a touch warmer

      // Try to find a native voice for the detected language
      const preferredVoice = voices.find(
        (v) => v.lang === langCode && !v.name.toLowerCase().includes("google")
      ) || voices.find((v) => v.lang === langCode);
      if (preferredVoice) speech.voice = preferredVoice;

      speechSynthesis.cancel();
      setSpeaking(true);
      speech.onend = () => setSpeaking(false);
      speech.onerror = () => setSpeaking(false);
      speechSynthesis.speak(speech);
    } catch (error) {
      console.error("AI Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans">
      <FallingStars />

      {/* --- Main UI Layer --- */}
      <div className="relative z-10 flex flex-col items-center h-screen">
        {/* Header */}
        <header className="w-full max-w-4xl p-6 flex justify-between items-center backdrop-blur-md bg-black/30 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
            <h1 className="text-xl font-tracking-widest uppercase font-light">
              Nova <span className="font-bold text-blue-400">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors">← Home</Link>
            <span className="text-xs text-gray-600 uppercase tracking-tighter">Voice Interface v2.0</span>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 w-full max-w-3xl overflow-y-auto p-6 space-y-6 scrollbar-hide"
        >
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <div className="mb-4 text-4xl">✨</div>
              <p className="text-lg font-light">Tap the mic and start a conversation</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl shadow-2xl transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-blue-600/20 border border-blue-500/30 text-blue-50 backdrop-blur-sm"
                    : "bg-white/5 border border-white/10 text-gray-200 backdrop-blur-sm"
                }`}
              >
                <div className="text-[10px] uppercase tracking-widest opacity-40 mb-1">
                  {msg.role}
                </div>
                <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-2 items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full max-w-3xl p-8 flex flex-col items-center gap-4">

          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
            <button
              onClick={() => setSelectedLang("english")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedLang === "english"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🇺🇸 English
            </button>
            <button
              onClick={() => setSelectedLang("hindi")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedLang === "hindi"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🇮🇳 हिंदी
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Mic Button */}
            <button
              onClick={startListening}
              disabled={loading}
              className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 ${
                listening 
                  ? "bg-red-500 shadow-[0_0_30px_#ef4444]" 
                  : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_#2563eb80]"
              } disabled:opacity-50`}
            >
              {listening && (
                <div className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-75" />
              )}
              <svg 
                className={`w-8 h-8 text-white transition-transform ${listening ? "scale-110" : "group-hover:scale-110"}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Stop Button — only shown while AI is speaking */}
            {speaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg"
                title="Stop speaking"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            )}
          </div>

          <p className={`text-sm tracking-widest uppercase transition-opacity duration-300 ${
            listening ? "opacity-100 text-red-400" : speaking ? "opacity-100 text-blue-300" : "opacity-40"
          }`}>
            {listening ? "System Listening..." : speaking ? "Nova is speaking..." : "Tap to Speak"}
          </p>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}