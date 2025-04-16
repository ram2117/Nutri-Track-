
import React, { createContext, useState, useContext, useEffect } from "react";

type ApiKeyContextType = {
  apiKey: string;
  setApiKey: (key: string) => void;
};

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    // Try to get API key from localStorage during initialization
    if (typeof window !== 'undefined') {
      return localStorage.getItem("gemini_api_key") || "";
    }
    return "";
  });

  // Save to localStorage when apiKey changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("gemini_api_key", apiKey);
    }
  }, [apiKey]);

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return context;
};
