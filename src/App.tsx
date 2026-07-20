import { Navigate, Route, Routes } from 'react-router-dom';
import { authKitConfig } from './auth-kit/config/kit.config';
import { createAuthKitClient } from './auth-kit/lib/supabaseClient';
import { KitProvider } from './auth-kit/context/KitProvider';
import { useAuth } from './auth-kit/hooks/useAuth';
import { AuthCard } from './auth-kit/components/AuthCard';
import { ProfilePage } from './auth-kit/components/ProfilePage';
import { AdminPanel } from './auth-kit/components/AdminPanel';
import { RoleGate } from './auth-kit/components/RoleGate';
import { HomePage } from './pages/HomePage';
import { Nav } from './components/Nav';

const supabaseClient = createAuthKitClient(authKitConfig.supabase);

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/profile" replace />;
  return <AuthCard />;
}

function ProfileRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <ProfilePage />;
}

function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <RoleGate minRole="admin" fallback={<p className="p-6 text-white/50">Solo admin.</p>}>
      <AdminPanel />
    </RoleGate>
  );
}

export function App() {
  return (
    <KitProvider config={authKitConfig} client={supabaseClient}>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/profile" element={<ProfileRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </KitProvider>
  );
}
