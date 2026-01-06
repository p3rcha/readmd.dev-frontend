import { useAuth } from '../features/auth/hooks/useAuth';
import { LandingPage } from '../features/common/pages/LandingPage';
import { FilesDashboardPage } from '../features/files/pages/FilesDashboardPage';
import { Loader } from '../components/common/Loader';

export function ConditionalHomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <FilesDashboardPage />;
  }

  return <LandingPage />;
}
