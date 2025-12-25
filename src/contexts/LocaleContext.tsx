import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { translate, SupportedLocale } from "@/lib/i18n";

type Locale = SupportedLocale;

interface LocaleContextValue {
  locale: Locale;
  toggleLocale: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("locale") as Locale | null;
      if (stored === "ar" || stored === "en") return stored;
    }
    return "en";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale === "ar" ? "ar" : "en";
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("locale", locale);
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      toggleLocale: () => setLocale((prev) => (prev === "ar" ? "en" : "ar")),
      t: (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
