import { useState, type ChangeEvent, type FormEvent } from "react";
import { Chrome, Eye, EyeOff, Github, User as UserIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useAuthKitConfig } from "../context/KitProvider";
import { EmailConfirmationRequiredError, useAuth } from "../hooks/useAuth";
import { InputGroup } from "./InputGroup";
import { PrimaryButton } from "./PrimaryButton";
import { SocialButton } from "./SocialButton";
import { StepItem } from "./StepItem";
import { SocialPlaceholderModal } from "./SocialPlaceholderModal";

type Mode = "signup" | "login" | "forgot";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface AuthCardProps {
  onAuthenticated?: () => void;
}

export function AuthCard({ onAuthenticated }: AuthCardProps) {
  const { config } = useAuthKitConfig();
  const { signUp, signIn, resetPassword } = useAuth();
  const { auth, brand, social } = config;
  const t = auth.texts;

  const LogoIcon =
    (LucideIcons as unknown as Record<string, typeof UserIcon>)[brand.logoIcon ?? ""] ?? UserIcon;

  const [mode, setMode] = useState<Mode>("login");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showSocialModal, setShowSocialModal] = useState(false);

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function switchMode(m: "signup" | "login") {
    setMode(m);
    setError("");
    setInfo("");
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!EMAIL_RE.test(form.email)) return setError(t.invalidEmailError);
    setLoading(true);
    try {
      await resetPassword(form.email);
      setInfo(t.resetSentInfo);
    } catch {
      setError(t.resetFailedError);
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!EMAIL_RE.test(form.email)) return setError(t.invalidEmailError);
    if (form.password.length < 8) return setError(t.passwordTooShortError);
    if (isSignup && !form.firstName.trim()) return setError(t.firstNameRequiredError);
    setLoading(true);
    try {
      if (isSignup) {
        await signUp(form);
      } else {
        await signIn({ email: form.email, password: form.password });
      }
      onAuthenticated?.();
    } catch (err) {
      if (err instanceof EmailConfirmationRequiredError) {
        setInfo(t.confirmEmailInfo);
      } else {
        setError(t.genericAuthError);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSocialClick() {
    if (social.mode === "placeholder") setShowSocialModal(true);
  }

  const socialButtons =
    social.mode === "hidden" ? null : (
      <div className="grid grid-cols-2 gap-4">
        {social.providers.includes("google") && (
          <SocialButton
            icon={<Chrome className="h-[18px] w-[18px]" />}
            label="Google"
            onClick={handleSocialClick}
          />
        )}
        {social.providers.includes("github") && (
          <SocialButton
            icon={<Github className="h-[18px] w-[18px]" />}
            label="Github"
            onClick={handleSocialClick}
          />
        )}
      </div>
    );

  const forgotForm = (
    <form onSubmit={handleForgot} noValidate className="flex w-full max-w-xl flex-col gap-5 sm:gap-6">
      <div>
        <h1 className="text-[38px] font-medium leading-tight tracking-tight">{t.forgotTitle}</h1>
        <p className="mt-2 text-base text-white/40">{t.forgotSubtitle}</p>
      </div>
      <InputGroup label={t.emailLabel} type="email" value={form.email} onChange={set("email")} />
      {error && (
        <div className="rounded-[10px] border border-red-400/25 bg-red-400/10 px-3.5 py-2.5 text-[13px] text-red-200">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-[10px] border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2.5 text-[13px] text-emerald-200">
          {info}
        </div>
      )}
      <PrimaryButton type="submit" loading={loading} data-testid="auth-submit" className="mt-1">
        {t.submitForgot}
      </PrimaryButton>
      <button
        type="button"
        onClick={() => switchMode("login")}
        className="text-center text-sm text-white/40 hover:text-white"
      >
        {t.backToLogin}
      </button>
    </form>
  );

  const mainForm = (
    <form onSubmit={submit} noValidate className="flex w-full max-w-xl flex-col gap-5 sm:gap-6">
      <div className="flex gap-1 self-start rounded-xl bg-surface p-1">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            data-testid={`auth-tab-${m}`}
            onClick={() => switchMode(m)}
            className={`rounded-[9px] px-[18px] py-2 text-sm font-medium transition-colors ${
              mode === m ? "bg-white text-black" : "text-white/55 hover:text-white"
            }`}
          >
            {m === "signup" ? t.switchToSignup : t.switchToLogin}
          </button>
        ))}
      </div>

      <div>
        <h1 className="text-[38px] font-medium leading-tight tracking-tight">
          {isSignup ? t.signupTitle : t.loginTitle}
        </h1>
        <p className="mt-2 text-base text-white/40">{isSignup ? t.signupSubtitle : t.loginSubtitle}</p>
      </div>

      {socialButtons}

      {social.mode !== "hidden" && (
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
      )}

      {isSignup && (
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label={t.firstNameLabel} value={form.firstName} onChange={set("firstName")} />
          <InputGroup label={t.lastNameLabel} value={form.lastName} onChange={set("lastName")} />
        </div>
      )}

      <InputGroup label={t.emailLabel} type="email" value={form.email} onChange={set("email")} />

      <div>
        <InputGroup
          label={t.passwordLabel}
          type={show ? "text" : "password"}
          value={form.password}
          onChange={set("password")}
          trailing={
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label="Toggle password"
              className="text-white/50"
            >
              {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          }
        />
        {isSignup ? (
          <p className="mt-2 text-[13px] text-white/40">{t.passwordHint}</p>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setError("");
              setInfo("");
            }}
            className="mt-2 text-[13px] text-white/55 hover:text-white"
          >
            {t.forgotLink}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-[10px] border border-red-400/25 bg-red-400/10 px-3.5 py-2.5 text-[13px] text-red-200">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-[10px] border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2.5 text-[13px] text-emerald-200">
          {info}
        </div>
      )}

      <PrimaryButton type="submit" loading={loading} data-testid="auth-submit" className="mt-1">
        {isSignup ? t.submitSignup : t.submitLogin}
      </PrimaryButton>

      <p className="text-center text-sm text-white/40">
        {isSignup ? t.loginPromptText : t.signupPromptText}
        <button
          type="button"
          onClick={() => switchMode(isSignup ? "login" : "signup")}
          className="font-semibold text-white"
        >
          {isSignup ? t.switchToLogin : t.switchToSignup}
        </button>
      </p>
    </form>
  );

  const activeForm = isForgot ? forgotForm : mainForm;

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
            {isSignup ? t.heroSignupTitle : t.heroLoginTitle}
          </h2>
          <p className="mt-3 px-1 text-sm leading-relaxed text-white/60">{t.heroSubtitle}</p>
        </div>
        <div className="space-y-2.5">
          {t.steps.map((step, i) => (
            <StepItem key={step} number={i + 1} text={step} active={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );

  const socialModal = showSocialModal && (
    <SocialPlaceholderModal message={t.socialPlaceholderMessage} onClose={() => setShowSocialModal(false)} />
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
        {socialModal}
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
      {socialModal}
    </div>
  );
}
