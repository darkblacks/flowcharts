import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  KeyRound,
  LayoutTemplate,
  Moon,
  PanelsTopLeft,
  Settings2,
  ShieldCheck,
  SunMedium,
} from "lucide-react";
import wordmarkEscura from "./sources/flowcharts-wordmark-dark-transparent.png";
import wordmarkClara from "./sources/flowcharts-wordmark-light-transparent.png";


  
type ThemeMode = "light" | "dark";

type Benefit = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type Step = {
  number: string;
  title: string;
  description: string;
};
const benefits: Benefit[] = [
  {
    title: "Dashboards personalizados",
    description:
      "Cada cliente acessa uma experiência visual construída para seu contexto, indicadores e necessidades específicas.",
    icon: LayoutTemplate,
  },
  {
    title: "Acesso simples por chave",
    description:
      "A entrada no sistema é direta: basta inserir o código fornecido para abrir sua área exclusiva.",
    icon: KeyRound,
  },
  {
    title: "Visualização organizada",
    description:
      "As páginas são pensadas para facilitar leitura, acompanhamento e navegação das informações.",
    icon: PanelsTopLeft,
  },
  {
    title: "Configuração sob medida",
    description:
      "O projeto pode ser adaptado para diferentes clientes, fluxos, filtros e regras visuais.",
    icon: Settings2,
  },
];

const steps: Step[] = [
  {
    number: "01",
    title: "Receba sua chave",
    description:
      "Você recebe um código de acesso exclusivo para o seu ambiente.",
  },
  {
    number: "02",
    title: "Acesse sua área",
    description:
      "Insira a chave na tela de acesso para entrar no espaço configurado para sua operação.",
  },
  {
    number: "03",
    title: "Abra seus dashboards",
    description:
      "Depois do acesso validado, visualize as páginas e painéis liberados para o seu perfil.",
  },
];

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

function SectionTitle({
  eyebrow,
  title,
  description,
  center = false,
  theme,
}: {
  eyebrow: string;
  title: string;
  description: string;
  center?: boolean;
  theme: ThemeMode;
}) {
  const isDark = theme === "dark";

  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <span
        className={cn(
          "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
          isDark
            ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
            : "border-sky-200 bg-sky-50 text-sky-700"
        )}
      >
        {eyebrow}
      </span>

      <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
        {title}
      </h2>

      <p
        className={cn(
          "mt-4 text-base leading-7 sm:text-lg",
          isDark ? "text-slate-300" : "text-slate-600"
        )}
      >
        {description}
      </p>
    </div>
  );
}

export default function HomePage() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";

    const saved = localStorage.getItem("flowcharts-theme") as ThemeMode | null;
    if (saved === "light" || saved === "dark") return saved;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    localStorage.setItem("flowcharts-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isDark
          ? "bg-slate-950 text-slate-50"
          : "bg-slate-50 text-slate-900"
      )}
    >
      <div className="relative overflow-hidden">
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            isDark
              ? "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_24%)]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_22%)]"
          )}
        />

        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
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
                to="/access"
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300",
                  isDark
                    ? "bg-sky-500 text-white hover:bg-sky-400"
                    : "bg-sky-600 text-white hover:bg-sky-500"
                )}
              >
                Acessar com código
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          <main>
            <section className="grid items-center gap-14 pb-20 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-10">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span
                  className={cn(
                    "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                    isDark
                      ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
                      : "border-sky-200 bg-sky-50 text-sky-700"
                  )}
                >
                  Plataforma FlowCharts
                </span>

                <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Dashboards personalizados para cada cliente, com acesso simples
                  e experiência profissional.
                </h1>

                <p
                  className={cn(
                    "mt-6 max-w-2xl text-lg leading-8 sm:text-xl",
                    isDark ? "text-slate-300" : "text-slate-600"
                  )}
                >
                  O FlowCharts é a porta de entrada para ambientes visuais feitos
                  sob medida. Cada cliente acessa sua própria área com chave de
                  acesso e visualização organizada.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    to="/access"
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold shadow-lg transition-all duration-300",
                      isDark
                        ? "bg-sky-500 text-white shadow-sky-500/20 hover:bg-sky-400"
                        : "bg-sky-600 text-white shadow-sky-600/20 hover:bg-sky-500"
                    )}
                  >
                    Inserir código de acesso
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href="#beneficios"
                    className={cn(
                      "inline-flex items-center justify-center rounded-2xl border px-6 py-4 text-sm font-semibold transition-all duration-300",
                      isDark
                        ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    Saiba mais
                  </a>
                </div>

                <div
                  className={cn(
                    "mt-10 grid max-w-2xl gap-4 sm:grid-cols-3",
                    isDark ? "text-slate-200" : "text-slate-700"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <p className="text-sm font-semibold">Acesso exclusivo</p>
                    <p
                      className={cn(
                        "mt-2 text-sm",
                        isDark ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      Entrada por código para cada cliente.
                    </p>
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <p className="text-sm font-semibold">Estrutura flexível</p>
                    <p
                      className={cn(
                        "mt-2 text-sm",
                        isDark ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      Layout preparado para diferentes projetos.
                    </p>
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <p className="text-sm font-semibold">Cara de produto real</p>
                    <p
                      className={cn(
                        "mt-2 text-sm",
                        isDark ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      Visual limpo, tecnológico e institucional.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="relative"
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl lg:p-8",
                    isDark
                      ? "border-white/10 bg-white/5 shadow-sky-950/30"
                      : "border-slate-200 bg-white/90 shadow-slate-200/60"
                  )}
                >
                  <div
                    className={cn(
                      "absolute -right-14 -top-14 h-40 w-40 rounded-full blur-3xl",
                      isDark ? "bg-sky-500/20" : "bg-sky-200/60"
                    )}
                  />
                  <div
                    className={cn(
                      "absolute -bottom-16 -left-16 h-44 w-44 rounded-full blur-3xl",
                      isDark ? "bg-blue-500/20" : "bg-blue-200/60"
                    )}
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between">
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

                    <div className="mt-8 grid gap-4">
                      <div
                        className={cn(
                          "rounded-3xl border p-5",
                          isDark
                            ? "border-white/10 bg-slate-900/60"
                            : "border-slate-200 bg-slate-50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Entrada por chave
                            </p>
                            <p
                              className={cn(
                                "mt-2 text-sm leading-6",
                                isDark ? "text-slate-400" : "text-slate-500"
                              )}
                            >
                              O usuário recebe um código e entra em uma área feita
                              para seu projeto.
                            </p>
                          </div>

                          <div
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-2xl",
                              isDark
                                ? "bg-sky-500/10 text-sky-300"
                                : "bg-sky-100 text-sky-700"
                            )}
                          >
                            <KeyRound className="h-6 w-6" />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div
                          className={cn(
                            "rounded-3xl border p-5",
                            isDark
                              ? "border-white/10 bg-slate-900/60"
                              : "border-slate-200 bg-slate-50"
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
                            <PanelsTopLeft className="h-5 w-5" />
                          </div>

                          <p className="text-sm font-semibold">
                            Área do cliente
                          </p>
                          <p
                            className={cn(
                              "mt-2 text-sm leading-6",
                              isDark ? "text-slate-400" : "text-slate-500"
                            )}
                          >
                            Estrutura clara para abertura das páginas liberadas.
                          </p>
                        </div>

                        <div
                          className={cn(
                            "rounded-3xl border p-5",
                            isDark
                              ? "border-white/10 bg-slate-900/60"
                              : "border-slate-200 bg-slate-50"
                          )}
                        >
                          <div
                            className={cn(
                              "mb-4 flex h-11 w-11 items-center justify-center rounded-2xl",
                              isDark
                                ? "bg-amber-500/10 text-amber-300"
                                : "bg-amber-100 text-amber-700"
                            )}
                          >
                            {isDark ? (
                              <Moon className="h-5 w-5" />
                            ) : (
                              <SunMedium className="h-5 w-5" />
                            )}
                          </div>

                          <p className="text-sm font-semibold">
                            Tema claro e escuro
                          </p>
                          <p
                            className={cn(
                              "mt-2 text-sm leading-6",
                              isDark ? "text-slate-400" : "text-slate-500"
                            )}
                          >
                            Interface preparada para alternância visual.
                          </p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "rounded-3xl border p-5",
                          isDark
                            ? "border-white/10 bg-slate-900/60"
                            : "border-slate-200 bg-slate-50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Confiabilidade
                            </p>
                            <p
                              className={cn(
                                "mt-2 text-sm leading-6",
                                isDark ? "text-slate-400" : "text-slate-500"
                              )}
                            >
                              Usar a FlowCharts transmite confiabilidade unindo clareza visual, organização profissional e tecnologia de ponta.
                            </p>
                          </div>

                          <div
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-2xl",
                              isDark
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-emerald-100 text-emerald-700"
                            )}
                          >
                            <ShieldCheck className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            <section id="beneficios" className="pb-20">
              <SectionTitle
                eyebrow="Benefícios"
                title="Uma entrada elegante para uma plataforma sob medida"
                description="O objetivo desta homepage é apresentar o FlowCharts com clareza, transmitir confiança e preparar o usuário para acessar sua área."
                theme={theme}
                center
              />

              <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {benefits.map(({ title, description, icon: Icon }, index) => (
                  <motion.article
                    key={title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className={cn(
                      "rounded-[1.75rem] border p-6 transition-transform duration-300 hover:-translate-y-1",
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-5 flex h-12 w-12 items-center justify-center rounded-2xl",
                        isDark
                          ? "bg-sky-500/10 text-sky-300"
                          : "bg-sky-100 text-sky-700"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="text-lg font-bold tracking-tight">{title}</h3>
                    <p
                      className={cn(
                        "mt-3 text-sm leading-7",
                        isDark ? "text-slate-400" : "text-slate-600"
                      )}
                    >
                      {description}
                    </p>
                  </motion.article>
                ))}
              </div>
            </section>

            <section className="pb-24">
              <div
                className={cn(
                  "rounded-[2rem] border p-8 sm:p-10 lg:p-12",
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-white"
                )}
              >
                <SectionTitle
                  eyebrow="Como funciona"
                  title="Um fluxo direto, simples e profissional"
                  description="A entrada no sistema foi pensada para ser clara desde o primeiro contato."
                  theme={theme}
                />

                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.number}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.35, delay: index * 0.06 }}
                      className={cn(
                        "rounded-[1.75rem] border p-6",
                        isDark
                          ? "border-white/10 bg-slate-900/50"
                          : "border-slate-200 bg-slate-50"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-[0.18em]",
                          isDark
                            ? "bg-sky-500/10 text-sky-300"
                            : "bg-sky-100 text-sky-700"
                        )}
                      >
                        {step.number}
                      </span>

                      <h3 className="mt-5 text-xl font-bold tracking-tight">
                        {step.title}
                      </h3>

                      <p
                        className={cn(
                          "mt-3 text-sm leading-7",
                          isDark ? "text-slate-400" : "text-slate-600"
                        )}
                      >
                        {step.description}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-10">
                  <Link
                    to="/access"
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold transition-all duration-300",
                      isDark
                        ? "bg-sky-500 text-white hover:bg-sky-400"
                        : "bg-sky-600 text-white hover:bg-sky-500"
                    )}
                  >
                    Ir para a tela de acesso
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
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
                  Plataforma visual para experiências de dados personalizadas.
                </p>
              </div>

              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-slate-500" : "text-slate-500"
                )}
              >
                Entrada institucional do sistema antes do acesso do cliente.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}