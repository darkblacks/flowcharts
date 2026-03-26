import Kpi from "./Kpi";
import Charts from "./Charts";

type Row = {
  status?: string;
  valor?: number;
};

type InfoChartsProps = {
  rows?: Row[];
};

export default function InfoCharts({ rows = [] }: InfoChartsProps) {
  const totalItems = rows.length;
  const totalValue = rows.reduce((acc, item) => acc + (item.valor ?? 0), 0);
  const pendingItems = rows.filter((item) => item.status === "Pendente").length;

  console.log("InfoCharts rows:", rows);
  console.log("KPI values:", { totalItems, totalValue, pendingItems });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >
      <Kpi
        totalItems={totalItems}
        totalValue={totalValue}
        pendingItems={pendingItems}
      />

      <Charts rows={rows} />
    </div>
  );
}