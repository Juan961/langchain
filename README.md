# 10Xbuilder Agents

Agent with LangChain and TypeScript (ESM) that uses tools to solve calculations, return the current time, and estimate flight prices.

## Requirements

- Node.js 20+
- npm 10+
- OpenRouter API key

## Installation

```bash
npm install
```

## Environment setup

This project loads configuration from `env.local` at the repository root.

```bash
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TEMPERATURE=0
OPENROUTER_HTTP_REFERER=https://your-app-domain.com
OPENROUTER_APP_TITLE=10Xbuilder Agents
FLIGHT_API_BASE_URL=https://your-flight-provider.example.com/prices
FLIGHT_API_KEY=optional_provider_api_key
FLIGHT_API_TIMEOUT_MS=3500
```

The flight API variables are optional. If they are missing (or the provider fails), the agent returns a deterministic local estimate so the project keeps working in learning environments.

## Run in development

```bash
npm run dev
```

With a custom question:

```bash
npm run dev -- "What is 25% of 240 and what time is it now?"
```

Flight query example:

```bash
npm run dev -- "Cuánto cuesta un vuelo de EZE a MAD el 2099-07-15?"
```

## Scripts

- `npm run dev`: runs the agent with `tsx`.
- `npm run build`: compiles to `dist/`.
- `npm run start`: runs the compiled build.
- `npm run test`: runs tests once.
- `npm run test:watch`: runs tests in watch mode.
- `npm run lint`: runs ESLint.
- `npm run typecheck`: validates types without emitting build output.

## Architecture overview

The project is organized in layers so each concern stays isolated and easy to evolve:

- **Interface layer**: `src/index.ts` provides a CLI entry point and sends user input to the agent runtime.
- **Application layer**: `src/agent/runAgent.ts` exposes a single execution function and supports dependency injection for testing.
- **Composition layer**: `src/agent/createAgent.ts` assembles model, prompt, and tools into an `AgentExecutor`.
- **Domain capabilities**: `src/agent/tools/*` defines reusable tools such as `calculator`, `current_time`, and `flight_prices`.
- **Configuration layer**: `src/config/env.ts` loads and validates environment variables with `zod`.

For a deeper architectural breakdown, see `docs/architecture.md`.

## Project structure

- `src/index.ts`: CLI entry point.
- `src/config/env.ts`: environment loading and validation.
- `src/agent`: agent setup, prompt, tools, and runner.
- `tests`: Vitest test suite.
- `docs/architecture.md`: architecture documentation.

## Add a new tool

1. Create a new file in `src/agent/tools`.
2. Export the tool using LangChain `tool(...)`.
3. Register it in `src/agent/createAgent.ts`.
4. Update `src/agent/prompt.ts` to describe when to use it.

## Available tools

- `calculator`: evaluates simple math expressions.
- `current_time`: returns current time (`es-CO` locale formatting).
- `flight_prices`: returns a flight fare from route/date input.
	- Input: `origin`, `destination` (IATA), `departureDate` (`YYYY-MM-DD`), optional `passengers`, optional `currency`.
	- Output: textual fare summary in Spanish.
	- Behavior: uses provider API when configured and available, otherwise falls back to deterministic local estimation.

## Notes

The `calculator` tool currently uses `Function(...)`. For production usage, replace it with a safe parser/evaluator.
