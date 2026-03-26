# FlowCharts v2

FlowCharts v2 é uma plataforma para criação, configuração e apresentação de dashboards personalizados por cliente.

A ideia central do projeto é separar claramente:

- **Frontend** → interface, navegação e experiência do usuário
- **Backend** → regras de negócio, autenticação, pagamentos, segurança e acesso aos dados
- **Worker** → tarefas pesadas e assíncronas
- **Shared** → tipos, constantes e validações compartilhadas

---

# Objetivo do projeto

O sistema foi pensado para permitir que um cliente:

1. crie sua conta
2. faça login com segurança
3. informe um código extra de acesso ao ambiente
4. escolha e assine um plano
5. tenha seu workspace liberado
6. configure o espaço visual do seu projeto
7. monte páginas com gráficos, tabelas e filtros
8. apresente seus dashboards

---

# Arquitetura geral

```txt
flowcharts_v2/
├── Backend/
├── Frontend/
├── Shared/
├── Worker/
└── README.md
O que cada pasta principal faz
Frontend/

Responsável por toda a interface visual do sistema.

É aqui que ficam:

páginas
componentes
roteamento
integração com Firebase no navegador
integração com a API
estilização
experiência do cliente
Backend/

Responsável pela lógica central do sistema.

É aqui que ficam:

autenticação validada no servidor
regras dos planos
integração com Mercado Pago
integração com Supabase
controle do workspace
segurança de acesso
relatórios e dados administrativos
Worker/

Responsável por tarefas que não devem travar o backend principal.

Exemplos:

processamento de CSV
sincronização de pagamentos
aquecimento de cache
tarefas internas de atualização
Shared/

Responsável por manter coisas reutilizáveis entre as camadas.

Exemplos:

tipos
constantes
validações comuns
nomes padronizados
Estrutura do Frontend
Frontend/
├── public/
└── src/
    ├── app/
    ├── assets/
    ├── components/
    ├── guards/
    ├── hooks/
    ├── lib/
    ├── pages/
    ├── router/
    ├── styles/
    ├── types/
    ├── App.tsx
    └── main.tsx
Frontend/public/

Arquivos públicos servidos diretamente pelo Vite.

Usado para:

favicon
arquivos estáticos simples
assets que não precisam passar pelo bundler
Frontend/src/app/

Camada estrutural do frontend.

Guarda arquivos responsáveis pela montagem global da aplicação.

Exemplos de responsabilidade:

provedores globais
layouts gerais
constantes do app
configuração estrutural da interface

Essa pasta existe para separar a estrutura global do resto das páginas e componentes.

Frontend/src/assets/

Responsável pelos arquivos visuais do projeto.

assets/
├── icons/
└── images/
    ├── dark/
    ├── empty/
    └── light/
icons/

Guarda ícones, SVGs e elementos visuais reutilizáveis.

images/dark/

Imagens adaptadas para contexto escuro.

images/light/

Imagens adaptadas para contexto claro.

images/empty/

Imagens de estado vazio.

Exemplo:

sem dados
sem projeto criado
sem resultados encontrados

Essa separação melhora a organização visual e evita arquivos soltos.

Frontend/src/components/

Responsável por componentes reutilizáveis.

components/
├── auth/
├── billing/
├── presentation/
├── reports/
├── ui/
└── workspace/
ui/

Componentes genéricos e reutilizáveis em qualquer parte do sistema.

Exemplos:

botão
input
card
modal
tabela
select
alerta
auth/

Componentes usados nas telas de autenticação.

Exemplos:

formulário de login
formulário de cadastro
campo de código de acesso
billing/

Componentes usados na área de planos e pagamentos.

Exemplos:

card de plano
comparador de planos
resumo de cobrança
container do Payment Brick
workspace/

Componentes do ambiente principal do cliente.

Exemplos:

cabeçalho do workspace
sidebar
cards de projeto
zona de upload
editor visual de tema
indicador de realtime
reports/

Componentes usados em relatórios administrativos e comerciais.

Exemplos:

tabela de clientes pagantes
filtros de pagamento
cards de receita
gráficos de plano
presentation/

Componentes usados no modo apresentação.

Exemplos:

barra de apresentação
viewport
fullscreen toggle
Frontend/src/guards/

Responsável por travar rotas com base nas regras de acesso.

Exemplos:

exigir login
exigir código de workspace válido
impedir acesso a áreas sem assinatura ativa
Arquivos esperados
ProtectedRoute.tsx → impede acesso sem autenticação
WorkspaceRoute.tsx → impede acesso sem validação do ambiente
Frontend/src/hooks/

Responsável por hooks reutilizáveis.

Exemplos:

useDebounce.ts
useLocalStorage.ts
hooks de título de página
hooks de comportamento do workspace

Essa pasta evita repetir lógica em várias páginas.

Frontend/src/lib/

Responsável pelas integrações técnicas do frontend.

lib/
├── api/
├── firebase/
├── formatters/
├── mercadopago/
└── validators/
api/

Tudo que o frontend usa para conversar com o backend.

Exemplos:

cliente HTTP
headers de autenticação
headers do workspace
firebase/

Integração com autenticação Firebase no navegador.

Exemplos:

inicialização do Firebase
login
cadastro
logout
recuperação de sessão
formatters/

Funções utilitárias para formatação de valores.

Exemplos:

moeda
data
strings
máscaras
mercadopago/

Integração com o Brick ou camada visual do pagamento no frontend.

validators/

Validações que fazem sentido no lado do cliente.

Exemplos:

e-mail
senha
campos obrigatórios
regras simples de formulário
Frontend/src/pages/

Responsável pelas páginas reais da aplicação.

pages/
├── app/
├── auth/
├── billing/
├── onboarding/
└── presentation/
pages/auth/

Fluxo de autenticação.

Arquivos previstos:

LoginPage.tsx
RegisterPage.tsx
ForgotPasswordPage.tsx
AccessCodePage.tsx
O que cada um faz
LoginPage.tsx → entrada do usuário no sistema
RegisterPage.tsx → criação de conta
ForgotPasswordPage.tsx → recuperação de senha
AccessCodePage.tsx → segunda camada de segurança para liberar o ambiente
pages/billing/

Fluxo de planos e cobrança.

Arquivos previstos:

PlansPage.tsx
CheckoutPage.tsx
PaymentSuccessPage.tsx
PaymentPendingPage.tsx
PaymentFailurePage.tsx
O que cada um faz
PlansPage.tsx → mostra os planos disponíveis
CheckoutPage.tsx → tela de resumo e pagamento
PaymentSuccessPage.tsx → confirma aprovação
PaymentPendingPage.tsx → informa que o pagamento ainda está em análise
PaymentFailurePage.tsx → informa falha ou cancelamento
pages/onboarding/

Fluxo de configuração inicial do cliente.

Arquivos previstos:

WelcomePage.tsx
WorkspaceSetupPage.tsx
ThemeSetupPage.tsx
DataUploadPage.tsx
FirstPageSetupPage.tsx
O que cada um faz
WelcomePage.tsx → recepção inicial após liberação do plano
WorkspaceSetupPage.tsx → configurações básicas do projeto
ThemeSetupPage.tsx → identidade visual do ambiente
DataUploadPage.tsx → envio de CSVs e dados
FirstPageSetupPage.tsx → primeira página do dashboard
pages/app/

Área principal do sistema já liberado para o cliente.

Arquivos previstos:

DashboardHomePage.tsx
ProjectsPage.tsx
ProjectDetailsPage.tsx
PageBuilderPage.tsx
DatasetsPage.tsx
ReportsPage.tsx
SubscriptionPage.tsx
AccountPage.tsx
O que cada um faz
DashboardHomePage.tsx → visão geral inicial
ProjectsPage.tsx → lista de projetos
ProjectDetailsPage.tsx → detalhes do projeto
PageBuilderPage.tsx → editor das páginas
DatasetsPage.tsx → arquivos e bases de dados
ReportsPage.tsx → relatórios do workspace e relatórios administrativos
SubscriptionPage.tsx → status e gerenciamento da assinatura
AccountPage.tsx → conta do usuário
pages/presentation/

Modo de apresentação.

Arquivo previsto:

PresentationPage.tsx
O que faz

Executa a visualização voltada para apresentação final do dashboard.

Frontend/src/router/

Responsável pelo roteamento.

Arquivos previstos:

index.tsx
routes.tsx
O que fazem
index.tsx → exporta ou inicializa o roteador principal
routes.tsx → concentra a definição das rotas da aplicação

Essa pasta existe separada porque navegação é uma responsabilidade própria, diferente de componentes ou páginas.

Frontend/src/styles/

Responsável pela organização dos estilos.

styles/
├── globals.css
├── theme.css
├── pages/
│   ├── login.css
│   ├── register.css
│   ├── plans.css
│   ├── dashboard-home.css
│   └── account.css
└── editorpages/
    ├── page-builder.css
    ├── page-preview.css
    └── filters/
        ├── list-filter.css
        ├── search-filter.css
        ├── switch-filter.css
        └── period-filter.css
globals.css

Estilos globais da aplicação.

Exemplos:

reset
body
fontes
scrollbar
classes utilitárias gerais
theme.css

Responsável pelas variáveis e temas visuais.

Exemplos:

cores
background
bordas
sombras
tokens do tema claro/escuro
styles/pages/

CSS separado por contexto de página.

Exemplos:

login
cadastro
planos
dashboard inicial
conta

Essa separação existe para facilitar manutenção visual sem gerar um CSS único gigante.

styles/editorpages/

CSS específico do editor de páginas.

Arquivos:

page-builder.css → estrutura visual do construtor
page-preview.css → pré-visualização da página montada
styles/editorpages/filters/

CSS específico dos filtros personalizados renderizados no editor.

Arquivos sugeridos:

list-filter.css → filtro tipo lista/select
search-filter.css → filtro com busca
switch-filter.css → filtro binário ou de alternância
period-filter.css → filtro de período/data

Essa pasta existe porque os filtros são um bloco complexo e merecem organização própria.

Frontend/src/types/

Responsável pelos contratos de tipagem do frontend.

Arquivos previstos:

auth.ts
billing.ts
workspace.ts
dataset.ts
reports.ts

Cada arquivo agrupa tipos relacionados a um domínio do sistema.

Frontend/src/App.tsx

Componente raiz do app.

Responsável por:

montar a estrutura principal
aplicar providers
renderizar o router
Frontend/src/main.tsx

Ponto de entrada do React.

Responsável por:

inicializar a aplicação
conectar o React ao DOM
importar estilos globais
Estrutura do Backend
Backend/
└── src/
    ├── config/
    ├── lib/
    ├── middleware/
    └── modules/
        ├── access-codes/
        ├── health/
        ├── payments/
        ├── subscriptions/
        └── workspace/
config/

Configurações gerais do backend.

Exemplos:

leitura do .env
constantes de ambiente
configuração central do servidor
lib/

Integrações técnicas e clientes externos.

Exemplos:

Firebase Admin
Supabase Admin
Mercado Pago SDK
Redis/cache
websocket
middleware/

Camada intermediária das requisições.

Exemplos:

autenticação
validação de workspace
tratamento de erro
rate limit
modules/

Organização por domínio de negócio.

access-codes/

Validação do código de acesso extra ao ambiente.

health/

Rotas simples para status do sistema.

payments/

Fluxo de cobrança, confirmação e integração com Mercado Pago.

subscriptions/

Controle do plano e status da assinatura do cliente.

workspace/

Gestão do ambiente do cliente.

Estrutura do Worker
Worker/
└── src/
    ├── jobs/
    └── queues/
jobs/

Tarefas que serão executadas de forma assíncrona.

Exemplos:

processar CSV
sincronizar pagamento
preparar cache
enviar tarefas administrativas
queues/

Filas usadas para distribuir e organizar os jobs.

Estrutura do Shared
Shared/
├── constants/
├── types/
└── validators/
constants/

Constantes compartilhadas.

Exemplos:

nomes de planos
status de pagamento
rotas internas
limites padrão
types/

Tipos compartilhados entre frontend, backend e worker.

validators/

Validações comuns que fazem sentido reaproveitar.

Observações importantes
1. Nem todos os arquivos já existem completos

Alguns arquivos desta documentação já foram previstos e organizados, mas ainda serão implementados.

Ou seja: a estrutura já foi planejada para crescimento, mesmo antes de todo o código existir.

2. A arquitetura foi separada por responsabilidade

A ideia não é criar pasta por beleza, e sim por função.

Isso ajuda a:

achar arquivos mais rápido
evitar bagunça
escalar o projeto sem perder controle
facilitar manutenção futura
3. O frontend não decide regra crítica

O frontend mostra a interface e envia ações.
Quem valida:

plano
segurança
pagamento
liberação
workspace

é o backend.

Próximas etapas de implementação

A ordem recomendada é:

Frontend base (main.tsx, App.tsx, router)
Firebase no frontend
páginas de autenticação
backend inicial (server.ts, app.ts)
middleware de autenticação
código de acesso
planos e cobrança
onboarding
editor de páginas
worker e realtime
Visão final

FlowCharts v2 foi estruturado para crescer sem virar bagunça.

A arquitetura separa:

interface
regra
processamento
compartilhamento de contratos

O objetivo é construir um sistema seguro, escalável, organizado e fácil de manter.