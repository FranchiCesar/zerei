"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";
import { Avisos } from "@/components/ui/avisos";
import { persistidorDexie } from "@/lib/offline";

export function Provedores({ children }: { children: React.ReactNode }) {
  const [cliente] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Mostra a cópia local na hora e atualiza por trás
            networkMode: "offlineFirst",
            staleTime: 30_000,
            gcTime: 1000 * 60 * 60 * 24 * 7,
            retry: 1,
            refetchOnWindowFocus: true,
          },
          mutations: { networkMode: "offlineFirst" },
        },
      }),
  );

  return (
    <PersistQueryClientProvider
      client={cliente}
      persistOptions={{
        persister: persistidorDexie,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        buster: "v1",
        // Resultados de busca não precisam ficar no aparelho
        dehydrateOptions: {
          shouldDehydrateQuery: (q) => q.queryKey[0] !== "busca" && q.state.status === "success",
        },
      }}
    >
      {children}
      <Avisos />
    </PersistQueryClientProvider>
  );
}
