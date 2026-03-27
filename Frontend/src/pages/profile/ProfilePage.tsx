import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { getAuthHeaders } from "@/lib/api/authHeaders";
import { http } from "@/lib/api/http";
import type { CheckoutResponse, ProfileResponse } from "@/types/profile";

import logoLight from "@/assets/images/light/flowcharts-wordmark-light-transparent.png";
import logoDark from "@/assets/images/dark/flowcharts-wordmark-dark-transparent.png";
import mascot from "@/assets/images/empty/logomascote.png";

import "@/styles/pages/profile.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const logoSrc = theme === "dark" ? logoDark : logoLight;

  const canAccessWorkspaces = useMemo(
    () => Boolean(profile?.subscription?.canAccessWorkspaces),
    [profile]
  );

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const headers = await getAuthHeaders();
      const data = await http<ProfileResponse>(
        `${import.meta.env.VITE_API_URL}/me/profile`,
        {
          method: "GET",
          headers,
        }
      );

      setProfile(data);
    } catch {
      setError("Não foi possível carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function handleCreateCheckout() {
    setActionLoading(true);
    setError("");
    setInfo("");

    try {
      const headers = await getAuthHeaders();
      const data = await http<CheckoutResponse>(
        `${import.meta.env.VITE_API_URL}/billing/create-checkout`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ planSlug: "starter" }),
        }
      );

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setInfo(data.message);
      await loadProfile();
    } catch {
      setError("Não foi possível iniciar o pagamento.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDevActivate() {
    setActionLoading(true);
    setError("");
    setInfo("");

    try {
      const headers = await getAuthHeaders();
      await http<{ ok: boolean; message: string }>(
        `${import.meta.env.VITE_API_URL}/billing/dev-activate`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ planSlug: "starter" }),
        }
      );

      setInfo("Plano ativado em modo de desenvolvimento.");
      await loadProfile();
    } catch {
      setError("Não foi possível ativar o plano em desenvolvimento.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  if (loading) {
    return (
      <main className="profile-page">
        <section className="profile-shell">
          <div className="card profile-card profile-card--center">
            <p className="subtitle">Carregando seu perfil...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <div className="card profile-card">
          <header className="profile-header">
            <img src={logoSrc} alt="FlowCharts" className="profile-logo" />

            <div className="profile-header__actions">
              <ThemeToggle />
              <button
                type="button"
                className="secondary-button"
                onClick={handleLogout}
              >
                Sair
              </button>
            </div>
          </header>

          <div className="profile-hero">
            <div>
              <p className="profile-eyebrow">Perfil do usuário</p>
              <h1 className="profile-title">
                Olá, {profile?.user.name || profile?.user.email || "usuário"}
              </h1>
              <p className="profile-description">
                Antes de entrar no ambiente, seu plano precisa estar liberado.
                Depois disso, você valida a chave de acesso vinculada ao seu login.
              </p>
            </div>

            <img
              src={mascot}
              alt="Mascote FlowCharts"
              className="profile-mascot"
            />
          </div>

          <section className="profile-grid">
            <article className="profile-panel">
              <h2 className="profile-panel__title">Sua conta</h2>

              <div className="profile-list">
                <div>
                  <span>Nome</span>
                  <strong>{profile?.user.name || "Não informado"}</strong>
                </div>
                <div>
                  <span>E-mail</span>
                  <strong>{profile?.user.email || "Não informado"}</strong>
                </div>
                <div>
                  <span>Status da conta</span>
                  <strong>{profile?.user.status}</strong>
                </div>
                <div>
                  <span>Chaves liberadas</span>
                  <strong>{profile?.accessGrantedCount}</strong>
                </div>
              </div>
            </article>

            <article className="profile-panel">
              <h2 className="profile-panel__title">Plano e pagamento</h2>

              {profile?.subscription ? (
                <div className="plan-box">
                  <div className="plan-box__top">
                    <strong>{profile.subscription.plan.name}</strong>
                    <span
                      className={`status-badge ${
                        profile.subscription.canAccessWorkspaces
                          ? "status-badge--success"
                          : "status-badge--warning"
                      }`}
                    >
                      {profile.subscription.status}
                    </span>
                  </div>

                  <p className="plan-price">
                    {(profile.subscription.plan.priceCents / 100).toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: profile.subscription.plan.currency,
                      }
                    )}
                  </p>

                  <ul className="plan-features">
                    {profile.subscription.plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="plan-box">
                  <div className="plan-box__top">
                    <strong>Nenhum plano liberado</strong>
                    <span className="status-badge status-badge--warning">
                      pendente
                    </span>
                  </div>
                  <p className="plan-price">Escolha e pague um plano para seguir.</p>
                </div>
              )}

              <div className="profile-actions">
                {canAccessWorkspaces ? (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => navigate("/codigo-acesso")}
                  >
                    Ir para chave de acesso
                  </button>
                ) : (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleCreateCheckout}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processando..." : "Pagar e liberar acesso"}
                  </button>
                )}

                {profile?.devPaymentBypassAvailable ? (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleDevActivate}
                    disabled={actionLoading}
                  >
                    Liberar plano em desenvolvimento
                  </button>
                ) : null}
              </div>

              {error ? <p className="error-text">{error}</p> : null}
              {info ? <p className="success-text">{info}</p> : null}
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}