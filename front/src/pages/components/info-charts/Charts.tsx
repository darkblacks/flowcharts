type Row = {
  status: string;
};

type ChartsProps = {
  rows: Row[];
};

export default function Charts({ rows }: ChartsProps) {
  const completed = rows.filter((item) => item.status === "Concluído").length;
  const inProgress = rows.filter((item) => item.status === "Em andamento").length;
  const pending = rows.filter((item) => item.status === "Pendente").length;

  const chartData = [
    { label: "Concluído", value: completed },
    { label: "Em andamento", value: inProgress },
    { label: "Pendente", value: pending },
  ];

  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <h2
        style={{
          margin: "0 0 18px 0",
          fontSize: "20px",
          color: "#111827",
        }}
      >
        Status dos registros
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {chartData.map((item) => (
          <div key={item.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>

            <div
              style={{
                width: "100%",
                height: "12px",
                borderRadius: "999px",
                background: "#e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  height: "100%",
                  background: "#2563eb",
                  borderRadius: "999px",
                  transition: "0.3s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}