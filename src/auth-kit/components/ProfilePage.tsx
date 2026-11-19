import { ProfileForm } from "./ProfileForm";

export function ProfilePage() {
  return (
    <div className="r4-glass w-full max-w-lg rounded-r4-xl p-6 sm:p-8">
      <p className="r4-eyebrow mb-2">Cuenta</p>
      <h1 className="r4-title mb-6 text-3xl text-ink">Your profile</h1>
      <ProfileForm />
    </div>
  );
}
