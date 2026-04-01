import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { continueWithGoogle, registerUser } from "@/lib/firebase/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/providers/ThemeProvider";

import logoLight from "@/assets/images/light/logo-flowcharts-light-pure.png";
import logoDark from "@/assets/images/dark/logo-flowcharts-dark-pure.png";
import mascot from "@/assets/images/empty/logomascote.png";

import "@/styles/pages/register.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const logoSrc = theme === "dark" ? logoDark : logoLight;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!acceptedTerms) {
      setError("Você precisa aceitar os termos para continuar.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(name.trim(), email.trim(), password);
      navigate("/codigo-acesso");
    } catch {
      setError("Não foi possível criar sua conta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError("");
    setGoogleLoading(true);

    try {
      await continueWithGoogle();
      navigate("/codigo-acesso");
    } catch {
      setError("Não foi possível criar sua conta com Google.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
   <main className="register-page auth-page">
  <div className="auth-page__glow auth-page__glow--left" />
  <div className="auth-page__glow auth-page__glow--right" />

  <section className="auth-shell">
    <div className="card auth-card auth-card--split">
      <aside className="auth-visual">
        <div className="auth-visual__main">
          <div className="auth-brand">
            <img className="auth-visual__logo" src={logoSrc} alt="FlowCharts" />

            <div className="auth-brand__copy">
              <p className="auth-visual__eyebrow">FlowCharts Platform</p>

              <h1 className="auth-visual__title">
                Transforme tabelas em leitura visual clara, rápida e elegante.
              </h1>
            </div>
          </div>

          <p className="auth-visual__text">
            Um ambiente pensado para acesso simples, visual profissional e
            estrutura de dashboards com identidade de produto real.
          </p>

          <ul className="auth-feature-list">
            <li>Leitura guiada: filtros, KPIs, gráficos e tabelas</li>
            <li>Acesso autenticado por usuário</li>
            <li>Ambientes separados por código</li>
            <li>Visual alinhado com a marca FlowCharts</li>
          </ul>
        </div>

        <div className="auth-visual__footer">
          <img
            className="auth-mascot auth-mascot--register"
            src={mascot}
            alt="Mascote FlowCharts"
          />
          <p className="auth-visual__quote">
            “Organize processos e dados com uma experiência que já nasce com
            cara de produto.”
          </p>
        </div>
      </aside>

      <div className="auth-form-panel">
        <div className="auth-topbar auth-topbar--panel">
          <div className="auth-theme-toggle">
            <ThemeToggle />
          </div>
        </div>

        <div className="auth-intro">
          <h2 className="auth-heading">Criar conta</h2>
          <p className="auth-copy">
            Configure seu acesso e comece a entrar no FlowCharts.
          </p>
        </div>

        <button
          type="button"
          className="social-button"
          onClick={handleGoogleRegister}
          disabled={googleLoading}
        >
          <span className="social-button__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </span>

          <span>{googleLoading ? "Conectando..." : "Criar conta com Google"}</span>
        </button>

        <div className="auth-divider">
          <span>ou preencha seus dados</span>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome completo</span>
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              placeholder="voce@empresa.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              placeholder="Crie uma senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Confirmar senha</span>
            <input
              type="password"
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>

          <label className="auth-check">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
            />
            <span>
              Eu concordo com os Termos de Serviço e com a Política de
              Privacidade.
            </span>
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="helper-text helper-text--left">
          Já tem uma conta?{" "}
          <Link to="/login" className="helper-link">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  </section>
</main>
  );
}