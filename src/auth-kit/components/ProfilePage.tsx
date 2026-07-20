import { ProfileForm } from "./ProfileForm";

export function ProfilePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6">
      <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-surface p-8 shadow-card">
        <h1 className="mb-6 text-2xl font-semibold text-white">Your profile</h1>
        <ProfileForm />
      </div>
    </main>
  );
}
