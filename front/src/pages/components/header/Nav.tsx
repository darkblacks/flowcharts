type NavProps = {
  title: string;
  subtitle?: string;
};

export default function Nav({ title, subtitle }: NavProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "28px",
          fontWeight: 700,
          color: "#1f2937",
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}