import { useCallback, useEffect, useState } from "react";
import { useAuthKitConfig } from "../context/KitProvider";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateUsername: (username: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const { client, config } = useAuthKitConfig();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    let { data, error: fetchError } = await client.from("profiles").select("*").eq("id", user.id).single();

    // PGRST116 = no row matched `.single()`. This is expected the first time
    // an account that already existed (shared auth.users across apps, e.g. a
    // user who signed up on a different app in the same Supabase project)
    // logs into THIS app: the signup trigger only ever fires for brand-new
    // `auth.users` inserts, so it never ran for them here. Self-provision a
    // row now instead of leaving the user stuck on a permanent error —
    // RLS's own insert-own policy already allows this (auth.uid() = id).
    if (fetchError?.code === "PGRST116") {
      const emailPrefix = (user.email ?? "user").split("@")[0];
      const inserted = await client
        .from("profiles")
        .insert({ id: user.id, username: `${emailPrefix}_${user.id.slice(0, 6)}` })
        .select("*")
        .single();
      data = inserted.data;
      fetchError = inserted.error;
    }

    if (fetchError) {
      setError(fetchError.message);
      setProfile(null);
    } else {
      setProfile(data as Profile);
      setError(null);
    }
    setLoading(false);
  }, [client, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateUsername = useCallback(
    async (username: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error: updateError } = await client.from("profiles").update({ username }).eq("id", user.id);
      if (updateError) throw updateError;
      setProfile((p) => (p ? { ...p, username } : p));
    },
    [client, user]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) throw new Error("Not authenticated");
      const extension = file.name.split(".").pop() ?? "png";
      const path = `${user.id}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await client.storage
        .from(config.storageBucket)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = client.storage.from(config.storageBucket).getPublicUrl(path);
      const avatarUrl = publicUrlData.publicUrl;
      const { error: updateError } = await client
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);
      if (updateError) throw updateError;
      setProfile((p) => (p ? { ...p, avatar_url: avatarUrl } : p));
    },
    [client, config.storageBucket, user]
  );

  const changeEmail = useCallback(
    async (newEmail: string) => {
      const { error: updateError } = await client.auth.updateUser({ email: newEmail });
      if (updateError) throw updateError;
    },
    [client]
  );

  return { profile, loading, error, updateUsername, uploadAvatar, changeEmail, refresh };
}
