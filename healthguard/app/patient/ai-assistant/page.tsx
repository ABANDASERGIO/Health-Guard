"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock, Send, Shield, Sparkles, Stethoscope } from "lucide-react";
import { useRef, useState } from "react";
import { patientApi } from "@/lib/api-client";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

const suggestedAiPrompts = [
  "Explain my latest blood pressure trend in plain language.",
  "What questions should I ask my cardiologist?",
  "Summarize lifestyle changes that support heart health.",
  "Are my logged symptoms consistent with dehydration?",
];

const aiInsights = [
  { id: "i1", title: "Blood pressure pattern", severity: "warning" as const, body: "Readings suggest elevated systolic trend — correlate with sodium intake and sleep." },
  { id: "i2", title: "Symptom correlation", severity: "info" as const, body: "Reported fatigue aligns with recent medication change timing." },
  { id: "i3", title: "Temperature stability", severity: "success" as const, body: "No fever pattern detected across logged readings." },
];

type Msg = { id: string; role: "user" | "assistant"; content: string; ts: number };

type AiPayload = { role: "system" | "user" | "assistant"; content: string };

const starter: Msg[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Hello — I am your Secure Patient Monitoring assistant. I can explain trends, summarize uploaded documents, and coach wellness questions. This channel is presented as protected for demonstration purposes.",
    ts: Date.now(),
  },
];

export default function PatientAiAssistantPage() {
  const [messages, setMessages] = useState<Msg[]>(starter);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      ts: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    try {
      const payload: AiPayload[] = [
        ...messages.map((mm) => ({ role: (mm.role === "user" ? "user" : "assistant") as AiPayload["role"], content: mm.content })),
        { role: "user", content: trimmed },
      ];

      const res = await patientApi.aiChat(payload);

      const fullText = res.data?.text ?? "Sorry, I couldn't generate a response.";
      const assistantId = crypto.randomUUID();
      const assistantMsg: Msg = { id: assistantId, role: "assistant", content: "", ts: Date.now() };
      setMessages((m) => [...m, assistantMsg]);

      // Reveal text incrementally (typewriter effect)
      const revealSpeedMs = 18; // lower = faster
      let idx = 0;
      const revealStep = () => {
        idx += 1;
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantId ? { ...msg, content: fullText.slice(0, idx) } : msg))
        );
        if (idx < fullText.length) {
          setTimeout(revealStep, revealSpeedMs);
        } else {
          setTyping(false);
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      };
      revealStep();
    } catch (err: any) {
      const assistantMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "An error occurred while contacting the AI assistant.",
        ts: Date.now(),
      };
      setMessages((m) => [...m, assistantMsg]);
      console.error("Patient AI error", err);
      setTyping(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } finally {
      // typing is cleared after incremental reveal or on error in catch
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Health Assistant"
        description="Patient-exclusive conversational workspace with privacy cues. Doctors and admins cannot access these transcripts."
        actions={
          <Badge variant="success" className="gap-1">
            <Lock className="size-3" /> Patient-only channel
          </Badge>
        }
      />

      <div className="space-y-6">
        <EncryptionBanner variant="compact" />

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-4 border-b border-border bg-muted-bg/40 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Sparkles className="size-6" />
              </span>
              <div>
                <CardTitle className="text-lg">Health copilot</CardTitle>
                <CardDescription>Typing indicators · structured cards · grounded on your monitoring context.</CardDescription>
              </div>
            </div>
            <Badge variant="primary" className="gap-1">
              <Shield className="size-3" /> Protected session UI
            </Badge>
          </CardHeader>

          <CardContent className="space-y-0 p-0">
            <div className="max-h-[560px] space-y-4 overflow-y-auto px-6 py-6">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                          <Stethoscope className="size-3.5 text-primary" /> Assistant
                        </div>
                      ) : null}
                      {m.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {typing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <span className="flex gap-1">
                    <span className="size-2 animate-bounce rounded-full bg-muted [animation-delay:-0.2s]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted [animation-delay:-0.1s]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted" />
                  </span>
                  Assistant is composing a secure response…
                </motion.div>
              ) : null}

              <div ref={bottomRef} />
            </div>

            <div className="border-t border-border bg-muted-bg/40 px-4 py-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestedAiPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    className="shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ask about symptoms, medications, or lifestyle…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send(input);
                  }}
                />
                <Button type="button" onClick={() => send(input)} aria-label="Send message">
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {aiInsights.map((ins) => (
            <Card key={ins.id}>
              <CardHeader>
                <CardTitle className="text-base">{ins.title}</CardTitle>
                <CardDescription>{ins.body}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    ins.severity === "warning"
                      ? "warning"
                      : ins.severity === "success"
                        ? "success"
                        : "primary"
                  }
                >
                  {ins.severity === "warning"
                    ? "Risk signal"
                    : ins.severity === "success"
                      ? "Stable"
                      : "Insight"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}