"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Cabeçalho de telas internas: voltar à esquerda, ações à direita. */
export function Topo({ children, voltarPara }: { children?: React.ReactNode; voltarPara?: string }) {
  const router = useRouter();
  return (
    <header className="flex items-center justify-between gap-2">
      <button
        type="button"
        aria-label="Voltar"
        onClick={() => {
          if (window.history.length > 1) router.back();
          else router.push(voltarPara ?? "/inicio");
        }}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cartao"
      >
        <ArrowLeft size={22} strokeWidth={2.2} />
      </button>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}

export function BotaoRedondo({
  rotulo,
  children,
  onClick,
  ativo = false,
}: {
  rotulo: string;
  children: React.ReactNode;
  onClick?: () => void;
  ativo?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      aria-pressed={ativo}
      onClick={onClick}
      className={`flex size-12 shrink-0 items-center justify-center rounded-full ${ativo ? "bg-azul text-white" : "bg-cartao"}`}
    >
      {children}
    </button>
  );
}
