// Generado por la skill /generar_login (2026-07-20). Edita libremente.
import type { AuthKitConfig } from "../types";

export const authKitConfig: AuthKitConfig = {
  brand: {
    "name": "Nico"
  },
  auth: {
    variant: "split",
    heroMediaType: "video",
    heroMediaSrc: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4",
    heroGradient: "linear-gradient(180deg,#b9a7ff 0%,#6a3fd6 28%,#1a1140 62%,#000 100%)",
    texts: {
      "loginTitle": "Área privada",
      "loginSubtitle": "Acceso solo para el propietario.",
      "signupTitle": "",
      "signupSubtitle": "",
      "heroLoginTitle": "Área privada",
      "heroSignupTitle": "",
      "heroSubtitle": "Acceso solo para el propietario.",
      "steps": ["", "", ""],
      "forgotTitle": "",
      "forgotSubtitle": "",
      "emailLabel": "Email",
      "passwordLabel": "Contraseña",
      "firstNameLabel": "",
      "lastNameLabel": "",
      "passwordHint": "",
      "submitLogin": "Entrar",
      "submitSignup": "",
      "submitForgot": "",
      "switchToSignup": "",
      "switchToLogin": "",
      "signupPromptText": "",
      "loginPromptText": "",
      "backToLogin": "",
      "forgotLink": "",
      "confirmEmailInfo": "",
      "genericAuthError": "No se pudo iniciar sesión. Revisa tus datos.",
      "invalidEmailError": "Introduce un email válido.",
      "passwordTooShortError": "La contraseña debe tener al menos 8 caracteres.",
      "firstNameRequiredError": "",
      "resetSentInfo": "",
      "resetFailedError": "",
      "socialPlaceholderMessage": ""
    },
  },
  // Login-only owner area: no social providers, no public signup.
  social: {
    "mode": "hidden",
    "providers": []
  },
  supabase: {
    // Fallback lets `npm run dev` boot even before .env.local has real values —
    // real calls fail gracefully (caught by useAuth) until they're supplied.
    url: import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key",
    schema: "portfolio",
  },
  roles: ["user","mid","admin"],
  storageBucket: "portfolio-avatars",
};
