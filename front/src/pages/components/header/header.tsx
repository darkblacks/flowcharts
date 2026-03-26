import Nav from "./Nav";
import Filters from "./Filters";

type HeaderProps = {
  title: string;
  subtitle?: string;
  search: string;
  selectedStatus: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export default function Header({
  title,
  subtitle,
  search,
  selectedStatus,
  onSearchChange,
  onStatusChange,
}: HeaderProps) {
  return (
    <header
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <Nav title={title} subtitle={subtitle} />

      <Filters
        search={search}
        selectedStatus={selectedStatus}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />
    </header>
  );
}