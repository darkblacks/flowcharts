import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Farinha", value: 120 },
  { name: "Arroz", value: 90 },
  { name: "Feijão", value: 60 },
];

export default function Grafico() {
  const [popupAberto, setPopupAberto] = useState(false);

  return (
    <div style={{ width: "100%", height: 300, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="value"
            fill="#8884d8"
            onClick={(item) => {
              if (item?.name === "Farinha") {
                setPopupAberto(true);
              }
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      {popupAberto && (
        <div>
          Popup da Farinha
          <button onClick={() => setPopupAberto(false)}>Fechar</button>
        </div>
      )}
    </div>
  );
}