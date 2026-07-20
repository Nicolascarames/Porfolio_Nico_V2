export type AuthVariant = "split" | "centered";
export type SocialMode = "hidden" | "placeholder" | "enabled";
export type SocialProvider = "google" | "github";

export interface AuthKitTexts {
  loginTitle: string;
  loginSubtitle: string;
  signupTitle: string;
  signupSubtitle: string;
  heroLoginTitle: string;
  heroSignupTitle: string;
  heroSubtitle: string;
  steps: [string, string, string];
  forgotTitle: string;
  forgotSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  firstNameLabel: string;
  lastNameLabel: string;
  passwordHint: string;
  submitLogin: string;
  submitSignup: string;
  submitForgot: string;
  switchToSignup: string;
  switchToLogin: string;
  signupPromptText: string;
  loginPromptText: string;
  backToLogin: string;
  forgotLink: string;
  confirmEmailInfo: string;
  genericAuthError: string;
  invalidEmailError: string;
  passwordTooShortError: string;
  firstNameRequiredError: string;
  resetSentInfo: string;
  resetFailedError: string;
  socialPlaceholderMessage: string;
}

export interface AuthKitBrand {
  name: string;
  logoIcon?: string;
}

export interface AuthKitConfig {
  brand: AuthKitBrand;
  auth: {
    variant: AuthVariant;
    heroMediaType: "video" | "image";
    heroMediaSrc: string;
    heroGradient: string;
    texts: AuthKitTexts;
  };
  social: {
    mode: SocialMode;
    providers: SocialProvider[];
  };
  supabase: {
    url: string;
    anonKey: string;
    schema: string;
  };
  roles: string[];
  storageBucket: string;
}
