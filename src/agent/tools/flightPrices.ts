import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const flightPriceInputSchema = z.object({
  origin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "El origen debe ser un código IATA de 3 letras."),
  destination: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "El destino debe ser un código IATA de 3 letras."),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe usar formato YYYY-MM-DD."),
  passengers: z.coerce.number().int().positive().default(1),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "La moneda debe ser un código ISO de 3 letras.")
    .default("USD")
});

export type FlightPriceInput = z.infer<typeof flightPriceInputSchema>;

interface FlightQuote {
  price: number;
  currency: string;
  source: "api" | "fallback";
}

interface FlightToolOptions {
  fetchFn?: typeof fetch;
  now?: () => Date;
}

function isValidISODate(dateString: string): boolean {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === dateString;
}

function isFutureOrToday(dateString: string, now: Date): boolean {
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  const target = new Date(`${dateString}T00:00:00.000Z`);
  return target.getTime() >= today.getTime();
}

function estimateFallbackPrice(input: FlightPriceInput): number {
  const seed = `${input.origin}${input.destination}${input.departureDate}${input.passengers}`;
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const basePrice = 180 + (hash % 620);
  const passengersMultiplier = 1 + (input.passengers - 1) * 0.92;
  return Math.round(basePrice * passengersMultiplier);
}

async function fetchPriceFromApi(input: FlightPriceInput, fetchFn: typeof fetch): Promise<FlightQuote | null> {
  const baseUrl = process.env.FLIGHT_API_BASE_URL;
  if (!baseUrl) {
    return null;
  }

  const endpoint = new URL(baseUrl);
  endpoint.searchParams.set("origin", input.origin);
  endpoint.searchParams.set("destination", input.destination);
  endpoint.searchParams.set("departureDate", input.departureDate);
  endpoint.searchParams.set("passengers", String(input.passengers));
  endpoint.searchParams.set("currency", input.currency);

  const headers: Record<string, string> = {};
  if (process.env.FLIGHT_API_KEY) {
    headers.Authorization = `Bearer ${process.env.FLIGHT_API_KEY}`;
  }

  const timeoutMs = Number(process.env.FLIGHT_API_TIMEOUT_MS ?? "3500");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(endpoint, {
      method: "GET",
      headers,
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      price?: number;
      amount?: number;
      currency?: string;
      data?: {
        price?: number;
        amount?: number;
        currency?: string;
      };
    };

    const rawPrice = payload.price ?? payload.amount ?? payload.data?.price ?? payload.data?.amount;

    if (typeof rawPrice !== "number" || Number.isNaN(rawPrice) || rawPrice <= 0) {
      return null;
    }

    const currency = payload.currency ?? payload.data?.currency ?? input.currency;

    return {
      price: Math.round(rawPrice),
      currency,
      source: "api"
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getFlightPriceQuote(
  input: FlightPriceInput,
  options: FlightToolOptions = {}
): Promise<FlightQuote> {
  const fetchFn = options.fetchFn ?? fetch;
  const apiQuote = await fetchPriceFromApi(input, fetchFn);

  if (apiQuote) {
    return apiQuote;
  }

  return {
    price: estimateFallbackPrice(input),
    currency: input.currency,
    source: "fallback"
  };
}

export const flightPricesTool = tool(
  async (params) => {
    const input = flightPriceInputSchema.parse(params);
    const now = new Date();

    if (!isValidISODate(input.departureDate)) {
      return "No pude consultar el precio: la fecha no es válida.";
    }

    if (!isFutureOrToday(input.departureDate, now)) {
      return "No pude consultar el precio: la fecha de salida debe ser hoy o futura.";
    }

    if (input.origin === input.destination) {
      return "No pude consultar el precio: origen y destino no pueden ser iguales.";
    }

    const quote = await getFlightPriceQuote(input);
    const sourceNote =
      quote.source === "api"
        ? "fuente externa"
        : "estimación local (sin API configurada o sin respuesta del proveedor)";

    return `Tarifa desde ${quote.currency} ${quote.price} para vuelo ${input.origin} -> ${input.destination} el ${input.departureDate} para ${input.passengers} pasajero(s), usando ${sourceNote}.`;
  },
  {
    name: "flight_prices",
    description:
      "Consulta el precio de un vuelo para una ruta y fecha. Usa códigos IATA (3 letras), fecha YYYY-MM-DD, pasajeros y moneda opcional.",
    schema: flightPriceInputSchema
  }
);
