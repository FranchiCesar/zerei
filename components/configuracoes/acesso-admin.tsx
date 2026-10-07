"use client";

import { useState } from "react";
import { ShieldCheck, UserPlus, X } from "lucide-react";
import { useAcesso, useAdicionarEmail, useEmailsPermitidos, useRemoverEmail } from "@/lib/dados";
import { formatarData } from "@/lib/formato";

/** Só o administrador vê: quem pode entrar no Zerei. */
export function AcessoAdmin() {
  const { data: acesso } = useAcesso();
  const admin = acesso?.admin === true;
  const { data: emails = [] } = useEmailsPermitidos(admin);
  const adicionar = useAdicionarEmail();
  const remover = useRemoverEmail();
  const [novo, setNovo] = useState("");

  if (!admin) return null;

  return (
    <section className="mt-4 rounded-[24px] bg-cartao p-5">
      <h2 className="titulo flex items-center gap-2 text-20">
        <ShieldCheck size={22} strokeWidth={2.2} className="text-azul" /> Quem pode entrar
      </h2>
      <p className="mt-1 text-13 text-texto-suave">
        Só estes e-mails recebem código e conseguem criar conta. Você é o administrador.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!novo.trim()) return;
          adicionar.mutate(novo, { onSuccess: () => setNovo("") });
        }}
        className="mt-3 flex gap-2"
      >
        <label htmlFor="novo-email" className="sr-only">E-mail para liberar</label>
        <input
          id="novo-email"
          type="email"
          inputMode="email"
          autoCapitalize="none"
          className="campo"
          placeholder="amigo@email.com"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={adicionar.isPending}
          aria-label="Liberar e-mail"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-azul text-white disabled:opacity-60"
        >
          <UserPlus size={20} strokeWidth={2.2} />
        </button>
      </form>

      <ul className="mt-3 divide-y-2 divide-chip">
        {emails.map((e) => (
          <li key={e.email} className="flex min-h-14 items-center gap-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-corpo font-bold">{e.email}</p>
              <p className="text-12 text-texto-suave">
                {e.papel === "admin" ? "Administrador" : `Liberado em ${formatarData(e.adicionado_em.slice(0, 10))}`}
              </p>
            </div>
            {e.papel !== "admin" && (
              <button
                type="button"
                disabled={remover.isPending}
                onClick={() => {
                  if (window.confirm(`Tirar o acesso de ${e.email}? A pessoa não vai mais conseguir entrar nem ver os dados dela.`)) {
                    remover.mutate(e.email);
                  }
                }}
                aria-label={`Remover acesso de ${e.email}`}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-chip"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
