import { useEffect, useRef, useState } from "react";
import {
  Bot,
  CornerDownLeft,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { stamps, searchStampsInDatabase, Stamp } from "@/lib/stamps";

type Lang = "en" | "hi" | "bn";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  stamps?: Stamp[];
}

/* ================= LANGUAGE TEXT ================= */

const LANG_TEXT = {
  en: {
    welcome:
      "Hello! I am DakBot AI. Ask me anything about Indian stamps.",
    placeholder: "Ask about stamp history, value, rarity...",
    thinking: "Thinking...",
    noResult:
      "No matching stamp found in database.",
  },

  hi: {
    welcome:
      "नमस्ते! मैं DakBot AI हूँ। भारतीय स्टैम्प के बारे में कुछ भी पूछिए।",
    placeholder: "स्टैम्प हिस्ट्री, वैल्यू, rarity पूछें...",
    thinking: "सोच रहा हूँ...",
    noResult:
      "डेटाबेस में कोई matching स्टैम्प नहीं मिला।",
  },

  bn: {
    welcome:
      "নমস্কার! আমি DakBot AI। ভারতীয় স্ট্যাম্প সম্পর্কে যেকোনো প্রশ্ন করুন।",
    placeholder: "স্ট্যাম্প history, value, rarity জিজ্ঞাসা করুন...",
    thinking: "ভাবছি...",
    noResult:
      "ডাটাবেসে কোনো matching স্ট্যাম্প পাওয়া যায়নি।",
  },
};

/* ================= DETECT LANGUAGE ================= */

function detectLang(text: string): Lang {
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
}

/* ================= SPEAK FUNCTION ================= */

function speakText(
  text: string,
  lang: Lang,
  voiceEnabled: boolean,
) {
  if (!voiceEnabled) return;

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.rate = 1;
  utterance.pitch = 1;

  if (lang === "bn") {
    utterance.lang = "bn-BD";
  } else if (lang === "hi") {
    utterance.lang = "hi-IN";
  } else {
    utterance.lang = "en-US";
  }

  const voices =
    window.speechSynthesis.getVoices();

  const selectedVoice = voices.find((v) =>
    v.lang.toLowerCase().includes(
      lang === "bn"
        ? "bn"
        : lang === "hi"
        ? "hi"
        : "en"
    )
  );

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/* ================= VOICE INPUT ================= */

function startVoiceRecognition(
  onResult: (text: string) => void,
  lang: Lang
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice recognition not supported");
    return;
  }

  const recognition =
    new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.lang =
    lang === "bn"
      ? "bn-BD"
      : lang === "hi"
      ? "hi-IN"
      : "en-US";

  recognition.start();

  recognition.onresult = (event: any) => {
    const transcript =
      event.results[0][0].transcript;

    onResult(transcript);
  };
}

/* ================= AI STAMP SEARCH ================= */

function generateStampAnswer(
  query: string,
  lang: Lang
): { text: string; stamps: Stamp[] } {
  const matched = searchStampsInDatabase(query);

  if (matched.length === 0) {
    return {
      text: LANG_TEXT[lang].noResult,
      stamps: [],
    };
  }

  const top = matched.slice(0, 3);

  let text = "";
  if (lang === "bn") {
    text = top
      .map(
        (s) => `
🏷️ ${s.name}

📅 সাল: ${s.year}

🎭 বিভাগ: ${s.category}

⭐ Rare Level: ${s.rarity}

💰 দাম: ₹${s.price}

📍 স্থান: ${s.city}, ${s.state}

🧠 তথ্য:
${s.description}
`
      )
      .join("\n-------------------\n");
  } else if (lang === "hi") {
    text = top
      .map(
        (s) => `
🏷️ ${s.name}

📅 वर्ष: ${s.year}

🎭 कैटेगरी: ${s.category}

⭐ Rare Level: ${s.rarity}

💰 कीमत: ₹${s.price}

📍 स्थान: ${s.city}, ${s.state}

🧠 जानकारी:
${s.description}
`
      )
      .join("\n-------------------\n");
  } else {
    text = top
      .map(
        (s) => `
🏷️ ${s.name}

📅 Year: ${s.year}

🎭 Category: ${s.category}

⭐ Rarity: ${s.rarity}

💰 Price: ₹${s.price}

📍 Origin: ${s.city}, ${s.state}

🧠 History:
${s.description}
`
      )
      .join("\n-------------------\n");
  }

  return { text, stamps: top };
}

/* ================= MAIN COMPONENT ================= */

export function FloatingDakBot() {
  const [open, setOpen] =
    useState(false);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [voiceOn, setVoiceOn] =
    useState(true);

  const [listening, setListening] =
    useState(false);

  const [lang, setLang] =
    useState<Lang>("en");

  const [messages, setMessages] =
    useState<ChatMessage[]>([
      {
        sender: "bot",
        text: LANG_TEXT.en.welcome,
      },
    ]);

  const chatRef =
    useRef<HTMLDivElement>(null);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* ================= CHANGE LANGUAGE ================= */

  const handleLangChange = (
    newLang: Lang
  ) => {
    setLang(newLang);

    const welcome =
      LANG_TEXT[newLang].welcome;

    setMessages([
      {
        sender: "bot",
        text: welcome,
      },
    ]);

    speakText(
      welcome,
      newLang,
      voiceOn
    );
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = (
    text: string
  ) => {
    if (!text.trim()) return;

    const detected =
      detectLang(text);

    const finalLang =
      lang || detected;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
      },
    ]);

    setInput("");

    setLoading(true);

    setTimeout(() => {
      const result =
        generateStampAnswer(
          text,
          finalLang
        );

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: result.text,
          stamps: result.stamps,
        },
      ]);

      speakText(
        result.text,
        finalLang,
        voiceOn
      );

      setLoading(false);
    }, 700);
  };

  /* ================= START MIC ================= */

  const handleVoiceInput = () => {
    setListening(true);

    startVoiceRecognition(
      (spokenText) => {
        setListening(false);

        setInput(spokenText);

        sendMessage(spokenText);
      },
      lang
    );
  };

  /* ================= UI ================= */

  return (
    <div className="fixed bottom-5 right-5 z-50">

      {/* CHAT BOX */}

      {open && (
        <div className="mb-3 w-[380px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b p-3 bg-muted/30">

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFF0E5] dark:bg-[#F47721]/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-[#F47721]" />
              </div>

              <div>
                <div className="font-semibold text-sm">
                  DakBot AI
                </div>

                <div className="text-[11px] text-muted-foreground">
                  Indian Stamp & Heritage Assistant
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">

              {/* LANGUAGE */}

              <select
                value={lang}
                onChange={(e) =>
                  handleLangChange(
                    e.target
                      .value as Lang
                  )
                }
                className="rounded border border-border bg-background px-2 py-1 text-xs"
              >
                <option value="en">
                  English
                </option>

                <option value="hi">
                  हिन्दी
                </option>

                <option value="bn">
                  বাংলা
                </option>
              </select>

              {/* SPEAKER */}

              <button
                onClick={() => {
                  window.speechSynthesis.cancel();

                  setVoiceOn(
                    (v) => !v
                  );
                }}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title={voiceOn ? "Mute audio" : "Enable audio"}
              >
                {voiceOn ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4 text-red-500" />
                )}
              </button>

              {/* CLOSE */}

              <button
                onClick={() =>
                  setOpen(false)
                }
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CHAT AREA */}

          <div
            ref={chatRef}
            className="h-80 overflow-y-auto p-3 space-y-3"
          >
            {messages.map(
              (msg, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-line ${
                    msg.sender ===
                    "user"
                      ? "ml-auto bg-[#F47721] text-white shadow-sm"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div>{msg.text}</div>

                  {msg.stamps && msg.stamps.length > 0 && (
                    <div className="mt-3 space-y-2.5">
                      {msg.stamps.map((stamp) => (
                        <div
                          key={stamp.id}
                          className="bg-card dark:bg-black/40 border border-border dark:border-white/10 rounded-lg p-2.5 flex gap-3 items-center text-card-foreground shadow-xs"
                        >
                          {stamp.image && (
                            <img
                              src={stamp.image}
                              alt={stamp.name}
                              className="h-12 w-12 rounded object-contain bg-secondary/50 p-0.5"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-xs truncate">
                              {stamp.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {stamp.year} · {stamp.rarity} · ₹{stamp.price}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span
                                className={`text-[9px] font-medium ${
                                  stamp.available
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {stamp.available ? "● Available" : "● Sold Out"}
                              </span>
                              <Link
                                to="/stamps/$stampId"
                                params={{ stampId: stamp.id }}
                                className="inline-flex items-center gap-0.5 bg-[#F47721] hover:bg-[#E85D04] text-white text-[10px] font-bold px-2 py-1 rounded transition-colors"
                              >
                                View
                                <ArrowRight className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-[#F47721]" />

                {
                  LANG_TEXT[lang]
                    .thinking
                }
              </div>
            )}
          </div>

          {/* INPUT */}

          <div className="border-t border-border p-3">

            <div className="flex gap-2">

              <Input
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(input);
                  }
                }}
                placeholder={
                  LANG_TEXT[lang]
                    .placeholder
                }
                className="text-sm"
              />

              {/* MIC */}

              <button
                onClick={
                  handleVoiceInput
                }
                className="rounded-lg bg-muted px-3 hover:bg-muted/80 transition-colors"
                title="Voice input"
              >
                {listening ? (
                  <MicOff className="h-5 w-5 text-red-500 animate-pulse" />
                ) : (
                  <Mic className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* SEND */}

              <button
                onClick={() =>
                  sendMessage(input)
                }
                className="rounded-lg bg-[#F47721] hover:bg-[#E85D04] px-3 text-white transition-colors shadow-sm"
                title="Send"
              >
                <CornerDownLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOAT BUTTON */}

      <button
        onClick={() =>
          setOpen((v) => !v)
        }
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F47721] hover:bg-[#E85D04] text-white shadow-xl hover:scale-105 transition-all"
        aria-label="Open DakBot AI Chat"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
