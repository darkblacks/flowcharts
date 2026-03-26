import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  LockKeyhole,
  Moon,
  ShieldCheck,
  SunMedium,
} from "lucide-react";
import wordmarkEscura from "./sources/flowcharts-wordmark-dark-transparent.png";
import wordmarkClara from "./sources/flowcharts-wordmark-light-transparent.png";

type ThemeMode = "light" | "dark";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function BrandMark({
  compact = false,
  theme,
}: {
  compact?: boolean;
  theme: ThemeMode;
}) {
  const wordmarkAtual = theme === "light" ? wordmarkClara : wordmarkEscura;

  return (
    <div className="flex items-center gap-3">
      <img
        src={wordmarkAtual}
        alt="Logo do FlowCharts"
        className={cn(
          "h-auto object-contain",
          compact
            ? "w-[140px] sm:w-[160px]"
            : "w-[180px] sm:w-[220px] md:w-[260px]"
        )}
      />

      {!compact && (
        <div className="leading-tight">
          <p className="text-lg font-extrabold tracking-tight">FlowCharts</p>
          <p className="text-xs opacity-70">Acesso por chave</p>
        </div>
      )}
    </div>
  );
}

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: ThemeMode;
  onToggle: () => void;
}) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Alternar tema"
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300",
        isDark
          ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {isDark ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export default function AccessPage() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";

    const saved = localStorage.getItem("flowcharts-theme") as ThemeMode | null;
    if (saved === "light" || saved === "dark") return saved;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem("flowcharts-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  const trimmedCode = useMemo(() => accessCode.trim(), [accessCode]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedCode) {
      setError("Digite seu código de acesso para continuar.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    localStorage.setItem("flowcharts-access-code", trimmedCode);

    setTimeout(() => {
      setIsSubmitting(false);

      // Troque "/client" pela rota real depois.
      navigate("/homepage");
    }, 500);
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isDark ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"
      )}
    >
      <div className="relative min-h-screen overflow-hidden">
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            isDark
              ? "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_24%)]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_22%)]"
          )}
        />

        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between py-6">
            <BrandMark theme={theme} />

            <div className="flex items-center gap-3">
              <ThemeToggle
                theme={theme}
                onToggle={() =>
                  setTheme((current) => (current === "light" ? "dark" : "light"))
                }
              />

              <Link
                to="/"
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-300",
                  isDark
                    ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </div>
          </header>

          <main className="flex flex-1 items-center py-8 lg:py-12">
            <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_460px] xl:grid-cols-[1.05fr_480px]">
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="max-w-2xl"
              >
                <span
                  className={cn(
                    "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                    isDark
                      ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
                      : "border-sky-200 bg-sky-50 text-sky-700"
                  )}
                >
                  Área de acesso
                </span>

                <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Entre com sua chave e acesse seu ambiente personalizado.
                </h1>

                <p
                  className={cn(
                    "mt-6 max-w-xl text-lg leading-8 sm:text-xl",
                    isDark ? "text-slate-300" : "text-slate-600"
                  )}
                >
                  Cada cliente possui um código de acesso próprio. Com ele, o
                  FlowCharts direciona você para a área configurada para sua
                  operação, páginas e dashboards liberados.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  <div
                    className={cn(
                      "rounded-3xl border p-5",
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-4 flex h-11 w-11 items-center justify-center rounded-2xl",
                        isDark
                          ? "bg-sky-500/10 text-sky-300"
                          : "bg-sky-100 text-sky-700"
                      )}
                    >
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold">Chave exclusiva</p>
                    <p
                      className={cn(
                        "mt-2 text-sm leading-6",
                        isDark ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      Cada acesso é direcionado para um ambiente específico.
                    </p>
                  </div>

                  <div
                    className={cn(
                      "rounded-3xl border p-5",
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-4 flex h-11 w-11 items-center justify-center rounded-2xl",
                        isDark
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-emerald-100 text-emerald-700"
                      )}
                    >
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold">Entrada organizada</p>
                    <p
                      className={cn(
                        "mt-2 text-sm leading-6",
                        isDark ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      Uma porta de entrada clara antes da visualização dos dados.
                    </p>
                  </div>

                  <div
                    className={cn(
                      "rounded-3xl border p-5",
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-4 flex h-11 w-11 items-center justify-center rounded-2xl",
                        isDark
                          ? "bg-violet-500/10 text-violet-300"
                          : "bg-violet-100 text-violet-700"
                      )}
                    >
                      <LockKeyhole className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold">Fluxo seguro</p>
                    <p
                      className={cn(
                        "mt-2 text-sm leading-6",
                        isDark ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      A navegação começa com identificação simples e objetiva.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl sm:p-8",
                    isDark
                      ? "border-white/10 bg-white/5 shadow-sky-950/30"
                      : "border-slate-200 bg-white/90 shadow-slate-200/60"
                  )}
                >
                  <div
                    className={cn(
                      "absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl",
                      isDark ? "bg-sky-500/20" : "bg-sky-200/60"
                    )}
                  />
                  <div
                    className={cn(
                      "absolute -bottom-16 -left-16 h-40 w-40 rounded-full blur-3xl",
                      isDark ? "bg-blue-500/20" : "bg-blue-200/60"
                    )}
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-4">
                      <BrandMark compact theme={theme} />

                      <div
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                          isDark
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-emerald-50 text-emerald-700"
                        )}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Acesso seguro
                      </div>
                    </div>

                    <div className="mt-8">
                      <h2 className="text-2xl font-black tracking-tight">
                        Inserir código de acesso
                      </h2>
                      <p
                        className={cn(
                          "mt-3 text-sm leading-7",
                          isDark ? "text-slate-400" : "text-slate-600"
                        )}
                      >
                        Digite a chave fornecida para abrir sua área dentro do
                        sistema.
                      </p>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                      <div>
                        <label
                          htmlFor="accessCode"
                          className={cn(
                            "mb-2 block text-sm font-semibold",
                            isDark ? "text-slate-200" : "text-slate-700"
                          )}
                        >
                          Código do cliente
                        </label>

                        <div className="relative">
                          <span
                            className={cn(
                              "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2",
                              isDark ? "text-slate-400" : "text-slate-400"
                            )}
                          >
                            <KeyRound className="h-5 w-5" />
                          </span>

                          <input
                            id="accessCode"
                            name="accessCode"
                            type="text"
                            autoComplete="off"
                            placeholder="Ex: FLOW-CLIENTE-001"
                            value={accessCode}
                            onChange={(event) => setAccessCode(event.target.value)}
                            className={cn(
                              "w-full rounded-2xl border pl-12 pr-4 py-4 text-sm outline-none transition-all duration-300",
                              isDark
                                ? "border-white/10 bg-slate-900/70 text-white placeholder:text-slate-500 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/10"
                                : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                            )}
                          />
                        </div>

                        {error && (
                          <p className="mt-2 text-sm font-medium text-rose-500">
                            {error}
                          </p>
                        )}
                      </div>

                      <div
                        className={cn(
                          "rounded-2xl border p-4 text-sm leading-6",
                          isDark
                            ? "border-white/10 bg-slate-900/60 text-slate-400"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        )}
                      >
                        Esta etapa ainda não valida o código no backend. Ela apenas
                        prepara a navegação e salva a chave localmente para você
                        conectar depois.
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                          to="/"
                          className={cn(
                            "inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-sm font-semibold transition-all duration-300 sm:w-auto",
                            isDark
                              ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Voltar
                        </Link>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={cn(
                            "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold transition-all duration-300 sm:flex-1",
                            isSubmitting
                              ? "cursor-not-allowed opacity-70"
                              : "",
                            isDark
                              ? "bg-sky-500 text-white hover:bg-sky-400"
                              : "bg-sky-600 text-white hover:bg-sky-500"
                          )}
                        >
                          {isSubmitting ? "Acessando..." : "Entrar no ambiente"}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.section>
            </div>
          </main>

          <footer
            className={cn(
              "border-t py-8",
              isDark ? "border-white/10" : "border-slate-200"
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-bold tracking-tight">FlowCharts</p>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    isDark ? "text-slate-400" : "text-slate-600"
                  )}
                >
                  Acesso controlado para experiências visuais personalizadas.
                </p>
              </div>

              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-slate-500" : "text-slate-500"
                )}
              >
                Página de entrada antes da abertura das áreas do cliente.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}