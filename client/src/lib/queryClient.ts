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
    console.log(`Sending ${method} request to: ${apiUrl}`);
    
    const res = await fetch(apiUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request failed: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`Request details: ${method} ${apiUrl}`);
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
      console.log(`Sending GET request to: ${apiUrl}`);
      
      const res = await fetch(apiUrl, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log("Unauthorized request (401) - returning null as configured");
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query request failed: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`Request details: GET ${apiUrl}`);
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
