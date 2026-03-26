import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "@/lib/firebase/auth";
import "@/styles/pages/register.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(name, email, password);
      navigate("/codigo-acesso");
    } catch {
      setError("Não foi possível criar sua conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen-center">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1 className="title">Criar conta</h1>
        <p className="subtitle">Configure seu acesso ao FlowCharts.</p>

        <label className="field">
          <span>Nome</span>
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
            placeholder="Confirme a senha"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </button>

        <p className="helper-text">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </main>
  );
}
