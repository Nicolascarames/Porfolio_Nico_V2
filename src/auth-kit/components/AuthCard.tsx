import { useState, type ChangeEvent, type FormEvent } from "react";
import { Eye, EyeOff, User as UserIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useAuthKitConfig } from "../context/KitProvider";
import { useAuth } from "../hooks/useAuth";
import { InputGroup } from "./InputGroup";
import { PrimaryButton } from "./PrimaryButton";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface AuthCardProps {
  onAuthenticated?: () => void;
  /** Error shown above the form (e.g. "Acceso restringido." after an owner-gate sign-out). */
  notice?: string;
}

export function AuthCard({ onAuthenticated, notice }: AuthCardProps) {
  const { config } = useAuthKitConfig();
  const { signIn } = useAuth();
  const { auth, brand } = config;
  const t = auth.texts;

  const LogoIcon =
    (LucideIcons as unknown as Record<string, typeof UserIcon>)[brand.logoIcon ?? ""] ?? UserIcon;

  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!EMAIL_RE.test(form.email)) return setError(t.invalidEmailError);
    if (form.password.length < 8) return setError(t.passwordTooShortError);
    setLoading(true);
    try {
      await signIn({ email: form.email, password: form.password });
      onAuthenticated?.();
    } catch {
      setError(t.genericAuthError);
    } finally {
      setLoading(false);
    }
  }

  const shownError = error || notice;

  const activeForm = (
    <form onSubmit={submit} noValidate className="flex w-full max-w-xl flex-col gap-5 sm:gap-6">
      <div>
        <h1 className="text-[38px] font-medium leading-tight tracking-tight">{t.loginTitle}</h1>
        <p className="mt-2 text-base text-white/40">{t.loginSubtitle}</p>
      </div>

      <InputGroup label={t.emailLabel} type="email" value={form.email} onChange={set("email")} />

      <InputGroup
        label={t.passwordLabel}
        type={show ? "text" : "password"}
        value={form.password}
        onChange={set("password")}
        trailing={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label="Mostrar u ocultar contraseña"
            className="text-white/50"
          >
            {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        }
      />

      {shownError && (
        <div className="rounded-[10px] border border-red-400/25 bg-red-400/10 px-3.5 py-2.5 text-[13px] text-red-200">
          {shownError}
        </div>
      )}

      <PrimaryButton type="submit" loading={loading} data-testid="auth-submit" className="mt-1">
        {t.submitLogin}
      </PrimaryButton>
    </form>
  );

  const heroMedia = (className: string) =>
    auth.heroMediaType === "video" ? (
      <video autoPlay muted loop playsInline className={className}>
        <source src={auth.heroMediaSrc} type="video/mp4" />
      </video>
    ) : (
      <img src={auth.heroMediaSrc} alt="" className={className} />
    );

  const hero = (
    <div
      className="relative flex h-full flex-col items-center justify-end overflow-hidden rounded-3xl px-12 pb-32 shadow-2xl"
      style={{ background: auth.heroGradient }}
    >
      {heroMedia("absolute inset-0 h-full w-full object-cover")}
      <div className="absolute inset-0 bg-black/15" />
      <div className="relative z-10 w-full max-w-xs space-y-8">
        <div className="flex items-center gap-2.5">
          <LogoIcon className="h-[18px] w-[18px] fill-white text-white" />
          <span className="text-xl font-semibold tracking-tight">{brand.name}</span>
        </div>
        <div>
          <h2 className="whitespace-nowrap text-4xl font-medium tracking-tight">
            {t.heroLoginTitle}
          </h2>
          <p className="mt-3 px-1 text-sm leading-relaxed text-white/60">{t.heroSubtitle}</p>
        </div>
      </div>
    </div>
  );

  if (auth.variant === "centered") {
    return (
      <main className="relative flex min-h-screen w-full items-center justify-center p-6">
        {heroMedia("fixed inset-0 z-0 h-full w-full object-cover")}
        <div className="fixed inset-0 z-[1] bg-gradient-to-b from-black/45 to-black/80" />
        <div className="relative z-[2] w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0a0a0c]/70 p-8 shadow-card backdrop-blur-xl sm:p-12">
          <div className="mb-6 flex items-center gap-2.5">
            <LogoIcon className="h-[18px] w-[18px] fill-white text-white" />
            <span className="text-lg font-semibold">{brand.name}</span>
          </div>
          {activeForm}
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <main className="relative flex flex-1 w-full gap-4 lg:h-screen lg:overflow-hidden lg:p-4">
        <div className="absolute inset-0 z-0 overflow-hidden lg:hidden">
          {heroMedia("h-full w-full object-cover")}
          <div className="absolute inset-0 bg-black/72" />
        </div>
        <div className="hidden w-[52%] shrink-0 lg:block">{hero}</div>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-12 sm:px-12 lg:px-16 lg:py-6 xl:px-24">
          {activeForm}
        </div>
      </main>
    </div>
  );
}
