"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function VoiceRecorder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();
    setListening(true);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;

      const userMessage = {
        role: "user" as const,
        content: transcript,
      };

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

    const res = await fetch("/api/voice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: text }),
    });

    const data = await res.json();

    const aiMessage = {
      role: "assistant" as const,
      content: data.answer,
    };

    setMessages((prev) => [...prev, aiMessage]);

    const speech = new SpeechSynthesisUtterance(data.answer);
    speech.lang = "en-US";

    speechSynthesis.speak(speech);

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">

      <div className="w-full max-w-3xl flex flex-col h-screen">

        {/* Header */}
        <div className="p-4 border-b border-gray-700 text-white text-xl font-bold">
          Nova AI Voice Tutor
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <p className="text-gray-400">AI is thinking...</p>
          )}
        </div>

        {/* Input section */}
        <div className="p-4 border-t border-gray-700 flex justify-center">

          <button
            onClick={startListening}
            className="bg-blue-600 px-6 py-3 rounded-lg text-white hover:bg-blue-700"
          >
            {listening ? "Listening..." : "🎤 Ask Question"}
          </button>

        </div>
      </div>
    </div>
  );
}