"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ResultadoBusca, TipoMidia } from "./tipos";

export type FiltroBusca = "tudo" | TipoMidia;

export class ErroBusca extends Error {
  constructor(
    public codigo: string,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

async function buscarEm(url: string): Promise<ResultadoBusca[]> {
  const resposta = await fetch(url);
  const json = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new ErroBusca(json.erro ?? "falha", json.mensagem ?? "Falha na busca");
  return json.resultados as ResultadoBusca[];
}

/** Intercala jogos e filmes/séries para a aba "Tudo". */
function intercalar(a: ResultadoBusca[], b: ResultadoBusca[]) {
  const saida: ResultadoBusca[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) saida.push(a[i]);
    if (b[i]) saida.push(b[i]);
  }
  return saida;
}

export function useBusca(termo: string, filtro: FiltroBusca) {
  return useQuery({
    queryKey: ["busca", filtro, termo],
    enabled: termo.length >= 2,
    networkMode: "online",
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: false,
    queryFn: async () => {
      const q = encodeURIComponent(termo);
      if (filtro === "jogo") return buscarEm(`/api/igdb?q=${q}`);
      if (filtro !== "tudo") return buscarEm(`/api/tmdb?q=${q}&tipo=${filtro}`);

      // Tudo: se uma das APIs falhar, mostra o que a outra trouxe
      const [jogos, filmes] = await Promise.allSettled([
        buscarEm(`/api/igdb?q=${q}`),
        buscarEm(`/api/tmdb?q=${q}`),
      ]);
      if (jogos.status === "rejected" && filmes.status === "rejected") throw jogos.reason;
      return intercalar(
        jogos.status === "fulfilled" ? jogos.value : [],
        filmes.status === "fulfilled" ? filmes.value : [],
      );
    },
  });
}

/** Espera o usuário parar de digitar (poupa o limite da IGDB). */
export function useAtrasado<T>(valor: T, ms = 450) {
  const [atrasado, setAtrasado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setAtrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return atrasado;
}
