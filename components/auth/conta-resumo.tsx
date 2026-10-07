"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { criarClienteNavegador } from "@/lib/supabase/client";

/** Mostra o e-mail da conta e o botão de sair. */
export function ContaResumo() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const supabase = criarClienteNavegador();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function sair() {
    setSaindo(true);
    await criarClienteNavegador().auth.signOut();
    router.replace("/entrar");
    router.refresh();
  }

  return (
    <div className="mt-3 flex items-center gap-3 rounded-[24px] bg-cartao p-4">
      <div className="min-w-0 flex-1">
        <p className="text-11 font-bold uppercase tracking-[0.14em] text-texto-suave">Conta</p>
        <p className="truncate text-corpo font-bold">{email ?? "..."}</p>
      </div>
      <button
        type="button"
        onClick={sair}
        disabled={saindo}
        className="flex h-11 items-center gap-2 rounded-full bg-chip px-4 text-13 font-bold disabled:opacity-60"
      >
        <LogOut size={18} strokeWidth={2.2} />
        {saindo ? "Saindo..." : "Sair"}
      </button>
    </div>
  );
}
