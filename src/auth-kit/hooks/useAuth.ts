import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useAuthKitConfig } from "../context/KitProvider";

export class EmailConfirmationRequiredError extends Error {
  constructor() {
    super("Email confirmation required");
    this.name = "EmailConfirmationRequiredError";
  }
}

export interface SignUpInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface UseAuthResult {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const { client } = useAuthKitConfig();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, [client]);

  const signUp = useCallback(
    async ({ firstName, lastName, email, password }: SignUpInput) => {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName } },
      });
      if (error) throw error;
      if (data.user && !data.session) throw new EmailConfirmationRequiredError();
    },
    [client]
  );

  const signIn = useCallback(
    async ({ email, password }: SignInInput) => {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    [client]
  );

  const signOut = useCallback(async () => {
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }, [client]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) throw error;
    },
    [client]
  );

  return { user: session?.user ?? null, session, loading, signUp, signIn, signOut, resetPassword };
}
