import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useAuthKitConfig } from "../context/KitProvider";

// Private server/production panel (/admin/panel). The data is NOT in this
// public repo: it lives in `portfolio.admin_panel` (RLS: admin only) and is
// uploaded from mapa_proyectos/panel/panel.json by
// `mapa_proyectos/scripts/subir-panel.sh`. Shape mirrors that JSON.

interface PanelData {
  meta: { actualizado: string; fuente: string; aviso_secretos: string };
  huecos: { hueco: string; que_es: string }[];
  servidor: {
    resumen: string;
    sistema: string;
    hardware: string;
    seguridad: string[];
    acceso: { metodo: string; comando: string; cuando: string }[];
    carpetas: { ruta: string; que: string }[];
  };
  instalado: { nombre: string; version: string; para_que: string; estado: string }[];
  servicios: { nombre: string; como_corre: string; acceso: string; estado: string; notas: string }[];
  comandos: { grupo: string; items: { cmd: string; que: string }[] }[];
  dominio: {
    nombre: string;
    registrador: string;
    alta: string;
    caduca: string;
    renovacion: string;
    dns: string;
    comprobado: string;
    registros: { nombre: string; tipo: string; destino: string; proxy: string; estado: string; alta?: string }[];
    no_existe: { nombre: string; por_que_importa: string; como: string }[];
    receta_subdominio: string[];
    reglas: string[];
  };
  webs: { nombre: string; proyecto: string; url: string; otras?: string[]; publica: boolean; estado: string }[];
  webs_comprobadas: string;
  paquetes: { nombre: string; url: string; version: string; notas: string }[];
  proyectos: {
    nombre: string;
    que: string;
    estado: string;
    etiqueta: string;
    stack: string;
    repo: string;
    privado: boolean;
    web: string | null;
    ultimo_commit: string;
  }[];
  paneles: { nombre: string; url: string }[];
  pendientes: { que: string; prioridad: string; proyecto: string }[];
}

const SECTIONS = [
  ["servidor", "Servidor"],
  ["comandos", "Comandos"],
  ["instalado", "Instalado"],
  ["servicios", "Servicios"],
  ["dominio", "Dominio"],
  ["webs", "Webs"],
  ["proyectos", "Proyectos"],
  ["enlaces", "Enlaces"],
  ["pendientes", "Pendientes"],
] as const;

const PROJECT_STATE: Record<string, string> = {
  produccion: "🟢 producción",
  a_medias: "🟡 a medias",
  construccion: "🟠 en construcción",
  plan: "⚪ solo plan",
};

export function ServerPanel() {
  const { client } = useAuthKitConfig();
  const [panel, setPanel] = useState<PanelData | null>(null);
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error: fetchError } = await client
        .from("admin_panel")
        .select("data, updated_at")
        .eq("id", 1)
        .maybeSingle();
      if (cancelled) return;
      if (fetchError) setError(fetchError.message);
      else if (!data) setError("El panel todavía no se ha subido (mapa_proyectos/scripts/subir-panel.sh).");
      else {
        setPanel(data.data as PanelData);
        setUploadedAt(data.updated_at as string);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [client]);

  if (loading) return <div className="p-6 text-white/50">Cargando…</div>;
  if (error || !panel) return <Card><p className="text-sm text-red-300">{error}</p></Card>;

  const { servidor, dominio } = panel;

  return (
    <div className="flex w-full flex-col gap-6">
      <Card>
        <h2 className="text-xl font-semibold text-white">Panel del servidor</h2>
        <p className="text-sm text-white/55">
          Datos a {panel.meta.actualizado}
          {uploadedAt && ` · subido el ${new Date(uploadedAt).toLocaleString("es-ES")}`}
        </p>
        <p className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100/80">
          {panel.meta.aviso_secretos}
        </p>
        <nav className="flex flex-wrap gap-2 pt-1">
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#panel-${id}`}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 hover:border-white/30 hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>
      </Card>

      <Section id="servidor" title="Servidor">
        <p className="text-sm text-white/80">{servidor.resumen}</p>
        <Facts
          rows={[
            ["Sistema", servidor.sistema],
            ["Hardware", servidor.hardware],
          ]}
        />
        <SubTitle>Cómo entrar</SubTitle>
        <ul className="flex flex-col gap-3">
          {servidor.acceso.map((a) => (
            <li key={a.metodo} className="flex flex-col gap-1">
              <span className="text-sm text-white">{a.metodo}</span>
              <Cmd cmd={a.comando} />
              <span className="text-xs text-white/45">{a.cuando}</span>
            </li>
          ))}
        </ul>
        <SubTitle>Seguridad</SubTitle>
        <Bullets items={servidor.seguridad} />
        <SubTitle>Carpetas</SubTitle>
        <Facts rows={servidor.carpetas.map((c) => [c.ruta, c.que])} mono />
        <SubTitle>Huecos (valores en datos-sensibles.md)</SubTitle>
        <Facts rows={panel.huecos.map((h) => [h.hueco, h.que_es])} mono />
      </Section>

      <Section id="comandos" title="Comandos">
        {panel.comandos.map((g) => (
          <div key={g.grupo} className="flex flex-col gap-2">
            <SubTitle>{g.grupo}</SubTitle>
            {g.items.map((c) => (
              <div key={c.cmd} className="flex flex-col gap-1">
                <Cmd cmd={c.cmd} />
                <span className="text-xs text-white/45">{c.que}</span>
              </div>
            ))}
          </div>
        ))}
      </Section>

      <Section id="instalado" title="Instalado">
        <ul className="flex flex-col divide-y divide-white/10">
          {panel.instalado.map((i) => (
            <li key={i.nombre} className="flex flex-col gap-0.5 py-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm text-white">{i.nombre}</span>
                <span className="font-mono text-xs text-white/40">{i.version}</span>
                <Status value={i.estado} />
              </div>
              <span className="text-xs text-white/55">{i.para_que}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="servicios" title="Servicios en marcha">
        <ul className="flex flex-col divide-y divide-white/10">
          {panel.servicios.map((s) => (
            <li key={s.nombre} className="flex flex-col gap-1 py-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm text-white">{s.nombre}</span>
                <Status value={s.estado} />
              </div>
              <span className="text-xs text-white/55">{s.como_corre}</span>
              {s.acceso && <span className="font-mono text-xs text-white/70">{s.acceso}</span>}
              {s.notas && <span className="text-xs text-white/45">{s.notas}</span>}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="dominio" title={`Dominio · ${dominio.nombre}`}>
        <Facts
          rows={[
            ["Registrador", dominio.registrador],
            ["Alta / caduca", `${dominio.alta} → ${dominio.caduca} (${dominio.renovacion})`],
            ["DNS", dominio.dns],
            ["Comprobado", dominio.comprobado],
          ]}
        />
        <SubTitle>Lo que hay</SubTitle>
        <ul className="flex flex-col divide-y divide-white/10">
          {dominio.registros.map((r) => (
            <li key={r.nombre} className="flex flex-col gap-0.5 py-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-sm text-white">{r.nombre}</span>
                <Status value={r.estado} />
              </div>
              <span className="text-xs text-white/55">
                {r.tipo} → {r.destino} · nube {r.proxy}
                {r.alta && ` · alta ${r.alta}`}
              </span>
            </li>
          ))}
        </ul>
        <SubTitle>Lo que no hay</SubTitle>
        <ul className="flex flex-col divide-y divide-white/10">
          {dominio.no_existe.map((n) => (
            <li key={n.nombre} className="flex flex-col gap-0.5 py-2">
              <span className="font-mono text-sm text-white">{n.nombre}</span>
              <span className="text-xs text-white/55">{n.por_que_importa}</span>
              <span className="text-xs text-white/45">Cómo: {n.como}</span>
            </li>
          ))}
        </ul>
        <SubTitle>Añadir un subdominio</SubTitle>
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-white/80">
          {dominio.receta_subdominio.map((paso) => (
            <li key={paso}>{paso}</li>
          ))}
        </ol>
        <SubTitle>Reglas</SubTitle>
        <Bullets items={dominio.reglas} />
      </Section>

      <Section id="webs" title="Webs publicadas">
        <p className="text-xs text-white/45">Comprobadas: {panel.webs_comprobadas}</p>
        <ul className="flex flex-col divide-y divide-white/10">
          {panel.webs.map((w) => (
            <li key={w.url} className="flex flex-col gap-0.5 py-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm text-white">{w.nombre}</span>
                <span className="text-xs text-white/40">{w.proyecto}</span>
                <Status value={w.estado} />
                {!w.publica && <span className="text-xs text-white/40">privada</span>}
              </div>
              <Link href={w.url} />
              {w.otras && w.otras.length > 0 && (
                <span className="text-xs text-white/45">También: {w.otras.join(" · ")}</span>
              )}
            </li>
          ))}
        </ul>
        {panel.paquetes.length > 0 && (
          <>
            <SubTitle>Paquetes publicados</SubTitle>
            <ul className="flex flex-col gap-2">
              {panel.paquetes.map((p) => (
                <li key={p.nombre} className="flex flex-col gap-0.5">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <a href={p.url} target="_blank" rel="noreferrer" className="text-sm text-white hover:underline">
                      {p.nombre}
                    </a>
                    <span className="font-mono text-xs text-white/40">{p.version}</span>
                  </div>
                  <span className="text-xs text-white/45">{p.notas}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <Section id="proyectos" title="Proyectos">
        <ul className="flex flex-col divide-y divide-white/10">
          {panel.proyectos.map((p) => (
            <li key={p.nombre} className="flex flex-col gap-0.5 py-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm text-white">{p.nombre}</span>
                <span className="text-xs text-white/55">
                  {PROJECT_STATE[p.estado] ?? p.estado}
                  {p.etiqueta && ` · ${p.etiqueta}`}
                </span>
              </div>
              <span className="text-xs text-white/55">
                {p.que} · {p.stack} · último commit {p.ultimo_commit}
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <a href={p.repo} target="_blank" rel="noreferrer" className="text-white/70 hover:text-white hover:underline">
                  Repo{p.privado ? " (privado)" : ""}
                </a>
                {p.web && <Link href={p.web} />}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="enlaces" title="Enlaces a paneles">
        <ul className="flex flex-col gap-2">
          {panel.paneles.map((p) => (
            <li key={p.nombre} className="flex flex-col gap-0.5">
              <span className="text-sm text-white">{p.nombre}</span>
              {/* Some URLs keep a <HUECO> (e.g. n8n by Tailscale IP): shown as text, not a broken link. */}
              {p.url.includes("<") ? <span className="font-mono text-xs text-white/55">{p.url}</span> : <Link href={p.url} />}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="pendientes" title="Pendientes">
        <ul className="flex flex-col divide-y divide-white/10">
          {panel.pendientes.map((p) => (
            <li key={p.que} className="flex flex-wrap items-baseline gap-2 py-2">
              <Priority value={p.prioridad} />
              <span className="text-sm text-white/85">{p.que}</span>
              <span className="text-xs text-white/40">{p.proyecto}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-[28px] border border-white/10 bg-surface p-6 shadow-card sm:p-8">
      {children}
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={`panel-${id}`} className="scroll-mt-24">
      <Card>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {children}
      </Card>
    </section>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return <h4 className="pt-2 text-xs font-medium uppercase tracking-wider text-white/40">{children}</h4>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-white/80">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

function Facts({ rows, mono = false }: { rows: [string, string][]; mono?: boolean }) {
  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className={`text-white/45 ${mono ? "font-mono text-xs sm:pt-0.5" : ""}`}>{k}</dt>
          <dd className="mb-2 text-white/80 sm:mb-0">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Cmd({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (non-HTTPS, permissions): the text is still selectable.
    }
  }
  return (
    <div className="flex items-start gap-2 rounded-lg bg-black/40 px-3 py-2">
      <code className="min-w-0 flex-1 break-all font-mono text-xs text-emerald-200/90">{cmd}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copiar: ${cmd}`}
        className="shrink-0 text-white/40 hover:text-white"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function Link({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 break-all text-xs text-sky-300/90 hover:underline"
    >
      {href.replace(/^https?:\/\//, "")}
      <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  );
}

function Status({ value }: { value: string }) {
  const ok = value === "ok";
  return (
    <span className={`text-xs ${ok ? "text-emerald-300/80" : "text-amber-300/80"}`}>
      {ok ? "● ok" : `● ${value}`}
    </span>
  );
}

function Priority({ value }: { value: string }) {
  const color =
    value === "alta" ? "text-red-300/90" : value === "media" ? "text-amber-300/90" : "text-white/45";
  return <span className={`w-12 shrink-0 text-xs font-medium ${color}`}>{value}</span>;
}
