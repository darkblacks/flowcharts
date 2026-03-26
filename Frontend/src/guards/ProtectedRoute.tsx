import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="screen-center">
        <div className="card auth-card">
          <p className="subtitle">Carregando sessão...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
