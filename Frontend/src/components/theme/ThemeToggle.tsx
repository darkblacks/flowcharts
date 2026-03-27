import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Ativar tema ${theme === "light" ? "escuro" : "claro"}`}
      title={`Ativar tema ${theme === "light" ? "escuro" : "claro"}`}
    >
      <span className="theme-toggle__track">
        <span className={`theme-toggle__thumb ${theme === "dark" ? "is-dark" : ""}`}>
          {theme === "dark" ? "🌙" : "☀️"}
        </span>
      </span>
      <span className="theme-toggle__text">
        {theme === "dark" ? "Escuro" : "Claro"}
      </span>
    </button>
  );
}