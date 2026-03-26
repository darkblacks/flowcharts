import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "@/lib/firebase/auth";
import "@/styles/pages/login.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate("/codigo-acesso");
    } catch {
      setError("Não foi possível entrar. Verifique e-mail e senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen-center">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1 className="title">Entrar</h1>
        <p className="subtitle">Acesse sua conta no FlowCharts.</p>

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
            placeholder="Sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="helper-text">
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </form>
    </main>
  );
}
