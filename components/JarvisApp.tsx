"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
};

export default function JarvisApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("jarvis-history");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("jarvis-history", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text = input) {
    const value = text.trim();
    if (!value || loading) return;
    const next = [...messages, { role: "user", content: value } as Message];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json();
      const answer = data.message || data.error || "Terjadi kesalahan.";
      setMessages([...next, { role: "assistant", content: answer }]);
      if (voiceEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(answer);
        utterance.lang = "id-ID";
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Koneksi ke JARVIS gagal. Periksa jaringan dan konfigurasi API." }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send();
  }

  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition tidak tersedia pada browser ini.");
      return;
    }
    const recognition: SpeechRecognitionLike = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "id-ID";
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setInput(text);
      send(text);
    };
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#06080d] text-slate-100">
      <div className="flex h-full">
        <aside className={`${sidebarOpen ? "absolute z-30 flex" : "hidden"} h-full w-72 shrink-0 flex-col border-r border-white/[0.06] bg-[#090c12] p-4 md:relative md:flex`}>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/[0.07] text-xs font-bold text-cyan-300">J</div>
            <div><p className="text-sm font-semibold tracking-wide">JARVIS</p><p className="text-[10px] uppercase tracking-[.22em] text-slate-500">Personal AI</p></div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-slate-500 md:hidden">×</button>
          </div>

          <button onClick={() => setMessages([])} className="mt-5 flex h-11 items-center gap-3 rounded-lg border border-cyan-300/10 bg-cyan-300/[0.04] px-3 text-sm text-cyan-100 transition hover:bg-cyan-300/[0.08]">
            <span className="text-xl leading-none">＋</span> Percakapan baru
          </button>

          <div className="mt-7">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-600">Aktivitas</p>
            {messages.length === 0 ? (
              <div className="px-3 text-xs text-slate-600">Belum ada percakapan</div>
            ) : (
              <button onClick={() => setMessages([])} className="w-full truncate rounded-md px-3 py-2 text-left text-xs text-slate-400 hover:bg-white/[0.03]">
                {messages.find((m) => m.role === "user")?.content.slice(0, 36) || "Percakapan saat ini"}
              </button>
            )}
          </div>

          <div className="mt-auto border-t border-white/[0.05] pt-4">
            <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.03]">
              <span className={`h-2 w-2 rounded-full ${voiceEnabled ? "bg-cyan-400" : "bg-slate-600"}`} /> Voice output {voiceEnabled ? "aktif" : "mati"}
            </button>
            <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2"><div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-300 to-blue-700" /><div><p className="text-xs font-medium">Operator</p><p className="text-[10px] text-slate-600">Local session</p></div></div>
          </div>
        </aside>

        <section className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center border-b border-white/[0.06] px-4 md:px-7">
            <button onClick={() => setSidebarOpen(true)} className="mr-3 text-slate-400 md:hidden">☰</button>
            <div className="text-sm font-medium text-slate-300">Neural Interface</div>
            <div className="ml-4 hidden h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] sm:block" />
            <div className="ml-auto flex items-center gap-3 text-[10px] uppercase tracking-[.16em] text-slate-600"><span className="hidden sm:inline">System Online</span><span className="font-mono text-cyan-500">42.0ms</span></div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10">
            {messages.length === 0 ? (
              <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center pb-14 text-center">
                <div className="relative mb-8 flex h-52 w-52 items-center justify-center">
                  <div className="orbit absolute inset-3 rounded-full border border-dashed border-cyan-300/20" />
                  <div className="absolute inset-10 rounded-full border border-cyan-200/10" />
                  <div className="ai-core flex h-24 w-24 items-center justify-center rounded-full border border-cyan-200/30 bg-[radial-gradient(circle,rgba(34,211,238,.16)_0%,rgba(5,12,20,.9)_68%)] shadow-[0_0_30px_rgba(34,211,238,.12)]">
                    <div className="h-10 w-10 rotate-45 rounded-[12px] border border-cyan-300/70" /><div className="absolute h-5 w-5 rounded-full bg-cyan-100 shadow-[0_0_18px_#67e8f9]" />
                  </div>
                </div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.42em] text-cyan-500">JARVIS is ready</p>
                <h1 className="text-2xl font-light tracking-tight text-slate-200 md:text-4xl">Bagaimana saya dapat membantu Anda?</h1>
                <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">
                  {["Rencanakan hari saya", "Analisis sebuah ide", "Buatkan kode aplikasi"].map((prompt) => (
                    <button key={prompt} onClick={() => send(prompt)} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs text-slate-400 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.03] hover:text-slate-200">{prompt}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-7 pb-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] text-[10px] text-cyan-300">J</div>}
                    <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === "user" ? "border border-white/[0.06] bg-[#161c26] text-slate-200" : "text-slate-300"}`}>{message.content}</div>
                  </div>
                ))}
                {loading && <div className="flex items-center gap-3 text-xs text-cyan-500"><div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />JARVIS sedang memproses...</div>}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="shrink-0 px-4 pb-5 md:px-10">
            <form onSubmit={submit} className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-white/[0.09] bg-[#0d1118] p-2 shadow-2xl shadow-black/30 focus-within:border-cyan-300/20">
              <button type="button" onClick={startListening} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${listening ? "bg-red-400/20 text-red-300" : "text-slate-500 hover:bg-white/[0.04] hover:text-cyan-300"}`} aria-label="Voice input">
                {listening ? "●" : "♩"}
              </button>
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Berikan perintah kepada JARVIS..." className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-200 outline-none placeholder:text-slate-600" />
              <button type="submit" disabled={!input.trim() || loading} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-[#071018] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-30">➤</button>
            </form>
            <p className="mt-2 text-center text-[9px] uppercase tracking-[.16em] text-slate-700">Secure neural channel · Local memory</p>
          </div>
        </section>
      </div>
    </main>
  );
}
