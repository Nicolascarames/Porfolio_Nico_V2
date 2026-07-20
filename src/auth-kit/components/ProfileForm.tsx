import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useProfile } from "../hooks/useProfile";
import { InputGroup } from "./InputGroup";
import { PrimaryButton } from "./PrimaryButton";

export function ProfileForm() {
  const { profile, loading, error, updateUsername, uploadAvatar, changeEmail } = useProfile();
  const [username, setUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return <div className="p-6 text-white/50">Loading…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-300">Could not load your profile: {error}</div>;
  }

  if (!profile) {
    return <div className="p-6 text-white/50">No profile found for this account.</div>;
  }

  const currentUsername = username || profile.username || "";

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setMessage(null);
    try {
      await uploadAvatar(file);
      setMessage({ type: "success", text: "Avatar updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Could not upload avatar" });
    } finally {
      setSaving(false);
    }
  }

  async function handleUsernameSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateUsername(currentUsername);
      setMessage({ type: "success", text: "Profile updated" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Could not save" });
    } finally {
      setSaving(false);
    }
  }

  async function handleEmailSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await changeEmail(newEmail);
      setMessage({ type: "success", text: "Check both your old and new inbox to confirm the email change" });
      setEditingEmail(false);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Could not change email" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-brand-gray"
          aria-label="Change avatar"
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-lg font-semibold text-white/60">
              {(profile.username ?? "?").slice(0, 1).toUpperCase()}
            </span>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        <div>
          <p className="text-sm font-semibold text-white">{profile.username}</p>
          <p className="text-xs capitalize text-white/40">{profile.role}</p>
        </div>
      </div>

      <form onSubmit={handleUsernameSave} noValidate className="flex flex-col gap-4">
        <InputGroup label="Username" value={currentUsername} onChange={(e) => setUsername(e.target.value)} />
        <PrimaryButton type="submit" loading={saving} data-testid="profile-save-username">
          Save changes
        </PrimaryButton>
      </form>

      {editingEmail ? (
        <form onSubmit={handleEmailSave} noValidate className="flex flex-col gap-4">
          <InputGroup label="New email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <PrimaryButton type="submit" loading={saving} data-testid="profile-save-email">
            Confirm email change
          </PrimaryButton>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditingEmail(true)}
          data-testid="profile-edit-email"
          className="text-left text-sm text-white/55 hover:text-white"
        >
          Change email
        </button>
      )}

      {message && (
        <p className={message.type === "success" ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
          {message.text}
        </p>
      )}
    </div>
  );
}
