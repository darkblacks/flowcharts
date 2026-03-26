import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "@/lib/api/authHeaders";
import { http } from "@/lib/api/http";
import type { AccessCodeResponse } from "@/types/auth";

export default function AccessCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

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
      setError("Código inválido ou indisponível.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen-center">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1 className="title">Código de acesso</h1>
        <p className="subtitle">Digite o código do seu ambiente.</p>

        <label className="field">
          <span>Código</span>
          <input
            type="text"
            placeholder="Ex.: FLOW-2026"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Validando..." : "Entrar no ambiente"}
        </button>
      </form>
    </main>
  );
}
