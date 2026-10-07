"use client";

import { useSyncExternalStore } from "react";

// Evento do Chrome/Edge no Android e desktop; não existe no Safari.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type Plataforma =
  | "instalado" // já aberto como app
  | "ios" // iPhone/iPad: só pelo menu Compartilhar
  | "ios-embutido" // navegador de dentro de outro app (Instagram etc.)
  | "android"
  | "desktop"
  | "desconhecida"; // servidor

export interface EstadoInstalacao {
  plataforma: Plataforma;
  /** O navegador ofereceu o prompt nativo de instalação. */
  podeInstalar: boolean;
  /** O usuário fechou o aviso de instalação na Início. */
  avisoDispensado: boolean;
}

const CHAVE_DISPENSADO = "zerei:instalar-dispensado";

const estadoServidor: EstadoInstalacao = {
  plataforma: "desconhecida",
  podeInstalar: false,
  avisoDispensado: true,
};

let promptGuardado: BeforeInstallPromptEvent | null = null;
let instaladoAgora = false;
let estado: EstadoInstalacao | null = null;
const ouvintes = new Set<() => void>();

function detectarPlataforma(): Plataforma {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (
    instaladoAgora ||
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  ) {
    return "instalado";
  }
  const ua = nav.userAgent;
  // iPadOS se apresenta como Mac, mas tem tela de toque
  const ehIOS =
    /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && nav.maxTouchPoints > 1);
  if (ehIOS) {
    return /FBAN|FBAV|Instagram|Line\/|TikTok|Twitter/i.test(ua) ? "ios-embutido" : "ios";
  }
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function lerDispensado() {
  try {
    return window.localStorage.getItem(CHAVE_DISPENSADO) === "1";
  } catch {
    return false;
  }
}

function recalcular() {
  estado = {
    plataforma: detectarPlataforma(),
    podeInstalar: promptGuardado !== null,
    avisoDispensado: lerDispensado(),
  };
  ouvintes.forEach((avisar) => avisar());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (evento) => {
    evento.preventDefault();
    promptGuardado = evento as BeforeInstallPromptEvent;
    recalcular();
  });
  window.addEventListener("appinstalled", () => {
    promptGuardado = null;
    instaladoAgora = true;
    recalcular();
  });
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
}

function lerEstado() {
  if (estado === null) {
    estado = {
      plataforma: detectarPlataforma(),
      podeInstalar: promptGuardado !== null,
      avisoDispensado: lerDispensado(),
    };
  }
  return estado;
}

export function useInstalacao() {
  return useSyncExternalStore(assinar, lerEstado, () => estadoServidor);
}

/** Abre o prompt nativo. Retorna true se o usuário aceitou. */
export async function pedirInstalacao() {
  if (!promptGuardado) return false;
  const evento = promptGuardado;
  await evento.prompt();
  const { outcome } = await evento.userChoice;
  promptGuardado = null;
  recalcular();
  return outcome === "accepted";
}

export function dispensarAviso() {
  try {
    window.localStorage.setItem(CHAVE_DISPENSADO, "1");
  } catch {
    // Sem armazenamento (aba anônima): o aviso só some nesta sessão
  }
  estado = { ...lerEstado(), avisoDispensado: true };
  ouvintes.forEach((avisar) => avisar());
}
