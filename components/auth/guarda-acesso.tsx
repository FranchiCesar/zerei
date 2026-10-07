"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Mascote } from "@/components/ui/mascote";
import { useAcesso } from "@/lib/dados";
import { limparCopiaLocal } from "@/lib/offline";
import { criarClienteNavegador } from "@/lib/supabase/client";

/**
 * Se a conta perdeu o acesso (e-mail tirado da lista), mostra o aviso em vez do app.
 * Offline ou carregando, deixa passar: o banco já bloqueia o resto pela segurança das tabelas.
 */
export function GuardaAcesso({ children }: { children: React.ReactNode }) {
  const { data } = useAcesso();
  const router = useRouter();
  const qc = useQueryClient();

  if (data?.temAcesso !== false) return children;

  return (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
      <Mascote expressao="triste" className="h-36 w-auto" />
      <h1 className="titulo mt-6 text-destaque">Sem acesso por aqui.</h1>
      <p className="mt-3 max-w-72 text-corpo text-texto-suave">
        Este e-mail não está liberado no Zerei. Peça ao administrador para liberar.
      </p>
      <button
        type="button"
        onClick={async () => {
          await criarClienteNavegador().auth.signOut();
          qc.clear();
          await limparCopiaLocal();
          router.replace("/entrar");
        }}
        className="botao botao-marca mt-6"
      >
        <LogOut size={18} strokeWidth={2.2} /> Sair
      </button>
    </main>
  );
}
