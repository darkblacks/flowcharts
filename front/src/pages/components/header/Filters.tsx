type FiltersProps = {
  search: string;
  selectedStatus: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export default function Filters({
  search,
  selectedStatus,
  onSearchChange,
  onStatusChange,
}: FiltersProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        placeholder="Buscar cliente ou categoria..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
          minWidth: "260px",
          outline: "none",
        }}
      />

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
          outline: "none",
          background: "#fff",
        }}
      >
        <option value="Todos">Todos</option>
        <option value="Concluído">Concluído</option>
        <option value="Em andamento">Em andamento</option>
        <option value="Pendente">Pendente</option>
      </select>
    </div>
  );
}