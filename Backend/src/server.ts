import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`FlowCharts backend rodando na porta ${env.PORT}`);
});
