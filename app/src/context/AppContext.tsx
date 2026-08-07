import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Child } from "@/types";
import { getChildren } from "@/services/api";
import { getAccessToken, saveTokens, clearTokens } from "@/services/tokenStore";

interface AppContextValue {
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  isLoadingChildren: boolean;
  children: Child[];
  selectedChildId: string | null;
  selectedChild: Child | null;
  selectChild: (id: string) => void;
  signIn: (accessToken: string, refreshToken?: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  refreshChildren: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children: reactChildren }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [childList, setChildList] = useState<Child[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const refreshChildren = async () => {
    setIsLoadingChildren(true);
    try {
      const data = await getChildren();
      setChildList(data);
      setSelectedChildId((prev) => (prev && data.some((c) => c.id === prev) ? prev : data[0]?.id ?? null));
    } finally {
      setIsLoadingChildren(false);
    }
  };

  // On app launch, check for a previously-saved token so a signed-in
  // parent doesn't have to log in again every time they open the app.
  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (token) {
        setIsAuthenticated(true);
      }
      setIsRestoringSession(false);
    })();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshChildren();
    }
  }, [isAuthenticated]);

  const value = useMemo<AppContextValue>(
    () => ({
      isAuthenticated,
      isRestoringSession,
      isLoadingChildren,
      children: childList,
      selectedChildId,
      selectedChild: childList.find((c) => c.id === selectedChildId) ?? null,
      selectChild: setSelectedChildId,
      signIn: async (accessToken: string, refreshToken?: string | null) => {
        await saveTokens(accessToken, refreshToken);
        setIsAuthenticated(true);
      },
      signOut: async () => {
        await clearTokens();
        setIsAuthenticated(false);
        setChildList([]);
        setSelectedChildId(null);
      },
      refreshChildren,
    }),
    [isAuthenticated, isRestoringSession, isLoadingChildren, childList, selectedChildId]
  );

  return <AppContext.Provider value={value}>{reactChildren}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}