import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GuiaInstalacao } from "@/components/pwa/guia-instalacao";
import { TituloTela } from "@/components/ui/titulo-tela";

export const metadata = { title: "Instalar · Zerei" };

export default function Instalar() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),24px)]">
      <Link
        href="/inicio"
        aria-label="Voltar"
        className="flex size-12 items-center justify-center rounded-full bg-cartao"
      >
        <ArrowLeft size={22} strokeWidth={2.2} />
      </Link>
      <TituloTela>
        Leve o Zerei
        <br />
        no bolso
      </TituloTela>
      <p className="mt-3 text-corpo text-texto-suave">
        Sem loja de aplicativos: instale direto do navegador, em menos de um minuto.
      </p>
      <GuiaInstalacao />
    </main>
  );
}
