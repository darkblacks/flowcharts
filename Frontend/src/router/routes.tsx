import { createBrowserRouter, Navigate } from "react-router-dom";
import Inicialpage from "@/pages/inicialpage/InicialPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import AccessCodePage from "@/pages/auth/AccessCodePage";
import ProfilePage from "@/pages/profile/ProfilePage";
import { ProtectedRoute } from "@/guards/ProtectedRoute";

function PlaceholderPage() {
  return (
    <main className="screen-center">
      <div className="card auth-card">
        <h1 className="title">FlowCharts</h1>
        <p className="subtitle">Área interna em construção.</p>
      </div>
    </main>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/inicial" replace />,
  },
  {
    path: "/inicial",
    element: <Inicialpage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/cadastro",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/perfil",
        element: <ProfilePage />,
      },
      {
        path: "/codigo-acesso",
        element: <AccessCodePage />,
      },
      {
        path: "/app",
        element: <PlaceholderPage />,
      },
    ],
  },
]);