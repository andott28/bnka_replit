import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Funksjon for å hente API base URL basert på miljø
function getApiBaseUrl(): string {
  // Sjekk om vi er i produksjonsmiljø (Netlify)
  if (import.meta.env.PROD) {
    return 'https://krivo-api.replit.app'; // Erstatt med din faktiske backend URL
  }
  // I utviklingsmiljø, bruk relativ URL
  return '';
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const apiUrl = `${getApiBaseUrl()}${url}`;
  
  try {
    console.log(`Sender ${method} forespørsel til: ${apiUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 sekunder timeout
    
    const res = await fetch(apiUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
      // Cache-kontrollflagg for å unngå caching-problemer
      cache: 'no-cache',
    }).finally(() => clearTimeout(timeoutId));
    
    // Legg til detaljert loggføring av respons
    console.log(`Fikk respons fra ${apiUrl}: Status ${res.status}`);
    
    // Håndtere spesifikke HTTP-statuskoder på en mer detaljert måte
    if (res.status === 401) {
      console.warn("Autentiseringsfeil (401) på:", apiUrl);
      const error = new Error("Ikke autorisert");
      (error as any).response = res.clone();
      throw error;
    }
    
    if (res.status === 403) {
      console.warn("Forbudtfeil (403) på:", apiUrl);
      const error = new Error("Ingen tilgang");
      (error as any).response = res.clone();
      throw error;
    }
    
    if (res.status === 404) {
      console.warn("Ressurs ikke funnet (404) på:", apiUrl);
      const error = new Error("Ressurs ikke funnet");
      (error as any).response = res.clone();
      throw error;
    }
    
    if (res.status >= 500) {
      console.error("Serverfeil på:", apiUrl);
      const error = new Error("Serverfeil - prøv igjen senere");
      (error as any).response = res.clone();
      throw error;
    }

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API-forespørsel mislyktes: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`Forespørselsdetaljer: ${method} ${apiUrl}`);
    
    // Håndtere nettverksfeil med mer spesifikke meldinger
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error("Nettverksfeil - kunne ikke nå serveren");
      throw new Error("Kunne ikke koble til serveren. Sjekk internettforbindelsen din.");
    }
    
    // Håndtere timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error("Forespørselen ble tidsavbrutt");
      throw new Error("Forespørselen tok for lang tid. Prøv igjen senere.");
    }
    
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const apiUrl = `${getApiBaseUrl()}${url}`;
    
    try {
      console.log(`Sender GET-forespørsel til: ${apiUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 sekunder timeout
      
      const res = await fetch(apiUrl, {
        credentials: "include",
        signal: controller.signal,
        cache: 'no-cache',
      }).finally(() => clearTimeout(timeoutId));
      
      console.log(`Fikk respons fra ${apiUrl}: Status ${res.status}`);

      // Håndter 401 basert på konfigurasjonen
      if (res.status === 401) {
        console.log("Ikke autentisert (401)");
        if (unauthorizedBehavior === "returnNull") {
          console.log("Returnerer null i henhold til konfigurasjonen");
          return null;
        } else {
          console.warn("Autentiseringsfeil (401)");
          const error = new Error("Ikke pålogget");
          (error as any).response = res.clone();
          throw error;
        }
      }
      
      // Håndtere andre spesifikke HTTP-statuskoder
      if (res.status === 403) {
        console.warn("Forbudtfeil (403) på:", apiUrl);
        const error = new Error("Ingen tilgang");
        (error as any).response = res.clone();
        throw error;
      }
      
      if (res.status === 404) {
        console.warn("Ressurs ikke funnet (404) på:", apiUrl);
        const error = new Error("Ressurs ikke funnet");
        (error as any).response = res.clone();
        throw error;
      }
      
      if (res.status >= 500) {
        console.error("Serverfeil på:", apiUrl);
        const error = new Error("Serverfeil - prøv igjen senere");
        (error as any).response = res.clone();
        throw error;
      }

      await throwIfResNotOk(res);
      
      // Sjekk om responsen er JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      } else {
        console.error("Uventet respons-format (ikke JSON)");
        throw new Error("Uventet serverrespons");
      }
    } catch (error) {
      console.error(`Query-forespørsel mislyktes: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`Forespørselsdetaljer: GET ${apiUrl}`);
      
      // Håndtere nettverksfeil med mer spesifikke meldinger
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error("Nettverksfeil - kunne ikke nå serveren");
        throw new Error("Kunne ikke koble til serveren. Sjekk internettforbindelsen din.");
      }
      
      // Håndtere timeout
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error("Forespørselen ble tidsavbrutt");
        throw new Error("Forespørselen tok for lang tid. Prøv igjen senere.");
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
