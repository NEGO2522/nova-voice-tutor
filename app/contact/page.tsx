"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FallingStars from "../../components/FallingStars";

const CONTACT_LINKS = [
  {
    label: "Email",
    value: "nextgenova28@gmail.com",
    href: "mailto:nextgenova28@gmail.com",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: "blue",
  },
  {
    label: "GitHub",
    value: "github.com/nova-ai",
    href: "https://github.com/NEGO2522/nova-voice-tutor",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
    color: "purple",
  },
  {
    label: "Twitter / X",
    value: "@Kshitij197372",
    href: "https://x.com/Kshitij197372",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "sky",
  },
  {
    label: "LinkedIn",
    value: "linkedin",
    href: "https://www.linkedin.com/in/kshitij-jain-422025342/",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "blue",
  },
];

const borderHover: Record<string, string> = {
  blue:   "group-hover:border-blue-500/60   group-hover:shadow-[0_0_20px_#3b82f620]",
  purple: "group-hover:border-purple-500/60 group-hover:shadow-[0_0_20px_#a855f720]",
  sky:    "group-hover:border-sky-400/60    group-hover:shadow-[0_0_20px_#38bdf820]",
};

const iconColor: Record<string, string> = {
  blue:   "text-blue-400",
  purple: "text-purple-400",
  sky:    "text-sky-400",
};

type FormState = "idle" | "sending" | "sent";

export default function ContactPage() {
  const [form, setForm]           = useState({ name: "", email: "", message: "" });
  const [formState, setFormState] = useState<FormState>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    await new Promise((r) => setTimeout(r, 1800)); // swap with real API call
    setFormState("sent");
  };

  return (
    <div className="relative h-screen bg-black text-white overflow-hidden font-sans flex flex-col">

      <FallingStars />

      {/* Ambient glow */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[10%] w-[380px] h-[380px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-5 flex justify-between items-center flex-shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
          <span className="text-xl uppercase font-light tracking-widest">
            Nova <span className="font-bold text-blue-400">AI</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-xs uppercase tracking-widest text-gray-400">
          <Link href="/" className="hover:text-white transition-colors duration-200">Home</Link>
          <span className="text-white border-b border-blue-500 pb-0.5">Contact</span>
        </nav>
      </header>

      {/* Main */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-2 pb-6 flex-1 overflow-hidden flex flex-col">

        {/* Title */}
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-3">Get in touch</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">
            Say <span className="font-bold text-white">Hello</span> to Nova
          </h1>
          <p className="mt-3 text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
            Have a question, idea, or just want to connect? Drop us a message or reach out on any channel below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start flex-1">

          {/* Contact form */}
          <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl">
            {formState === "sent" ? (
              <div className="flex flex-col items-center justify-center py-14 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shadow-[0_0_30px_#3b82f640]">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Message Sent!</h2>
                <p className="text-gray-400 text-sm">Thanks {form.name}, we&apos;ll get back to you soon.</p>
                <button
                  onClick={() => { setForm({ name: "", email: "", message: "" }); setFormState("idle"); }}
                  className="mt-2 text-xs uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ← Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h2 className="text-lg font-semibold mb-1">Send a Message</h2>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.07] transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.07] transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500">Message</label>
                  <textarea
                    placeholder="What's on your mind?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={5}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.07] transition-all duration-200 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formState === "sending"}
                  className="mt-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium rounded-xl px-6 py-3.5 transition-all duration-300 shadow-[0_0_20px_#2563eb60] hover:shadow-[0_0_30px_#3b82f680]"
                >
                  {formState === "sending" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">

            {/* About card */}
            <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-3xl p-7 shadow-xl">
              <h2 className="text-lg font-semibold mb-3">About Nova AI</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                Nova is your voice-powered AI tutor — built to teach, converse, and help you learn in both Hindi and English.
                We&apos;re always open to feedback, partnerships, and new ideas.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_#4ade80]" />
                Online &amp; ready to help
              </div>
            </div>

            {/* Social links */}
            <div className="flex flex-col gap-3">
              {CONTACT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-4 backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 transition-all duration-300 ${borderHover[link.color] ?? ""}`}
                >
                  <span className={`${iconColor[link.color] ?? "text-gray-400"} transition-transform duration-300 group-hover:scale-110`}>
                    {link.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500">{link.label}</span>
                    <span className="text-sm text-gray-200 group-hover:text-white transition-colors">{link.value}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-300 ml-auto transition-all duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
