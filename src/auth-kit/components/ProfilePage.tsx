import { ProfileForm } from "./ProfileForm";

export function ProfilePage() {
  return (
    <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-surface p-8 shadow-card">
      <h1 className="mb-6 text-2xl font-semibold text-white">Your profile</h1>
      <ProfileForm />
    </div>
  );
}
