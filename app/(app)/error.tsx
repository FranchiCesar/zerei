"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { Mascote } from "@/components/ui/mascote";

export default function Erro({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
      <Mascote expressao="tonto" className="h-36 w-auto" />
      <h1 className="titulo mt-6 text-destaque">Ops, algo deu errado.</h1>
      <p className="mt-3 max-w-72 text-corpo text-texto-suave">
        Seus dados estão salvos. Tente de novo; se continuar, feche e abra o app.
      </p>
      <button type="button" onClick={() => retry()} className="botao botao-marca mt-6">
        <RotateCw size={18} strokeWidth={2.2} /> Tentar de novo
      </button>
      <Link href="/inicio" className="mt-2 flex min-h-11 items-center text-13 font-bold underline underline-offset-4">
        Ir para o início
      </Link>
    </main>
  );
}
