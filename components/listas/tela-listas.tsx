"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Capa } from "@/components/ui/capa";
import { CarregandoTela } from "@/components/ui/esqueleto";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Painel } from "@/components/ui/painel";
import { TituloTela } from "@/components/ui/titulo-tela";
import { useCriarLista, useListas } from "@/lib/dados";
import { plural } from "@/lib/formato";
import type { ListaComItens } from "@/lib/tipos";

export function TelaListas() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: listas, isPending } = useListas();
  const [novaAberta, setNovaAberta] = useState(params.get("nova") === "1");

  if (isPending || !listas) return <CarregandoTela />;

  return (
    <main>
      <div className="flex items-end justify-between gap-3">
        <TituloTela>Listas</TituloTela>
        <button type="button" onClick={() => setNovaAberta(true)} className="botao botao-azul shrink-0">
          <Plus size={20} strokeWidth={2.4} /> Nova
        </button>
      </div>

      {listas.length === 0 ? (
        <EstadoVazio
          expressao="dormindo"
          titulo="Nenhuma lista ainda."
          texto="Junte jogos, filmes e séries numa lista só: 'Pra jogar nas férias', 'Top 10 da vida'..."
        />
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3">
          {listas.map((l) => (
            <li key={l.id}>
              <Link href={`/listas/${l.id}`} className="block rounded-[24px] bg-cartao p-2.5">
                <Mosaico lista={l} />
                <p className="mt-2 truncate px-1 text-corpo font-bold">{l.nome}</p>
                <p className="px-1 pb-1 text-12 text-texto-suave">{plural(l.itens.length, "item", "itens")}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <NovaLista
        aberto={novaAberta}
        aoFechar={() => setNovaAberta(false)}
        aoCriar={(id) => router.push(`/listas/${id}`)}
      />
    </main>
  );
}

function Mosaico({ lista }: { lista: ListaComItens }) {
  const capas = lista.itens.slice(0, 4);
  if (capas.length === 0) {
    return (
      <div className="titulo flex aspect-square items-center justify-center rounded-[18px] bg-azul-claro text-tela text-azul-texto">
        {lista.nome[0]?.toUpperCase()}
      </div>
    );
  }
  return (
    <div className="grid aspect-square grid-cols-2 gap-1 overflow-hidden rounded-[18px]">
      {Array.from({ length: 4 }, (_, i) =>
        capas[i] ? (
          <Capa key={i} midia={capas[i].midia} className="h-full w-full" tamanhoLetra="text-22" />
        ) : (
          <div key={i} className="bg-chip" />
        ),
      )}
    </div>
  );
}

export function NovaLista({
  aberto,
  aoFechar,
  aoCriar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: (id: string) => void;
}) {
  const criar = useCriarLista();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  return (
    <Painel aberto={aberto} aoFechar={aoFechar} titulo="Nova lista">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!nome.trim()) return;
          criar.mutate(
            { nome: nome.trim().slice(0, 80), descricao: descricao.trim() || null },
            {
              onSuccess: ({ id }) => {
                setNome("");
                setDescricao("");
                aoFechar();
                aoCriar(id);
              },
            },
          );
        }}
        className="space-y-4 pt-2"
      >
        <div>
          <label htmlFor="lista-nome" className="rotulo">Nome</label>
          <input id="lista-nome" className="campo" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} required placeholder="Top 10 da vida" />
        </div>
        <div>
          <label htmlFor="lista-desc" className="rotulo">Descrição (opcional)</label>
          <textarea id="lista-desc" rows={2} className="campo resize-none" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={300} />
        </div>
        <button type="submit" disabled={criar.isPending} className="botao botao-azul w-full">
          {criar.isPending ? "Criando..." : "Criar lista"}
        </button>
      </form>
    </Painel>
  );
}
