import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/providers/ThemeProvider";
import { getAuthHeaders } from "@/lib/api/authHeaders";
import { http } from "@/lib/api/http";
import type { AccessCodeResponse } from "@/types/auth";
import type { ProfileResponse } from "@/types/profile";

import logoLight from "@/assets/images/light/logo-flowcharts-light-pure.png";
import logoDark from "@/assets/images/dark/logo-flowcharts-dark-pure.png";
import mascot from "@/assets/images/empty/logomascote.png";

import "@/styles/pages/access-code.css";

export default function AccessCodePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [code, setCode] = useState("");
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState("");

  const logoSrc = theme === "dark" ? logoDark : logoLight;

  const canAccess = useMemo(
    () => Boolean(profile?.subscription?.canAccessWorkspaces),
    [profile]
  );

  async function loadProfile() {
    setLoadingProfile(true);

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
      setError("Não foi possível carregar o status do seu acesso.");
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoadingAction(true);

    try {
      const headers = await getAuthHeaders();

      const data = await http<AccessCodeResponse>(
        `${import.meta.env.VITE_API_URL}/access-codes/validate`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ code }),
        }
      );

      localStorage.setItem("workspace_token", data.workspaceToken);
      localStorage.setItem("workspace_id", data.workspace.id);
      navigate("/app");
    } catch {
      setError(
        "A chave é inválida ou seu login não recebeu permissão para esse ambiente."
      );
    } finally {
      setLoadingAction(false);
    }
  }

  if (loadingProfile) {
    return (
      <main className="access-page">
        <section className="access-shell">
          <div className="card access-card access-card--center">
            <p className="subtitle">Carregando acesso...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="access-page">
      <section className="access-shell">
        <div className="card access-card">
          <header className="access-header">
            <img src={logoSrc} alt="FlowCharts" className="access-logo" />
            <ThemeToggle />
          </header>

          <div className="access-body">
            <div className="access-content">
              <p className="access-eyebrow">Validação de ambiente</p>
              <h1 className="access-title">Entre com sua chave de acesso</h1>
              <p className="access-description">
                A chave precisa estar vinculada ao seu login. Mesmo com a chave
                correta, a entrada será bloqueada se o seu usuário não tiver sido
                liberado para ela.
              </p>

              {profile?.subscription ? (
                <div className="access-status-box">
                  <div>
                    <span>Plano atual</span>
                    <strong>{profile.subscription.plan.name}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{profile.subscription.status}</strong>
                  </div>
                  <div>
                    <span>Chaves liberadas</span>
                    <strong>{profile.accessGrantedCount}</strong>
                  </div>
                </div>
              ) : null}

              {!canAccess ? (
                <div className="access-locked">
                  <p>
                    Seu plano ainda não foi liberado. Volte ao perfil para pagar
                    ou ativar sua liberação de desenvolvimento.
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => navigate("/perfil")}
                  >
                    Voltar ao perfil
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <label className="field">
                    <span>Chave do workspace</span>
                    <input
                      type="text"
                      placeholder="Ex.: ACME-2026"
                      value={code}
                      onChange={(event) =>
                        setCode(event.target.value.toUpperCase())
                      }
                      required
                    />
                  </label>

                  {error ? <p className="error-text">{error}</p> : null}

                  <button
                    className="primary-button"
                    type="submit"
                    disabled={loadingAction}
                  >
                    {loadingAction ? "Validando..." : "Entrar no ambiente"}
                  </button>
                </form>
              )}
            </div>

            <div className="access-visual">
              <img
                src={mascot}
                alt="Mascote FlowCharts"
                className="access-mascot"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}