import { describe, expect, it, vi } from "vitest";
import { runAgent } from "../src/agent/runAgent.js";

describe("runAgent", () => {
  it("retorna output cuando el executor responde", async () => {
    const executor = {
      invoke: vi.fn().mockResolvedValue({ output: "resultado de prueba" })
    };

    const output = await runAgent("pregunta", { executor });

    expect(executor.invoke).toHaveBeenCalledWith({ input: "pregunta" });
    expect(output).toBe("resultado de prueba");
  });

  it("mantiene el contrato cuando la pregunta es de vuelos", async () => {
    const executor = {
      invoke: vi.fn().mockResolvedValue({ output: "Tarifa desde USD 540 para vuelo EZE -> MAD" })
    };

    const output = await runAgent("¿Cuánto cuesta un vuelo de Buenos Aires a Madrid el 15 de julio?", {
      executor
    });

    expect(executor.invoke).toHaveBeenCalledWith({
      input: "¿Cuánto cuesta un vuelo de Buenos Aires a Madrid el 15 de julio?"
    });
    expect(output).toContain("Tarifa desde");
  });
});
