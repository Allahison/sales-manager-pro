import { createContext, useContext, useEffect } from "react";
import { useLocation } from "wouter";
import {
  getGetCurrentUserQueryKey,
  useGetCurrentUser,
  useLogout,
  type User,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  });

  const { mutate: performLogout } = useLogout({
    mutation: {
      onSuccess: () => {
        window.localStorage.removeItem("auth_token");
        queryClient.clear();
        setLocation("/login");
        toast({ title: "Logged out successfully" });
      },
      onError: () => {
        window.localStorage.removeItem("auth_token");
        queryClient.clear();
        setLocation("/login");
      }
    }
  });

  const handleLogout = () => {
    performLogout();
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, logout: handleLogout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
