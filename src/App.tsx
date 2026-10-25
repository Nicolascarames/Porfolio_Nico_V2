import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { authKitConfig } from './auth-kit/config/kit.config';
import { createAuthKitClient } from './auth-kit/lib/supabaseClient';
import { KitProvider } from './auth-kit/context/KitProvider';
import { useAuth } from './auth-kit/hooks/useAuth';
import { AuthCard } from './auth-kit/components/AuthCard';
import { ProfilePage } from './auth-kit/components/ProfilePage';
import { AdminPanel } from './auth-kit/components/AdminPanel';
import { ServerPanel } from './auth-kit/components/ServerPanel';
import { RoleGate } from './auth-kit/components/RoleGate';
import { PrivateLayout } from './auth-kit/components/PrivateLayout';
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
  return (
    <PrivateLayout>
      <ProfilePage />
    </PrivateLayout>
  );
}

// Admin-only pages. RoleGate is UX; the real protection is RLS on the data
// (admin_list_users / admin_panel only answer to portfolio.is_admin()).
function AdminRoute({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <PrivateLayout wide={wide}>
      <RoleGate minRole="admin" fallback={<p className="text-white/50">Solo admin.</p>}>
        {children}
      </RoleGate>
    </PrivateLayout>
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
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/panel" element={<AdminRoute wide><ServerPanel /></AdminRoute>} />
      </Routes>
    </KitProvider>
  );
}
