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
      "loginTitle": "Welcome back",
      "loginSubtitle": "Log in to continue to your studio.",
      "signupTitle": "Create New Profile",
      "signupSubtitle": "Input your basic details to begin the journey.",
      "heroLoginTitle": "Welcome back",
      "heroSignupTitle": "Join Nico",
      "heroSubtitle": "Follow these 3 quick phases to activate your space.",
      "steps": [
        "Register your identity",
        "Configure your studio",
        "Finalize your profile"
      ],
      "forgotTitle": "Reset password",
      "forgotSubtitle": "Enter your email and we'll send you a reset link.",
      "emailLabel": "Email",
      "passwordLabel": "Password",
      "firstNameLabel": "First Name",
      "lastNameLabel": "Last Name",
      "passwordHint": "Requires at least 8 symbols.",
      "submitLogin": "Log in",
      "submitSignup": "Create Account",
      "submitForgot": "Send reset link",
      "switchToSignup": "Sign up",
      "switchToLogin": "Log in",
      "signupPromptText": "New here? ",
      "loginPromptText": "Member of the team? ",
      "backToLogin": "Back to log in",
      "forgotLink": "Forgot password?",
      "confirmEmailInfo": "Account created! Check your email to confirm before logging in.",
      "genericAuthError": "Authentication failed. Please try again.",
      "invalidEmailError": "Please enter a valid email address.",
      "passwordTooShortError": "Password must be at least 8 characters.",
      "firstNameRequiredError": "Please enter your first name.",
      "resetSentInfo": "Check your inbox — we sent you a reset link.",
      "resetFailedError": "Could not send reset email. Please try again.",
      "socialPlaceholderMessage": "Sign in with Google and GitHub is coming soon. Please use your email and password for now."
    },
  },
  social: {
    "mode": "placeholder",
    "providers": [
      "google",
      "github"
    ]
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
