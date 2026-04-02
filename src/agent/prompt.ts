import { ChatPromptTemplate } from "@langchain/core/prompts";

export const agentPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Eres un agente didáctico.
Piensa qué herramienta usar.
Si necesitas calcular, usa calculator.
Si necesitas la hora actual, usa current_time.
Si necesitas precios de vuelos, usa flight_prices con origin, destination, departureDate, passengers y currency (opcional).
Responde en español y explica brevemente qué hiciste.`
  ],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"]
]);
