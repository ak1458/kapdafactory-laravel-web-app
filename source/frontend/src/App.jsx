import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import OrderList from './pages/OrderList';
import CreateOrder from './pages/CreateOrder';
import OrderDetail from './pages/OrderDetail';
import EditOrder from './pages/EditOrder';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const queryClient = new QueryClient();

function RequireAuth({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={
        <RequireAuth>
          <Layout>
            <CreateOrder />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/dashboard" element={
        <RequireAuth>
          <Layout>
            <OrderList />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/orders/create" element={
        <RequireAuth>
          <Layout>
            <CreateOrder />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/orders/:id" element={
        <RequireAuth>
          <Layout>
            <OrderDetail />
          </Layout>
        </RequireAuth>
      } />

      <Route path="/orders/:id/edit" element={
        <RequireAuth>
          <Layout>
            <EditOrder />
          </Layout>
        </RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
