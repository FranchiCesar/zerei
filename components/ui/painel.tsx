"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/** Painel inferior (bottom sheet) acessível, com <dialog> nativo. */
export function Painel({
  aberto,
  aoFechar,
  titulo,
  children,
  rodape,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      onCancel={aoFechar}
      onClick={(e) => {
        // Toque fora do painel fecha
        if (e.target === ref.current) aoFechar();
      }}
      aria-label={titulo}
      className="painel m-0 mx-auto mt-auto max-h-[92dvh] w-full max-w-md overflow-hidden rounded-t-[28px] bg-cartao p-0 text-texto backdrop:bg-tinta/50"
    >
      {aberto && (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
            <h2 className="titulo text-22">{titulo}</h2>
            <button
              type="button"
              onClick={aoFechar}
              aria-label="Fechar"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-chip"
            >
              <X size={20} strokeWidth={2.2} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
          {rodape && (
            <div className="border-t-2 border-chip px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]">{rodape}</div>
          )}
        </div>
      )}
    </dialog>
  );
}
