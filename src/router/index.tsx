import { createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth/hooks/useAuth';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { FilesDashboardPage } from '../features/files/pages/FilesDashboardPage';
import { DashboardPage } from '../features/files/pages/DashboardPage';
import { FileDetailPage } from '../features/files/pages/FileDetailPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Layout } from '../components/common/Layout';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { NotFoundPage } from '../features/common/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <AuthProvider />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        element: <Layout />,
        children: [
          {
            path: '/',
            element: <FilesDashboardPage />,
            // Homepage is public, no ProtectedRoute needed
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
            element: (
              <ProtectedRoute>
                <FileDetailPage />
              </ProtectedRoute>
            ),
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

