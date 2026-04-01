import { useNavigate } from "react-router-dom";
import "@/styles/pages/inicialpage.css";

export default function InicialPage() {
  const navigate = useNavigate();

  return (
    <main className="inicial-page">
      <div className="inicial-page__container">
        <section className="inicial-page__card">
          <div className="inicial-page__content">
            <span className="inicial-page__badge">FlowCharts</span>

            <h1 className="inicial-page__title">Bem-vindo ao FlowCharts</h1>

            <p className="inicial-page__description">
              Uma plataforma feita para transformar dados em análises visuais
              claras, organizadas e inteligentes, facilitando a leitura de
              indicadores e dashboards no seu dia a dia.
            </p>

            <div className="inicial-page__actions">
              <button
                className="inicial-page__button"
                onClick={() => navigate("/login")}
              >
                Começar
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}