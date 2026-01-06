import { createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth/hooks/useAuth';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/files/pages/DashboardPage';
import { FileDetailPage } from '../features/files/pages/FileDetailPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Layout } from '../components/common/Layout';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { NotFoundPage } from '../features/common/pages/NotFoundPage';
import { ComingSoonPage } from '../features/common/pages/ComingSoonPage';
import { ConditionalHomePage } from './ConditionalHomePage';

export const router = createBrowserRouter([
  {
    element: <AuthProvider />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <ComingSoonPage />,
      },
      {
        element: <Layout />,
        children: [
          {
            path: '/',
            element: <ConditionalHomePage />,
          },
          {
            path: '/dashboard',
            element: (
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            ),
          },
          {
            path: '/files/:id',
            element: <FileDetailPage />,
          },
          {
            path: '/admin/users',
            element: (
              <ProtectedRoute requireAdmin>
                <AdminUsersPage />
              </ProtectedRoute>
            ),
          },
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);

