"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, type ReactNode, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

import { ConfigContextProvider } from "config";
import { CosmosKitProvider } from "features/cosmos-kit";
import { CosmosWalletProvider } from "features/cosmos-wallet";
import { AstriaWalletContextProvider } from "features/evm-wallet";
import { NotificationsContextProvider } from "features/notifications";
import { PrivyProvider } from "features/privy";
import { WagmiProvider } from "features/wagmi";

// tanstack
const queryClient = new QueryClient();

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setResolvedTheme(systemTheme);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        setResolvedTheme(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Common providers for the entire app
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <IntlProvider locale="en">
        <NotificationsContextProvider>
          <ConfigContextProvider>
            <PrivyProvider>
              <QueryClientProvider client={queryClient}>
                <WagmiProvider>
                  <CosmosKitProvider>
                    <AstriaWalletContextProvider>
                      {/* Bridge specific providers moved here from bridge/layout.tsx to
                        prevent re-initialization during page navigation */}
                      <CosmosWalletProvider>{children}</CosmosWalletProvider>
                    </AstriaWalletContextProvider>
                  </CosmosKitProvider>
                </WagmiProvider>
              </QueryClientProvider>
            </PrivyProvider>
          </ConfigContextProvider>
        </NotificationsContextProvider>
      </IntlProvider>
    </ThemeProvider>
  );
}
