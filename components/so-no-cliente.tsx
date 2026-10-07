"use client";

import { useSyncExternalStore } from "react";

const nada = () => () => {};

/**
 * As telas do app vivem de dados do aparelho (cópia offline) e da data atual:
 * no servidor sai só o esqueleto, e a tela de verdade aparece já no navegador,
 * sem divergência na hidratação.
 */
export function SoNoCliente({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const noCliente = useSyncExternalStore(nada, () => true, () => false);
  return noCliente ? children : fallback;
}
