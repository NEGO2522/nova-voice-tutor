"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function VoiceRecorder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
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
        body: JSON.stringify({ question: text }),
      });

      const data = await res.json();
      const aiMessage = { role: "assistant" as const, content: data.answer };

      setMessages((prev) => [...prev, aiMessage]);

      const speech = new SpeechSynthesisUtterance(data.answer);
      speech.lang = "en-US";
      speechSynthesis.speak(speech);
    } catch (error) {
      console.error("AI Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* --- Animated Star Background --- */}
      <div className="absolute inset-0 z-0">
        <div className="stars-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                width: `${Math.random() * 3}px`,
                height: `${Math.random() * 3}px`,
              }}
            />
          ))}
        </div>
      </div>

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
          <div className="text-xs text-gray-400 uppercase tracking-tighter">Voice Interface v2.0</div>
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
          <button
            onClick={startListening}
            disabled={loading}
            className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 ${
              listening 
                ? "bg-red-500 shadow-[0_0_30px_#ef4444]" 
                : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_#2563eb80]"
            } disabled:opacity-50`}
          >
            {/* Pulsing ring for listening state */}
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
          <p className={`text-sm tracking-widest uppercase transition-opacity duration-300 ${listening ? "opacity-100 text-red-400" : "opacity-40"}`}>
            {listening ? "System Listening..." : "Tap to Speak"}
          </p>
        </div>
      </div>

      <style jsx>{`
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0.3;
          animation: twinkle var(--duration, 3s) infinite ease-in-out;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}