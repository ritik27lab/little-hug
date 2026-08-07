import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Child } from "@/types";
import { getChildren } from "@/services/api";

interface AppContextValue {
  isAuthenticated: boolean;
  isLoadingChildren: boolean;
  children: Child[];
  selectedChildId: string | null;
  selectedChild: Child | null;
  selectChild: (id: string) => void;
  signIn: () => void;
  signOut: () => void;
  refreshChildren: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children: reactChildren,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [childList, setChildList] = useState<Child[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const refreshChildren = async () => {
    setIsLoadingChildren(true);
    try {
      const data = await getChildren();
      setChildList(data);
      if (data.length > 0) {
        setSelectedChildId((prev) => prev ?? data[0].id);
      }
    } finally {
      setIsLoadingChildren(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshChildren();
    }
  }, [isAuthenticated]);

  const value = useMemo<AppContextValue>(
    () => ({
      isAuthenticated,
      isLoadingChildren,
      children: childList,
      selectedChildId,
      selectedChild: childList.find((c) => c.id === selectedChildId) ?? null,
      selectChild: setSelectedChildId,
      signIn: () => setIsAuthenticated(true),
      signOut: () => {
        setIsAuthenticated(false);
        setChildList([]);
        setSelectedChildId(null);
      },
      refreshChildren,
    }),
    [isAuthenticated, isLoadingChildren, childList, selectedChildId],
  );

  return (
    <AppContext.Provider value={value}>{reactChildren}</AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
