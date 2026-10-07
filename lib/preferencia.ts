"use client";

import { useCallback, useSyncExternalStore } from "react";

// Preferências pequenas do aparelho (ex.: grade ou lista). Sem armazenamento, usa o padrão.
const ouvintes = new Set<() => void>();

export function usePreferencia<T extends string>(chave: string, padrao: T): [T, (valor: T) => void] {
  const valor = useSyncExternalStore(
    (o) => {
      ouvintes.add(o);
      return () => ouvintes.delete(o);
    },
    () => {
      try {
        return (localStorage.getItem(`zerei:${chave}`) as T | null) ?? padrao;
      } catch {
        return padrao;
      }
    },
    () => padrao,
  );

  const definir = useCallback(
    (novo: T) => {
      try {
        localStorage.setItem(`zerei:${chave}`, novo);
      } catch {
        // ignora
      }
      ouvintes.forEach((o) => o());
    },
    [chave],
  );

  return [valor, definir];
}
