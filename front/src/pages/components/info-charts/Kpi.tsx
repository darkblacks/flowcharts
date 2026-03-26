type KpiProps = {
  totalItems?: number;
  totalValue?: number;
  pendingItems?: number;
};

function Card({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: "180px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "18px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <p
        style={{
          margin: "0 0 8px 0",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        {label}
      </p>

      <h3
        style={{
          margin: 0,
          fontSize: "24px",
          color: "#111827",
        }}
      >
        {value}
      </h3>
    </div>
  );
}

export default function Kpi({
  totalItems = 0,
  totalValue = 0,
  pendingItems = 0,
}: KpiProps) {
  return (
    <section
      style={{
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <Card label="Total de registros" value={totalItems} />
      <Card
        label="Valor total"
        value={(totalValue ?? 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      />
      <Card label="Pendentes" value={pendingItems} />
    </section>
  );
}