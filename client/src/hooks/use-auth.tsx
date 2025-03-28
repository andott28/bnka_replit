import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePostHog } from "../lib/posthog-provider";
import { AnalyticsEvents } from "../lib/posthog-provider";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { trackEvent } = usePostHog();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Lagre bruker-ID for sporing når brukeren er innlogget
  useEffect(() => {
    if (user && user.id) {
      // Lagre user ID for posthog sporing
      localStorage.setItem('user_id', String(user.id));
    } else {
      // Fjern hvis bruker er utlogget
      localStorage.removeItem('user_id');
    }
  }, [user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log("Attempting login with credentials:", { username: credentials.username, passwordLength: credentials.password?.length || 0 });
        const res = await apiRequest("POST", "/api/login", credentials);
        const userData = await res.json();
        console.log("Login successful, user data:", userData);
        return userData;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log("Setting user data in query cache");
      queryClient.setQueryData(["/api/user"], user);
      
      // Spor innloggingsbegivenhet
      trackEvent(AnalyticsEvents.USER_LOGIN, {
        user_id: user.id,
        login_method: 'standard'
      });
    },
    onError: (error: Error) => {
      console.error("Login mutation error handler:", error);
      toast({
        title: "Innlogging mislyktes",
        description: error.message || "Kunne ikke koble til server. Vennligst prøv igjen senere.",
        variant: "destructive",
      });
      
      // Spor feil
      trackEvent(AnalyticsEvents.FORM_ERROR, {
        form_type: 'login',
        error_message: error.message
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      try {
        console.log("Attempting registration with credentials:", { username: credentials.username, passwordLength: credentials.password?.length || 0 });
        const res = await apiRequest("POST", "/api/register", credentials);
        const userData = await res.json();
        console.log("Registration successful, user data:", userData);
        return userData;
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log("Setting user data in query cache after registration");
      queryClient.setQueryData(["/api/user"], user);
      
      // Spor registreringsbegivenhet
      trackEvent(AnalyticsEvents.USER_REGISTER, {
        user_id: user.id
      });
    },
    onError: (error: Error) => {
      console.error("Registration mutation error handler:", error);
      toast({
        title: "Registrering mislyktes",
        description: error.message || "Kunne ikke koble til server. Vennligst prøv igjen senere.",
        variant: "destructive",
      });
      
      // Spor feil
      trackEvent(AnalyticsEvents.FORM_ERROR, {
        form_type: 'registration',
        error_message: error.message
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Attempting logout");
        await apiRequest("POST", "/api/logout");
        console.log("Logout API request successful");
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Logout successful, clearing user data");
      // Spor utloggingsbegivenhet før vi fjerner brukerdata
      if (user) {
        trackEvent(AnalyticsEvents.USER_LOGOUT, {
          user_id: user.id
        });
      }
      
      queryClient.setQueryData(["/api/user"], null);
      localStorage.removeItem('user_id');
    },
    onError: (error: Error) => {
      console.error("Logout mutation error handler:", error);
      toast({
        title: "Utlogging mislyktes",
        description: error.message || "Kunne ikke koble til server. Vennligst prøv igjen senere.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
