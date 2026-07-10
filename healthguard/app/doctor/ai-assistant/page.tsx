"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList, Lock, Send, Shield, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { doctorApi } from "@/lib/api-client";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { doctorAiInsights, doctorAiStarterMessage, doctorSuggestedAiPrompts } from "@/mock-data/doctor-ai";
import AiMarkdown from "@/components/ai/ai-markdown";


type Msg = { id: string; role: "user" | "assistant"; content: string; ts: number };
type AiPayload = { role: "system" | "user" | "assistant"; content: string };

const starter: Msg[] = [
  {
    id: "m1",
    role: "assistant",
    content: doctorAiStarterMessage,
    ts: Date.now(),
  },
];

export default function DoctorAiAssistantPage() {
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

      const res = await doctorApi.aiChat(payload);
      const fullText = res.data?.text ?? "Sorry, I couldn't generate a response.";
      const assistantId = crypto.randomUUID();
      const assistantMsg: Msg = { id: assistantId, role: "assistant", content: "", ts: Date.now() };
      setMessages((m) => [...m, assistantMsg]);

      const revealSpeedMs = 14;
      let idx = 0;
      const revealStep = () => {
        idx += 1;
        setMessages((prev) => prev.map((msg) => (msg.id === assistantId ? { ...msg, content: fullText.slice(0, idx) } : msg)));
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
      console.error("Doctor AI error", err);
      setTyping(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="AI Clinical Assistant"
        description="Doctor-exclusive workspace for documentation support and cohort insights. Separate from patient AI chats — approved patient access is required."
        actions={
          <Badge variant="success" className="gap-1">
            <Lock className="size-3" /> Doctor-only channel
          </Badge>
        }
      />

      <div className="space-y-4 md:space-y-6">
        <EncryptionBanner variant="compact" />

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-4 border-b border-border bg-muted-bg/40 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Sparkles className="size-6" />
              </span>
              <div>
                <CardTitle className="text-lg">Clinical copilot</CardTitle>
                <CardDescription>
                  Documentation drafts · cohort signals · evidence prompts (demo responses).
                </CardDescription>
              </div>
            </div>
            <Badge variant="primary" className="shrink-0 gap-1">
              <Shield className="size-3" /> Secure session
            </Badge>
          </CardHeader>

          <CardContent className="space-y-0 p-0">
            <div className="max-h-[min(560px,65vh)] space-y-4 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
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
                      className={`max-w-[min(100%,32rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <motion.div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                          <ClipboardList className="size-3.5 text-primary" /> Assistant
                        </motion.div>
                      ) : null}
                      <AiMarkdown content={m.content} />
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

            <div className="border-t border-border bg-muted-bg/40 px-3 py-3 md:px-4 md:py-4">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
                {doctorSuggestedAiPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary md:py-1"
                  >
                    {p.length > 48 ? `${p.slice(0, 48)}…` : p}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ask about patients, care plans, or documentation…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                />
                <Button type="button" onClick={() => send(input)} aria-label="Send message">
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {doctorAiInsights.map((ins) => (
            <Card key={ins.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{ins.title}</CardTitle>
                <CardDescription>{ins.body}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    ins.severity === "warning"
                      ? "warning"
                      : ins.severity === "danger"
                        ? "danger"
                        : "primary"
                  }
                >
                  {ins.severity === "warning"
                    ? "Review"
                    : ins.severity === "danger"
                      ? "Critical"
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
