"use client";

import { useSyncExternalStore } from "react";

export interface Aviso {
  id: number;
  texto: string;
  tipo: "ok" | "erro" | "conquista";
}

let avisos: Aviso[] = [];
let proximoId = 1;
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((o) => o());

/** Mensagem rápida no rodapé (toast). */
export function mostrarAviso(texto: string, tipo: Aviso["tipo"] = "ok") {
  const id = proximoId++;
  avisos = [...avisos, { id, texto, tipo }];
  avisar();
  setTimeout(() => fecharAviso(id), tipo === "erro" ? 5000 : 3200);
}

export function fecharAviso(id: number) {
  avisos = avisos.filter((a) => a.id !== id);
  avisar();
}

/** Erro do Supabase/rede → frase amigável. */
export function avisarErro(erro: unknown, padrao = "Não deu certo. Tente de novo.") {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  mostrarAviso(offline ? "Sem internet agora. Tente quando a conexão voltar." : padrao, "erro");
  if (!offline) console.error(erro);
}

export function useAvisos() {
  return useSyncExternalStore(
    (o) => {
      ouvintes.add(o);
      return () => ouvintes.delete(o);
    },
    () => avisos,
    () => avisos,
  );
}
