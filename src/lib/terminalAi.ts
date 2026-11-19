// Puente entre la terminal de Sobre mí y el asistente IA (Edge Function
// chat-llm-bridge-desktop-nav, mismo proyecto Supabase que la auth).
// Espejo de Desktop_Nav/src/apps/terminal/ai.ts. Sin `handlers` el modelo solo
// conversa (terminal); el chat pasa `contact_owner`.
import { ChatLlmBridge, type ActionHandler } from './chat-llm-bridge/chat-client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/chat-llm-bridge-desktop-nav`;

/** Sin URL o anon key no hay IA: la terminal cae al mensaje 404. */
export const terminalAiAvailable = Boolean(SUPABASE_URL && ANON_KEY);

export interface TerminalAiDeps {
  onText: (delta: string) => void;
  onDone: (fullText: string) => void;
  onError: (message: string) => void;
  /** Acciones que el modelo puede ejecutar (name de la ACTION → función). */
  handlers?: Record<string, ActionHandler>;
  /** 'nico-chat' = habla como Nico en primera persona (pestaña Chat); por defecto la consola. */
  integrationId?: 'desktop-nav-console' | 'nico-chat';
}

export function createTerminalAi(deps: TerminalAiDeps): ChatLlmBridge {
  return new ChatLlmBridge({
    functionUrl: FUNCTION_URL,
    integrationId: deps.integrationId ?? 'desktop-nav-console',
    anonKey: ANON_KEY,
    maxHistory: 8, // historial corto: acota coste
    handlers: deps.handlers,
    onText: deps.onText,
    onDone: (fullText) => deps.onDone(fullText),
    onError: (e) => deps.onError(e.message),
  });
}
