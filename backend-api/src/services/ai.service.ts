import { GoogleGenAI } from "@google/genai";

export type AiMessageRole = "system" | "user" | "assistant";

export interface AiMessage {
  role: AiMessageRole;
  content: string;
}

export interface AiService {
  chat(messages: AiMessage[], options?: { temperature?: number; maxOutputTokens?: number }): Promise<string>;
  summarize(text: string, options?: { temperature?: number; maxOutputTokens?: number }): Promise<string>;
}

function stripQuotedValue(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

const geminiModel = stripQuotedValue(process.env.GEMINI_MODEL) || "gemini-2.5-flash";
const geminiApiKey = stripQuotedValue(process.env.GEMINI_API_KEY);

function ensureGeminiApiKey(): string {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY must be configured to use Gemini AI services.");
  }
  return geminiApiKey;
}

const systemInstructions = `You are a healthcare assistant for the Patient Monitoring System.

- Respond only to healthcare and medical-related questions.
- Politely refuse non-medical questions by replying: "I'm a healthcare assistant designed to answer medical and health-related questions only. I cannot assist with topics outside healthcare."
- Summarize uploaded medical documents, including consultation reports, laboratory reports, prescriptions, referral letters, discharge summaries, and medical certificates.
- Explain medical reports and prescriptions in simple language that patients can easily understand.
- Generate concise summaries for doctors reviewing long medical documents.
- Never diagnose diseases, recommend treatments, prescribe medications, or replace a healthcare professional.
- Always include a short disclaimer reminding users that the AI is an assistant and that medical decisions should always be made by a qualified healthcare professional.
- Keep responses professional, concise, accurate, and focused on patient safety and privacy.`;

function buildMessageText(messages: AiMessage[]) {
  return [
    { role: "system", content: systemInstructions },
    ...messages,
  ]
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n\n");
}

function buildGenerationConfig(options?: { temperature?: number; maxOutputTokens?: number }) {
  const config: Record<string, unknown> = {};
  if (typeof options?.temperature === "number") {
    config.temperature = options.temperature;
  }
  if (typeof options?.maxOutputTokens === "number") {
    config.maxOutputTokens = options.maxOutputTokens;
  }
  return Object.keys(config).length > 0 ? config : undefined;
}

class GeminiAiService implements AiService {
  private readonly client = new GoogleGenAI({ apiKey: ensureGeminiApiKey() });

  private convertMessages(messages: AiMessage[]) {
    return messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join("\n\n");
  }

  private buildConfig(options?: { temperature?: number; maxOutputTokens?: number }) {
    const config: Record<string, unknown> = {};
    if (typeof options?.temperature === "number") {
      config.temperature = options.temperature;
    }
    if (typeof options?.maxOutputTokens === "number") {
      config.maxOutputTokens = options.maxOutputTokens;
    }
    return Object.keys(config).length > 0 ? config : undefined;
  }

  private async generateContent(prompt: string, options?: { temperature?: number; maxOutputTokens?: number }) {
    try {
      const response = await this.client.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: this.buildConfig(options),
      });

      const text = response?.text?.trim();
      if (!text) {
        throw new Error(`Gemini AI returned an empty response: ${JSON.stringify(response)}`);
      }

      return text;
    } catch (error: any) {
      const message = error?.message || "Unknown Gemini AI error.";
      throw new Error(`Gemini AI failed: ${message}`);
    }
  }

  async chat(messages: AiMessage[], options?: { temperature?: number; maxOutputTokens?: number }) {
    if (!messages?.length) {
      throw new Error("At least one chat message is required.");
    }

    const prompt = buildMessageText(messages);
    return this.generateContent(prompt, options);
  }

  async summarize(text: string, options?: { temperature?: number; maxOutputTokens?: number }) {
    if (!text?.trim()) {
      throw new Error("Text must be provided for summarization.");
    }

    return this.generateContent(text, options);
  }
}

export const aiService: AiService = new GeminiAiService();
