import { describe, expect, it } from "vitest";
import { agentTools } from "../src/agent/createAgent.js";

describe("agentTools", () => {
  it("incluye la herramienta de precios de vuelos", () => {
    const toolNames = agentTools.map((tool) => tool.name);
    expect(toolNames).toContain("flight_prices");
  });
});
