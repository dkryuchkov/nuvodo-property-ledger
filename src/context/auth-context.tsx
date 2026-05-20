"use client";

import React, { createContext, useContext } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

interface AuthContextType {
  user: any;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const loginWithGoogle = async () => {
    await signIn("google");
  };

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ user: session?.user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
