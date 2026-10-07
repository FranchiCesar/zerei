"use client";

import Link from "next/link";
import { Download, X } from "lucide-react";
import { dispensarAviso, useInstalacao } from "@/lib/instalacao";

/** Cartão na Início convidando a instalar. Some quando instalado ou dispensado. */
export function AvisoInstalar() {
  const { plataforma, avisoDispensado } = useInstalacao();

  if (
    avisoDispensado ||
    plataforma === "instalado" ||
    plataforma === "desconhecida" ||
    plataforma === "desktop"
  ) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center gap-3 rounded-[22px] bg-tinta p-3 pl-4 text-white">
      <Download size={22} strokeWidth={2.2} className="shrink-0 text-marca" />
      <p className="flex-1 text-13 font-bold leading-snug">
        Instale o Zerei na tela inicial e abra como app.
      </p>
      <Link
        href="/instalar"
        className="flex h-11 items-center rounded-full bg-marca px-4 text-13 font-bold"
      >
        Instalar
      </Link>
      <button
        type="button"
        onClick={dispensarAviso}
        aria-label="Dispensar aviso de instalação"
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-white/70 hover:text-white"
      >
        <X size={20} strokeWidth={2.2} />
      </button>
    </div>
  );
}
