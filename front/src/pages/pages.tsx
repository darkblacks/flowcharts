import { useMemo, useState } from "react";
import Header from "./components/header/Header";
import InfoCharts from "./components/info-charts/InfoCharts";
import Tables from "./components/tables/Tables";

type DashboardRow = {
  id: number;
  cliente: string;
  categoria: string;
  status: "Concluído" | "Em andamento" | "Pendente";
  valor: number;
  data: string;
};

const mockData: DashboardRow[] = [
  {
    id: 1,
    cliente: "Empresa Alpha",
    categoria: "Marketing",
    status: "Concluído",
    valor: 1800,
    data: "19/03/2026",
  },
  {
    id: 2,
    cliente: "Empresa Beta",
    categoria: "Comercial",
    status: "Pendente",
    valor: 950,
    data: "18/03/2026",
  },
  {
    id: 3,
    cliente: "Empresa Gama",
    categoria: "Financeiro",
    status: "Em andamento",
    valor: 2400,
    data: "17/03/2026",
  },
  {
    id: 4,
    cliente: "Empresa Delta",
    categoria: "Operação",
    status: "Concluído",
    valor: 3100,
    data: "16/03/2026",
  },
  {
    id: 5,
    cliente: "Empresa Sigma",
    categoria: "Marketing",
    status: "Pendente",
    valor: 1250,
    data: "15/03/2026",
  },
];

export default function Pages() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  const filteredData = useMemo(() => {
    return mockData.filter((item) => {
      const matchesSearch =
        item.cliente.toLowerCase().includes(search.toLowerCase()) ||
        item.categoria.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "Todos" || item.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [search, selectedStatus]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Header
          title="Meu Dashboard"
          subtitle="Estrutura inicial com header, info-charts e tabela"
          search={search}
          selectedStatus={selectedStatus}
          onSearchChange={setSearch}
          onStatusChange={setSelectedStatus}
        />

        <InfoCharts rows={filteredData} />

        <Tables rows={filteredData} />
      </div>
    </main>
  );
}