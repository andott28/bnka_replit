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
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Spor innloggingsbegivenhet
      trackEvent(AnalyticsEvents.USER_LOGIN, {
        user_id: user.id,
        login_method: 'standard'
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
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
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Spor registreringsbegivenhet
      trackEvent(AnalyticsEvents.USER_REGISTER, {
        user_id: user.id
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
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
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
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
      toast({
        title: "Logout failed",
        description: error.message,
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
