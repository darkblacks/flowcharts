type TableRow = {
  id: number;
  cliente: string;
  categoria: string;
  status: string;
  valor: number;
  data: string;
};

type TablesProps = {
  rows: TableRow[];
};

export default function Tables({ rows }: TablesProps) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        overflowX: "auto",
      }}
    >
      <h2
        style={{
          margin: "0 0 18px 0",
          fontSize: "20px",
          color: "#111827",
        }}
      >
        Tabela de registros
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: "760px",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#f9fafb",
              textAlign: "left",
            }}
          >
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Cliente</th>
            <th style={thStyle}>Categoria</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Valor</th>
            <th style={thStyle}>Data</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: "18px", textAlign: "center" }}>
                Nenhum dado encontrado.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={tdStyle}>{row.id}</td>
                <td style={tdStyle}>{row.cliente}</td>
                <td style={tdStyle}>{row.categoria}</td>
                <td style={tdStyle}>{row.status}</td>
                <td style={tdStyle}>
                  {row.valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td style={tdStyle}>{row.data}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px",
  fontSize: "14px",
  color: "#374151",
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  fontSize: "14px",
  color: "#111827",
};