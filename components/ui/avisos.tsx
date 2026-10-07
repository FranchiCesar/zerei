"use client";

import { fecharAviso, useAvisos } from "@/lib/avisos";
import { Mascote } from "./mascote";

export function Avisos() {
  const avisos = useAvisos();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-md flex-col items-center gap-2 px-4"
    >
      {avisos.map((aviso) => (
        <button
          key={aviso.id}
          type="button"
          onClick={() => fecharAviso(aviso.id)}
          className={`pointer-events-auto flex min-h-11 w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-13 font-bold shadow-lg ${
            aviso.tipo === "erro"
              ? "bg-status-abandonado text-white"
              : aviso.tipo === "conquista"
                ? "bg-conquista text-tinta"
                : "bg-tinta text-white"
          }`}
        >
          <Mascote
            expressao={aviso.tipo === "erro" ? "tonto" : aviso.tipo === "conquista" ? "comemorando" : "feliz"}
            animacao={aviso.tipo === "conquista" ? "pular" : undefined}
            className="h-8 w-auto shrink-0"
          />
          {aviso.texto}
        </button>
      ))}
    </div>
  );
}
