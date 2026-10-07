import Link from "next/link";
import { Suspense } from "react";
import { Download } from "lucide-react";
import { FormularioEntrar } from "@/components/auth/formulario-entrar";
import { Mascote } from "@/components/ui/mascote";

export const metadata = { title: "Entrar · Zerei" };

export default function Entrar() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(env(safe-area-inset-top),24px)] pb-[max(env(safe-area-inset-bottom),24px)]">
      <div className="relative mt-4 overflow-hidden rounded-[28px] bg-marca px-5 pt-6 pb-0 text-white shadow-destaque">
        <p className="titulo text-tela">Zerei</p>
        <p className="mt-3 max-w-[58%] text-20 font-bold leading-tight">
          Tudo que você zerou, assistiu e montou.
        </p>
        <Mascote expressao="feliz" animacao="flutuar" className="ml-auto -mt-14 mb-3 h-36 w-auto" />
      </div>

      <div className="mt-4">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-[28px] bg-cartao" />}>
          <FormularioEntrar />
        </Suspense>
      </div>

      <Link
        href="/instalar"
        className="mx-auto mt-auto flex h-11 items-center gap-2 pt-6 text-13 font-bold text-texto-suave"
      >
        <Download size={18} strokeWidth={2.2} />
        Como instalar o Zerei no celular
      </Link>
    </main>
  );
}
