"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock, Search, Send, Shield, Sparkles, Stethoscope } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
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

const starter: Msg[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Hello — I am your Secure Patient Monitoring assistant. I can explain trends, summarize uploaded documents, and coach wellness questions. This channel is presented as encrypted for demonstration purposes.",
    ts: Date.now(),
  },
];

const conversations = [
  { id: "c1", title: "BP trend explanation", updated: "Today" },
  { id: "c2", title: "Medication side effects", updated: "Yesterday" },
  { id: "c3", title: "Sleep & fatigue", updated: "May 08" },
];

export default function PatientAiAssistantPage() {
  const [messages, setMessages] = useState<Msg[]>(starter);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [query, setQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const filteredConvos = useMemo(
    () => conversations.filter((c) => c.title.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

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
    await new Promise((r) => setTimeout(r, 900));
    const responses = [
      "Based on your logged vitals, systolic readings show a mild upward drift — consider discussing sodium intake and sleep consistency with your clinician.",
      "Symptoms like fatigue can have many causes. Correlate with medication changes and hydration; escalate if acute chest pain or neurologic deficits occur.",
      "Your encrypted documents indicate stable renal markers — continue prescribed therapy unless directed otherwise.",
    ];
    const assistantMsg: Msg = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: responses[Math.floor(Math.random() * responses.length)] ?? responses[0],
      ts: Date.now(),
    };
    setMessages((m) => [...m, assistantMsg]);
    setTyping(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Health Assistant"
        description="Patient-exclusive conversational workspace with simulated encryption cues. Doctors and admins cannot access these transcripts."
        actions={
          <Badge variant="success" className="gap-1">
            <Lock className="size-3" /> Patient-only channel
          </Badge>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="hidden xl:block">
          <CardHeader>
            <CardTitle className="text-base">Conversations</CardTitle>
            <CardDescription>Search encrypted chat history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted" />
              <Input
                className="pl-10"
                placeholder="Search threads…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {filteredConvos.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full rounded-xl border border-border bg-muted-bg/40 px-4 py-3 text-left text-sm font-medium hover:bg-muted-bg"
                >
                  <p>{c.title}</p>
                  <p className="text-xs text-muted">{c.updated}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

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
                <Shield className="size-3" /> Encrypted session UI
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
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted hover:border-primary hover:text-primary"
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
    </div>
  );
}