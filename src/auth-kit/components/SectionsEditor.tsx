import { useEffect, useState } from "react";
import { useAuthKitConfig } from "../context/KitProvider";
import { R4Button } from "./private/R4Button";
import { DEFAULT_SECTIONS, SECTION_OPTIONS, parseSections, type SectionsConfig } from "../../config/sections";
import { useApplySections } from "../../context/SectionsContext";

type RowKey = keyof SectionsConfig;

interface Row {
  key: RowKey;
  label: string;
  /** Visitors also get a visible selector for this section. */
  visitorSelector?: boolean;
}

const ROWS: Row[] = [
  { key: "projects", label: "Proyectos" },
  { key: "tech", label: "Tecnologías", visitorSelector: true },
  { key: "about", label: "Sobre mí" },
  { key: "aboutTerminal", label: "Terminal IA en Sobre mí" },
  { key: "contact", label: "Contacto", visitorSelector: true },
  { key: "device", label: "Dispositivo" },
];

const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short" });

function formatTime(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : dateFormat.format(d);
}

function describe(key: RowKey, value: SectionsConfig[RowKey]) {
  return key === "aboutTerminal" ? (value ? "Sí" : "No") : String(value);
}

// Owner-only editor for the active variant of each section. Persists to
// portfolio.site_config (id=1); the public site reads it via SectionsContext.
export function SectionsEditor() {
  const { client } = useAuthKitConfig();
  const [saved, setSaved] = useState<SectionsConfig>(DEFAULT_SECTIONS);
  const [draft, setDraft] = useState<SectionsConfig>(DEFAULT_SECTIONS);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const applySections = useApplySections();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadFailed(false);
      const { data, error: fetchError } = await client
        .from("site_config")
        .select("data, updated_at")
        .eq("id", 1)
        .maybeSingle();
      if (cancelled) return;
      if (fetchError) {
        console.error("site_config load failed", fetchError);
        setLoadFailed(true);
      } else {
        setLoadFailed(false);
        const parsed = parseSections(data?.data ?? {});
        setSaved(parsed);
        setDraft(parsed);
        setUpdatedAt(data?.updated_at ?? null);
        setError(null);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [client, reloadKey]);

  const dirty = ROWS.some((r) => draft[r.key] !== saved[r.key]);

  function change<K extends RowKey>(key: K, value: SectionsConfig[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setJustSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const now = new Date().toISOString();
    const { error: saveError } = await client.from("site_config").upsert({ id: 1, data: draft, updated_at: now });
    setSaving(false);
    if (saveError) {
      console.error("site_config save failed", saveError);
      setError("No se pudo guardar. Inténtalo de nuevo.");
      return;
    }
    setSaved(draft);
    setUpdatedAt(now);
    setJustSaved(true);
    applySections(draft);
  }

  if (loading) {
    return <div className="p-6 text-ink-muted">Cargando…</div>;
  }

  // Never edit on top of defaults when the real row couldn't be read: saving
  // would overwrite every remote value with them.
  if (loadFailed) {
    return (
      <div className="r4-glass flex w-full flex-col items-start gap-4 rounded-r4-xl p-6 sm:p-8">
        <p role="alert" className="text-sm text-signal-error">
          No se pudo cargar la configuración.
        </p>
        <R4Button type="button" variant="ghost" onClick={() => setReloadKey((k) => k + 1)}>
          Reintentar
        </R4Button>
      </div>
    );
  }

  const updated = formatTime(updatedAt);

  return (
    <div className="r4-glass flex w-full flex-col gap-5 rounded-r4-xl p-6 sm:p-8">
      <div>
        <p className="r4-eyebrow mb-2">Admin</p>
        <h1 className="r4-title text-3xl text-ink">Secciones</h1>
      </div>

      {error && (
        <p role="alert" className="text-sm text-signal-error">
          {error}
        </p>
      )}

      <div className="flex flex-col">
        {ROWS.map((row) => {
          const changed = draft[row.key] !== saved[row.key];
          const options: readonly { value: string | boolean; text: string }[] =
            row.key === "aboutTerminal"
              ? [
                  { value: true, text: "Activada" },
                  { value: false, text: "Desactivada" },
                ]
              : SECTION_OPTIONS[row.key].map((o) => ({ value: o, text: o }));
          return (
            <div key={row.key} className="flex flex-col gap-2 border-t border-glass-edge py-4 first:border-t-0 first:pt-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">{row.label}</span>
                {changed && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-frost-100 shadow-frost-glow" aria-hidden="true" />
                    modificado
                  </span>
                )}
              </div>
              <div className="r4-seg r4-glass flex-wrap self-start" role="group" aria-label={row.label}>
                {options.map((o) => (
                  <button
                    key={String(o.value)}
                    type="button"
                    aria-pressed={draft[row.key] === o.value}
                    onClick={() => change(row.key, o.value as never)}
                  >
                    {o.text}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-faint">
                Por defecto: {describe(row.key, DEFAULT_SECTIONS[row.key])}
                {row.visitorSelector && " · El visitante puede cambiarla con el selector visible."}
              </p>
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
        <R4Button type="button" variant="ghost" onClick={() => setDraft(DEFAULT_SECTIONS)} disabled={saving}>
          Restaurar valores por defecto
        </R4Button>
        <a href="/" target="_blank" rel="noopener" className="text-sm text-ink-muted hover:text-ink">
          Ver web ↗
        </a>
      </div>

      <div className="r4-hint text-left" aria-live="polite">
        {justSaved && <span className="text-signal-live">Guardado. </span>}
        {updated ? `Última actualización: ${updated}` : "Sin guardar todavía: se usan los valores por defecto."}
      </div>
    </div>
  );
}
