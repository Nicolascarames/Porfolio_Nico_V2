// Copied from Desktop_Nav (src/lib/chat-llm-bridge/chat-client.ts) — keep in sync manually.
// ChatLlmBridge — cliente frontend genérico para la Edge Function chat-llm-bridge.
// Framework-agnostic (vanilla TS): úsalo desde React, Vue, un juego, lo que sea.
//
// - Parsea el SSE de Groq (OpenAI-compatible, passthrough) y emite tokens vía onText.
// - Si el modelo pide una ACTION (tool call), ejecuta el handler registrado,
//   añade el resultado como mensaje "tool" al historial y continúa la conversación solo.
// - Mantiene el historial en memoria (history: "client"); recorta a los últimos
//   maxHistory mensajes para acotar coste.

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export type ActionHandler = (
  input: Record<string, unknown>,
) => string | Promise<string>;

export type ChatLlmBridgeOptions = {
  /** https://<proyecto>.supabase.co/functions/v1/chat-llm-bridge */
  functionUrl: string;
  integrationId: string;
  /** Solo para chats con verify_jwt=true: JWT del usuario logueado. */
  authToken?: string;
  /** anon key del proyecto (cabecera apikey); opcional con verify_jwt=false. */
  anonKey?: string;
  /** name de la ACTION → función que la ejecuta y devuelve un resultado textual. */
  handlers?: Record<string, ActionHandler>;
  /** Token a token, para pintar en la UI. */
  onText: (delta: string) => void;
  /** Aviso de que se ejecutó una acción (para efectos de UI, sonidos, etc.). */
  onAction?: (name: string, input: Record<string, unknown>, result: string) => void;
  /** Turno terminado (texto completo del último mensaje del asistente). */
  onDone?: (fullText: string) => void;
  onError?: (error: Error) => void;
  /** Máximo de mensajes de historial reenviados por turno (defecto 30). */
  maxHistory?: number;
};

export class ChatLlmBridge {
  messages: ChatMessage[] = [];
  #opts: ChatLlmBridgeOptions;
  #busy = false;

  constructor(opts: ChatLlmBridgeOptions) {
    this.#opts = opts;
  }

  get busy(): boolean {
    return this.#busy;
  }

  /** Envía un mensaje del usuario y gestiona el turno completo (incl. acciones). */
  async send(text: string): Promise<void> {
    if (this.#busy) throw new Error("turno en curso");
    this.#busy = true;
    this.messages.push({ role: "user", content: text });
    try {
      await this.#run();
    } catch (e) {
      this.#opts.onError?.(e instanceof Error ? e : new Error(String(e)));
    } finally {
      this.#busy = false;
    }
  }

  reset(): void {
    this.messages = [];
  }

  async #run(): Promise<void> {
    const max = this.#opts.maxHistory ?? 30;
    const window = this.messages.slice(-max);
    // Un mensaje "tool" huérfano al frente (sin su assistant con tool_calls
    // delante, recortado por la ventana) rompe la API — avanza hasta pasarlo.
    while (window.length && window[0].role === "tool") {
      window.shift();
    }

    const headers: Record<string, string> = { "content-type": "application/json" };
    if (this.#opts.anonKey) headers["apikey"] = this.#opts.anonKey;
    if (this.#opts.authToken ?? this.#opts.anonKey) {
      headers["authorization"] = `Bearer ${this.#opts.authToken ?? this.#opts.anonKey}`;
    }

    const res = await fetch(this.#opts.functionUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        integrationId: this.#opts.integrationId,
        messages: window,
      }),
    });
    if (!res.ok || !res.body) {
      throw new Error(`chat-llm-bridge ${res.status}: ${await res.text()}`);
    }

    const { message, finishReason, fullText } = await this.#parseStream(res.body);
    this.messages.push(message);

    if (finishReason === "tool_calls" && message.role === "assistant" && message.tool_calls) {
      for (const tc of message.tool_calls) {
        let input: Record<string, unknown> = {};
        try {
          input = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch {
          input = {};
        }
        const handler = this.#opts.handlers?.[tc.function.name];
        let result: string;
        try {
          result = handler ? await handler(input) : "Acción no soportada en este cliente.";
        } catch (e) {
          result = e instanceof Error ? e.message : "La acción falló.";
        }
        this.#opts.onAction?.(tc.function.name, input, result);
        this.messages.push({ role: "tool", tool_call_id: tc.id, content: result });
      }
      await this.#run(); // el modelo continúa con los resultados
      return;
    }

    this.#opts.onDone?.(fullText);
  }

  /** Parsea el SSE de Groq (chunks estilo OpenAI Chat Completions). */
  async #parseStream(body: ReadableStream<Uint8Array>): Promise<{
    message: ChatMessage;
    finishReason: string | null;
    fullText: string;
  }> {
    // TextDecoderStream's lib.dom typings don't line up cleanly with
    // ReadableStream<Uint8Array> across TS versions; the runtime pairing is
    // correct (bytes in, string out), so bridge the mismatch with a cast.
    const reader = body.pipeThrough(new TextDecoderStream() as unknown as ReadableWritablePair<string, Uint8Array>).getReader();
    let content = "";
    let hasContent = false;
    let fullText = "";
    let finishReason: string | null = null;
    const toolCalls = new Map<number, { id: string; name: string; args: string }>();
    let buffer = "";

    const handleLine = (line: string) => {
      if (!line.startsWith("data: ")) return;
      const payload = line.slice(6);
      if (payload === "[DONE]") return;
      let chunk: any;
      try {
        chunk = JSON.parse(payload);
      } catch {
        return; // ping u otra línea no-JSON
      }
      const choice = chunk.choices?.[0];
      if (!choice) return;
      const delta = choice.delta ?? {};
      if (typeof delta.content === "string" && delta.content.length > 0) {
        content += delta.content;
        hasContent = true;
        fullText += delta.content;
        this.#opts.onText(delta.content);
      }
      if (Array.isArray(delta.tool_calls)) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0;
          const entry = toolCalls.get(idx) ?? { id: "", name: "", args: "" };
          if (tc.id) entry.id = tc.id;
          if (tc.function?.name) entry.name = tc.function.name;
          if (tc.function?.arguments) entry.args += tc.function.arguments;
          toolCalls.set(idx, entry);
        }
      }
      if (choice.finish_reason) finishReason = choice.finish_reason;
    };

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) handleLine(line);
    }
    if (buffer) handleLine(buffer);

    const message: ChatMessage = toolCalls.size
      ? {
          role: "assistant",
          content: hasContent ? content : null,
          tool_calls: [...toolCalls.entries()]
            .sort(([a], [b]) => a - b)
            .map(([, tc]) => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.args },
            })),
        }
      : { role: "assistant", content };

    return { message, finishReason, fullText };
  }
}
