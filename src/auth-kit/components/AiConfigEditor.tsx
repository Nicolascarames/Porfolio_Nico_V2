import { useEffect, useState } from "react";
import { useAuthKitConfig } from "../context/KitProvider";
import { R4Button } from "./private/R4Button";

type IntegrationId = "desktop-nav-console" | "nico-chat";

interface AiRow {
  integration_id: IntegrationId;
  enabled: boolean;
  model: string;
  personality: string;
  daily_limit: number;
  off_message: string;
  updated_at: string | null;
}

const CARDS: { id: IntegrationId; title: string }[] = [
  { id: "desktop-nav-console", title: "Terminal (desktop-nav-console)" },
  { id: "nico-chat", title: "Chat (nico-chat)" },
];

const MODELS = [
  { value: "claude-haiku-5-5", text: "Haiku 5.5" },
  { value: "claude-sonnet-5-5", text: "Sonnet 5.5" },
  { value: "claude-opus-5-5", text: "Opus 5.5" },
];

const PERSONALITY_MAX = 2000;
const OFF_MESSAGE_MAX = 300;

const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short" });

function formatTime(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : dateFormat.format(d);
}

function sanitize(row: AiRow): AiRow {
  const limit = Number.isFinite(row.daily_limit) ? Math.round(row.daily_limit) : 30;
  return {
    ...row,
    daily_limit: Math.min(1000, Math.max(1, limit)),
    personality: row.personality.slice(0, PERSONALITY_MAX),
    off_message: row.off_message.slice(0, OFF_MESSAGE_MAX),
  };
}

function isSame(a: AiRow, b: AiRow) {
  return (
    a.enabled === b.enabled &&
    a.model === b.model &&
    a.personality === b.personality &&
    a.daily_limit === b.daily_limit &&
    a.off_message === b.off_message
  );
}

const fieldClass =
  "w-full rounded-r4-md border border-glass-edge bg-glass px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-frost-100 focus:outline-none focus:ring-2 focus:ring-focus-ring";

// Owner-only editor for the AI integrations. Persists to portfolio.ai_config
// (one row per integration_id); the table is private (admin RLS only).
export function AiConfigEditor() {
  const { client } = useAuthKitConfig();
  const [saved, setSaved] = useState<AiRow[]>([]);
  const [draft, setDraft] = useState<AiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadFailed(false);
      const { data, error: fetchError } = await client.from("ai_config").select("*");
      if (cancelled) return;
      if (fetchError || !data) {
        console.error("ai_config load failed", fetchError);
        setLoadFailed(true);
      } else {
        const rows = CARDS.map((c) => (data as AiRow[]).find((r) => r.integration_id === c.id)).filter(
          (r): r is AiRow => !!r,
        );
        setSaved(rows);
        setDraft(rows);
        setError(null);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [client, reloadKey]);

  const dirty = draft.some((d) => {
    const s = saved.find((r) => r.integration_id === d.integration_id);
    return !s || !isSame(d, s);
  });

  function change(id: IntegrationId, patch: Partial<AiRow>) {
    setDraft((prev) => prev.map((r) => (r.integration_id === id ? { ...r, ...patch } : r)));
    setJustSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const clean = draft.map(sanitize);
    const now = new Date().toISOString();
    let failed = false;
    for (const row of clean) {
      const prev = saved.find((r) => r.integration_id === row.integration_id);
      if (prev && isSame(row, prev)) continue;
      const { error: saveError } = await client
        .from("ai_config")
        .update({
          enabled: row.enabled,
          model: row.model,
          personality: row.personality,
          daily_limit: row.daily_limit,
          off_message: row.off_message,
          updated_at: now,
        })
        .eq("integration_id", row.integration_id);
      if (saveError) {
        console.error("ai_config save failed", saveError);
        failed = true;
        break;
      }
    }
    setSaving(false);
    if (failed) {
      setError("No se pudo guardar. Inténtalo de nuevo.");
      return;
    }
    const stamped = clean.map((r) => ({ ...r, updated_at: now }));
    setSaved(stamped);
    setDraft(stamped);
    setJustSaved(true);
  }

  if (loading) {
    return <div className="p-6 text-ink-muted">Cargando…</div>;
  }

  if (loadFailed || draft.length === 0) {
    return (
      <div className="r4-glass flex w-full flex-col items-start gap-4 rounded-r4-xl p-6 sm:p-8">
        <p role="alert" className="text-sm text-signal-error">
          No se pudo cargar la configuración de la IA.
        </p>
        <R4Button type="button" variant="ghost" onClick={() => setReloadKey((k) => k + 1)}>
          Reintentar
        </R4Button>
      </div>
    );
  }

  const lastUpdate = saved
    .map((r) => r.updated_at)
    .filter((t): t is string => !!t)
    .sort()
    .pop();
  const updated = formatTime(lastUpdate ?? null);

  return (
    <div className="r4-glass flex w-full flex-col gap-5 rounded-r4-xl p-6 sm:p-8">
      <div>
        <p className="r4-eyebrow mb-2">Admin</p>
        <h1 className="r4-title text-3xl text-ink">IA</h1>
      </div>

      {error && (
        <p role="alert" className="text-sm text-signal-error">
          {error}
        </p>
      )}

      <div className="flex flex-col">
        {CARDS.map((card) => {
          const row = draft.find((r) => r.integration_id === card.id);
          const prev = saved.find((r) => r.integration_id === card.id);
          if (!row) return null;
          const changed = !prev || !isSame(row, prev);
          const pid = `ai-${card.id}`;
          return (
            <div key={card.id} className="flex flex-col gap-4 border-t border-glass-edge py-5 first:border-t-0 first:pt-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-ink">{card.title}</h2>
                {changed && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-frost-100 shadow-frost-glow" aria-hidden="true" />
                    modificado
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="r4-eyebrow">IA activa</span>
                <div className="r4-seg r4-glass self-start" role="group" aria-label={`IA activa, ${card.title}`}>
                  <button type="button" aria-pressed={row.enabled} onClick={() => change(card.id, { enabled: true })}>
                    Sí
                  </button>
                  <button type="button" aria-pressed={!row.enabled} onClick={() => change(card.id, { enabled: false })}>
                    No
                  </button>
                </div>
              </div>

              <label className="block" htmlFor={`${pid}-model`}>
                <span className="r4-eyebrow mb-2 block">Modelo</span>
                <select
                  id={`${pid}-model`}
                  className={`${fieldClass} h-12 py-0 sm:max-w-xs`}
                  value={row.model}
                  onChange={(e) => change(card.id, { model: e.target.value })}
                >
                  {MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.text}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block" htmlFor={`${pid}-limit`}>
                <span className="r4-eyebrow mb-2 block">Límite diario por visitante</span>
                <input
                  id={`${pid}-limit`}
                  type="number"
                  min={1}
                  max={1000}
                  step={1}
                  className={`${fieldClass} h-12 py-0 sm:max-w-xs`}
                  value={Number.isFinite(row.daily_limit) ? row.daily_limit : ""}
                  onChange={(e) => change(card.id, { daily_limit: e.target.value === "" ? NaN : Number(e.target.value) })}
                  onBlur={() => change(card.id, { daily_limit: sanitize(row).daily_limit })}
                />
              </label>

              <label className="block" htmlFor={`${pid}-personality`}>
                <span className="r4-eyebrow mb-2 block">Personalidad / tono</span>
                <textarea
                  id={`${pid}-personality`}
                  className={`${fieldClass} min-h-32`}
                  maxLength={PERSONALITY_MAX}
                  value={row.personality}
                  onChange={(e) => change(card.id, { personality: e.target.value })}
                />
                <span className="mt-1 flex justify-between gap-3 text-xs text-ink-faint">
                  <span>Se añade al prompt; los datos del CV y las reglas siguen en el código</span>
                  <span>
                    {row.personality.length}/{PERSONALITY_MAX}
                  </span>
                </span>
              </label>

              <label className="block" htmlFor={`${pid}-off`}>
                <span className="r4-eyebrow mb-2 block">Mensaje cuando está apagada o se agota el límite</span>
                <textarea
                  id={`${pid}-off`}
                  className={`${fieldClass} min-h-20`}
                  maxLength={OFF_MESSAGE_MAX}
                  value={row.off_message}
                  onChange={(e) => change(card.id, { off_message: e.target.value })}
                />
                <span className="mt-1 flex justify-end text-xs text-ink-faint">
                  {row.off_message.length}/{OFF_MESSAGE_MAX}
                </span>
              </label>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-glass-edge pt-5">
        <R4Button type="button" onClick={handleSave} disabled={!dirty} loading={saving}>
          Guardar
        </R4Button>
        <R4Button type="button" variant="ghost" onClick={() => setDraft(saved)} disabled={!dirty || saving}>
          Descartar
        </R4Button>
      </div>

      <div className="r4-hint text-left" aria-live="polite">
        {justSaved && <span className="text-signal-live">Guardado. </span>}
        {updated ? `Última actualización: ${updated}` : "Sin guardar todavía."}
      </div>
    </div>
  );
}
