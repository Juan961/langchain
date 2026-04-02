import { describe, expect, it, vi } from "vitest";
import {
  flightPricesTool,
  getFlightPriceQuote,
  type FlightPriceInput
} from "../src/agent/tools/flightPrices.js";

describe("flightPricesTool", () => {
  it("devuelve una tarifa en texto para una ruta válida", async () => {
    const result = await flightPricesTool.invoke({
      origin: "EZE",
      destination: "MAD",
      departureDate: "2099-07-15"
    });

    expect(result).toContain("Tarifa desde");
    expect(result).toContain("EZE -> MAD");
  });

  it("rechaza fechas pasadas", async () => {
    const result = await flightPricesTool.invoke({
      origin: "BOG",
      destination: "MAD",
      departureDate: "2000-01-01"
    });

    expect(result).toBe("No pude consultar el precio: la fecha de salida debe ser hoy o futura.");
  });

  it("rechaza origen y destino iguales", async () => {
    const result = await flightPricesTool.invoke({
      origin: "MEX",
      destination: "MEX",
      departureDate: "2099-01-01"
    });

    expect(result).toBe("No pude consultar el precio: origen y destino no pueden ser iguales.");
  });
});

describe("getFlightPriceQuote", () => {
  it("usa proveedor API cuando responde correctamente", async () => {
    const input: FlightPriceInput = {
      origin: "BOG",
      destination: "MAD",
      departureDate: "2099-02-10",
      passengers: 1,
      currency: "USD"
    };

    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ price: 720, currency: "USD" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const previousBaseUrl = process.env.FLIGHT_API_BASE_URL;
    process.env.FLIGHT_API_BASE_URL = "https://example.com/flight-prices";

    const quote = await getFlightPriceQuote(input, { fetchFn });

    expect(fetchFn).toHaveBeenCalledOnce();
    expect(quote).toEqual({
      price: 720,
      currency: "USD",
      source: "api"
    });

    if (previousBaseUrl) {
      process.env.FLIGHT_API_BASE_URL = previousBaseUrl;
    } else {
      delete process.env.FLIGHT_API_BASE_URL;
    }
  });

  it("hace fallback local cuando la API falla", async () => {
    const input: FlightPriceInput = {
      origin: "JFK",
      destination: "CDG",
      departureDate: "2099-05-01",
      passengers: 2,
      currency: "EUR"
    };

    const fetchFn = vi.fn().mockRejectedValue(new Error("network"));

    const previousBaseUrl = process.env.FLIGHT_API_BASE_URL;
    process.env.FLIGHT_API_BASE_URL = "https://example.com/flight-prices";

    const quote = await getFlightPriceQuote(input, { fetchFn });

    expect(fetchFn).toHaveBeenCalledOnce();
    expect(quote.source).toBe("fallback");
    expect(quote.currency).toBe("EUR");
    expect(quote.price).toBeGreaterThan(0);

    if (previousBaseUrl) {
      process.env.FLIGHT_API_BASE_URL = previousBaseUrl;
    } else {
      delete process.env.FLIGHT_API_BASE_URL;
    }
  });
});
