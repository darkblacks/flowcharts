import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import ColorPicker from "react-best-gradient-color-picker";
import logoClara from "./sources/logo-flowcharts-light-pure.png";
import logoEscura from "./sources/logo-flowcharts-dark-pure.png";
import wordmarkEscura from "./sources/flowcharts-wordmark-dark-transparent.png";
import wordmarkClara from "./sources/flowcharts-wordmark-light-transparent.png";
import {
  Moon,
  Sun,
  CheckCircle2,
  Terminal,
  Info,
  Pencil,
  X,
} from "lucide-react";
import { applyTheme } from "./theme/applyTheme";
import { themes, type ThemeColors, type ThemeMode } from "./theme/themes";

type ThemeField = keyof ThemeColors;

const fieldLabels: Record<ThemeField, string> = {
  bgColor: "Background",
  textColor: "Text",
  cardBg: "Card",
  borderColor: "Border",
  accentColor: "Accent",
  mutedColor: "Muted",
  heroGlow: "Hero Glow",
  heroShadow: "Hero Shadow",
  selectionColor: "Selection",
};

const presetColors = [
  "rgba(2,132,199,1)",
  "rgba(56,189,248,1)",
  "rgba(37,99,235,1)",
  "rgba(15,23,42,1)",
  "rgba(248,250,252,1)",
  "rgba(255,255,255,0.88)",
  "rgba(15,23,42,0.82)",
  "rgba(30,41,59,1)",
];

const mixTransparent = (color: string, amount: number) =>
  `color-mix(in srgb, ${color} ${amount}%, transparent)`;

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("flowcharts-theme") as ThemeMode | null;
      if (saved) return saved;

      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    return "light";
  });

  const [editableThemes, setEditableThemes] = useState<
    Record<ThemeMode, ThemeColors>
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("flowcharts-editable-themes");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return themes;
        }
      }
    }
    return themes;
  });

  const [pickerOpen, setPickerOpen] = useState<{
    mode: ThemeMode;
    field: ThemeField;
  } | null>(null);

  const isDark = theme === "dark";
  const logoAtual = isDark ? logoEscura : logoClara;
  const wordmarkAtual = isDark ? wordmarkEscura : wordmarkClara;

  const appVersion = "0.0.1";
  const clientAppTitle = "FlowCharts";
  const clientAppSubtitle =
    "Dashboards interativos com tecnologia de ponta para criar, editar e apresentar páginas ao seu time, gestor ou cliente.";
  const toolCreatorName = "Victor Ferreira";
  const chartCreatorName = "FlowCharts";

  useEffect(() => {
    applyTheme(editableThemes[theme]);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("flowcharts-theme", theme);
  }, [theme, editableThemes]);

  useEffect(() => {
    localStorage.setItem(
      "flowcharts-editable-themes",
      JSON.stringify(editableThemes)
    );
  }, [editableThemes]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const resetMode = (mode: ThemeMode) => {
    setEditableThemes((prev) => ({
      ...prev,
      [mode]: { ...themes[mode] },
    }));

    if (pickerOpen?.mode === mode) {
      setPickerOpen(null);
    }
  };

  const updateField = (mode: ThemeMode, field: ThemeField, value: string) => {
    setEditableThemes((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [field]: value,
      },
    }));
  };

  const renderThemeCard = (mode: ThemeMode) => {
    const currentTheme = editableThemes[mode];
    const isActiveMode = theme === mode;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="theme-accent flex items-center gap-2 text-sm font-black uppercase tracking-widest">
            <div className="theme-accent-bg h-2 w-2 rounded-full" />
            {mode === "light" ? "Light Mode" : "Dark Mode"}

            {isActiveMode ? (
              <span className="badge-accent rounded-full px-2 py-0.5 text-[10px]">
                ativo
              </span>
            ) : null}
          </h3>

          <button
            type="button"
            onClick={() => resetMode(mode)}
            className="btn-secondary rounded-full px-3 py-1 text-xs font-bold transition"
          >
            Reset
          </button>
        </div>

        <div
          className="space-y-3 rounded-3xl border p-4 font-mono text-sm sm:p-6"
          style={{
            background: currentTheme.cardBg,
            color: currentTheme.textColor,
            borderColor: currentTheme.borderColor,
          }}
        >
          {(Object.keys(fieldLabels) as ThemeField[]).map((field) => {
            const isThisOpen =
              pickerOpen?.mode === mode && pickerOpen?.field === field;

            return (
              <div
                key={`${mode}-${field}`}
                className="rounded-2xl border border-transparent px-2 py-2"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span>{fieldLabels[field]}:</span>

                  <div className="flex flex-wrap items-center justify-end gap-3 sm:min-w-[280px] sm:flex-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPickerOpen(isThisOpen ? null : { mode, field })
                      }
                      className="h-6 w-6 rounded-full border shadow-sm"
                      style={{
                        background: currentTheme[field],
                        borderColor: currentTheme.borderColor,
                      }}
                      title="Abrir seletor"
                    />

                    <span className="break-all text-right font-bold">
                      {currentTheme[field]}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setPickerOpen(isThisOpen ? null : { mode, field })
                      }
                      className="rounded-xl p-2 transition"
                      style={{
                        color: currentTheme.accentColor,
                        background: isThisOpen
                          ? mixTransparent(currentTheme.accentColor, 10)
                          : "transparent",
                      }}
                    >
                      {isThisOpen ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isThisOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 overflow-hidden rounded-2xl border p-3 shadow-xl"
                      style={{
                        background: currentTheme.cardBg,
                        borderColor: currentTheme.borderColor,
                        color: currentTheme.textColor,
                      }}
                    >
                      <div
                        className="mb-2 text-xs font-bold uppercase tracking-wider"
                        style={{ color: currentTheme.accentColor }}
                      >
                        {fieldLabels[field]}
                      </div>

                      <ColorPicker
                        value={currentTheme[field]}
                        onChange={(value) => updateField(mode, field, value)}
                        presets={presetColors}
                        hideGradientType
                        hideControls={["type"]}
                        hideColorGuide
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans transition-theme">
      <nav className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
        <button
          onClick={toggleTheme}
          className="glass-card theme-text theme-border theme-accent-soft-hover group relative flex items-center gap-3 overflow-hidden rounded-full border px-4 py-2.5 shadow-lg transition-all active:scale-95 sm:px-5"
          aria-label="Alternar tema"
        >
          <div className="theme-accent-soft absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />

          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex items-center gap-2"
            >
              {isDark ? (
                <>
                  <Sun className="icon-accent h-5 w-5" />
                </>
              ) : (
                <>
                  <Moon className="icon-accent h-5 w-5" />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </button>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 sm:pb-16 sm:pt-24 lg:pb-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="badge-accent mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest sm:text-xs">
              <Terminal className="h-3.5 w-3.5" />
              APP-v-{appVersion}
            </div>

            <h1 className="theme-text mb-3 text-3xl font-black leading-tight tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Bem-vindo ao seu:
            </h1>

            <div className="mb-4">
              <img
                src={wordmarkAtual}
                alt={`Logo do app ${clientAppTitle}`}
                className="h-auto w-full max-w-[260px] object-contain sm:max-w-[360px] md:max-w-[440px] lg:max-w-[520px]"
              />
            </div>

            <h2 className="theme-text mb-3 text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl">
              {clientAppTitle}
            </h2>

            <p className="theme-muted mb-8 max-w-xl text-base font-medium leading-relaxed sm:text-lg md:text-xl">
              {clientAppSubtitle}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
  to="/pages"
  className="btn-primary inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-base font-bold shadow-lg transition-all hover:-translate-y-1 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
>
  Ir para as páginas
</Link>

              <button className="btn-secondary w-full rounded-2xl px-6 py-3 text-base font-bold transition-all hover:-translate-y-1 sm:w-auto sm:px-8 sm:py-4 sm:text-lg">
                Editar
              </button>
            </div>

            <div className="mt-10 space-y-2 border-t pt-6 theme-border sm:mt-12 sm:pt-8">
              <p className="theme-muted text-sm sm:text-base">
                Créditos ao criador do FlowCharts:{" "}
                <span className="font-bold theme-text">{toolCreatorName}</span>
              </p>

              <p className="theme-muted text-sm sm:text-base">
                Criador do chart atual:{" "}
                <span className="font-bold theme-text">{chartCreatorName}</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="hero-glow-blob absolute inset-0 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" />

            <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-[2rem] border border-transparent bg-transparent sm:min-h-[380px] sm:rounded-[3rem] lg:min-h-[520px] lg:rounded-[4rem]">
              <div className="hero-fade absolute inset-0" />

              <motion.img
                src={logoAtual}
                alt="Logo FlowCharts"
                className="relative z-10 w-[62%] max-w-[180px] object-contain sm:max-w-[260px] lg:max-w-[360px]"
                animate={{ y: [0, -10, 0], scale: [1, 1.02, 1] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="glass-card theme-border absolute right-4 top-4 rounded-2xl border p-3 shadow-xl sm:right-6 sm:top-6 sm:p-4 lg:right-12 lg:top-12"
              >
                <CheckCircle2 className="icon-success h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="glass-card theme-border rounded-[2rem] border p-5 shadow-xl md:p-8 lg:rounded-[3rem] lg:p-12">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center">
            <div className="theme-accent-soft rounded-2xl p-3">
              <Info className="h-8 w-8" />
            </div>

            <div>
              <h2 className="theme-text text-2xl font-black tracking-tight sm:text-3xl">
                Documentação de Design
              </h2>
              <p className="theme-muted font-medium">
                Clique no lápis ou na bolinha da cor para abrir a paleta.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {renderThemeCard("light")}
            {renderThemeCard("dark")}
          </div>

          <div className="info-box mt-8 rounded-2xl border p-5 text-sm italic sm:mt-10 sm:p-6">
            O seletor altera o valor da linha e, se o tema estiver ativo, a tela
            muda automaticamente em tempo real.
          </div>
        </div>
      </section>
    </div>
  );
}