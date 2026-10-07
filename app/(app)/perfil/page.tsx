import Link from "next/link";
import { ChevronRight, Download, Monitor } from "lucide-react";
import { ContaResumo } from "@/components/auth/conta-resumo";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { TituloTela } from "@/components/ui/titulo-tela";

export const metadata = { title: "Perfil · Zerei" };

export default function Perfil() {
  return (
    <main>
      <TituloTela>Perfil</TituloTela>
      <Link
        href="/setup"
        className="mt-6 flex items-center gap-3 rounded-[24px] bg-cartao p-4"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-azul-claro">
          <Monitor size={22} strokeWidth={2.2} />
        </span>
        <span className="flex-1 text-corpo font-bold">Meu setup</span>
        <ChevronRight size={20} strokeWidth={2.2} />
      </Link>
      <Link
        href="/instalar"
        className="mt-3 flex items-center gap-3 rounded-[24px] bg-cartao p-4"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-azul-claro">
          <Download size={22} strokeWidth={2.2} />
        </span>
        <span className="flex-1 text-corpo font-bold">Instalar o app</span>
        <ChevronRight size={20} strokeWidth={2.2} />
      </Link>
      <ContaResumo />
      <EstadoVazio
        expressao="neutro"
        titulo="Seu perfil está aquecendo."
        texto="Totais, gráficos e linha do tempo aparecem conforme você registra."
      />
    </main>
  );
}
