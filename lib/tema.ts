"use client";

import { useSyncExternalStore } from "react";
import { CHAVE_TEMA as CHAVE } from "./tema-script";

export type Tema = "sistema" | "claro" | "escuro";

const ouvintes = new Set<() => void>();

function ler(): Tema {
  try {
    const t = localStorage.getItem(CHAVE);
    return t === "claro" || t === "escuro" ? t : "sistema";
  } catch {
    return "sistema";
  }
}

export function definirTema(tema: Tema) {
  try {
    if (tema === "sistema") localStorage.removeItem(CHAVE);
    else localStorage.setItem(CHAVE, tema);
  } catch {
    // sem armazenamento: vale só nesta sessão
  }
  const raiz = document.documentElement;
  if (tema === "sistema") delete raiz.dataset.theme;
  else raiz.dataset.theme = tema === "claro" ? "light" : "dark";
  ouvintes.forEach((o) => o());
}

export function useTema() {
  return useSyncExternalStore(
    (o) => {
      ouvintes.add(o);
      return () => ouvintes.delete(o);
    },
    ler,
    () => "sistema" as Tema,
  );
}
