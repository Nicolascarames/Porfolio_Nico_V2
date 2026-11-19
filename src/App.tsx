import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { authKitConfig } from './auth-kit/config/kit.config';
import { createAuthKitClient } from './auth-kit/lib/supabaseClient';
import { KitProvider, useAuthKitConfig } from './auth-kit/context/KitProvider';
import { useAuth } from './auth-kit/hooks/useAuth';
import { useProfile } from './auth-kit/hooks/useProfile';
import { AuthCard } from './auth-kit/components/AuthCard';
import { ProfilePage } from './auth-kit/components/ProfilePage';
import { AdminPanel } from './auth-kit/components/AdminPanel';
import { SectionsEditor } from './auth-kit/components/SectionsEditor';
import { ServerPanel } from './auth-kit/components/ServerPanel';
import { PrivateLayout } from './auth-kit/components/PrivateLayout';
import { HomePage } from './pages/HomePage';
import { SectionsProvider } from './context/SectionsContext';
import { Nav } from './components/Nav';

const supabaseClient = createAuthKitClient(authKitConfig.supabase);

// Owner-only area: the Supabase project is shared with Desktop_Nav (public
// signup), so any account can authenticate here. Only role "admin" gets in;
// everyone else is signed out and sent to /login with a notice.
function useIsOwner() {
  const { config } = useAuthKitConfig();
  const { profile, loading } = useProfile();
  const isOwner = !!profile && config.roles.indexOf(profile.role) >= config.roles.indexOf('admin');
  return { isOwner, loading };
}

function LoginRoute() {
  const { user, loading, signOut } = useAuth();
  const { isOwner, loading: profileLoading } = useIsOwner();
  const location = useLocation();
  const [denied, setDenied] = useState(
    (location.state as { denied?: boolean } | null)?.denied === true
  );
  const reject = !!user && !loading && !profileLoading && !isOwner;

  useEffect(() => {
    if (!reject) return;
    setDenied(true);
    signOut().catch(() => {});
  }, [reject, signOut]);

  if (loading || (user && profileLoading)) return null;
  if (user && isOwner) return <Navigate to="/profile" replace />;
  if (user) return null; // non-owner, sign-out in flight
  return <AuthCard notice={denied ? 'Acceso restringido.' : undefined} />;
}

// Gate for every private route (profile, admin, panel). RoleGate/RLS stay as
// the inner layers; this one also signs non-admin sessions out.
function OwnerRoute({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { user, loading, signOut } = useAuth();
  const { isOwner, loading: profileLoading } = useIsOwner();
  const reject = !!user && !loading && !profileLoading && !isOwner;

  useEffect(() => {
    if (reject) signOut().catch(() => {});
  }, [reject, signOut]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (profileLoading) return null;
  if (!isOwner) return <Navigate to="/login" replace state={{ denied: true }} />;
  return <PrivateLayout wide={wide}>{children}</PrivateLayout>;
}

export function App() {
  return (
    <KitProvider config={authKitConfig} client={supabaseClient}>
      <SectionsProvider>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/profile" element={<OwnerRoute><ProfilePage /></OwnerRoute>} />
        <Route path="/admin" element={<OwnerRoute><AdminPanel /></OwnerRoute>} />
        <Route path="/admin/sections" element={<OwnerRoute><SectionsEditor /></OwnerRoute>} />
        <Route path="/admin/panel" element={<OwnerRoute wide><ServerPanel /></OwnerRoute>} />
      </Routes>
      </SectionsProvider>
    </KitProvider>
  );
}
