"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, RotateCw } from "lucide-react";
import { Esqueleto } from "@/components/ui/esqueleto";
import { avisarErro } from "@/lib/avisos";
import { buscarNotasExternas, useNotasExternas } from "@/lib/dados";
import { formatarData } from "@/lib/formato";
import { ESCALA_FONTE_NOTA, ORDEM_FONTES, ROTULO_FONTE_NOTA, faixaDaNota, formatarVotos } from "@/lib/notas";
import type { Midia, NotaExterna } from "@/lib/tipos";

const COR_FAIXA = { boa: "bg-conquista", mista: "bg-status-fila", ruim: "bg-perigo" } as const;

/** Notas da crítica e do público (IMDb, Metacritic, Rotten Tomatoes, TMDB, IGDB) na ficha. */
export function NotasExternas({ midia }: { midia: Midia }) {
  const qc = useQueryClient();
  const { data: notas, isPending, isError } = useNotasExternas(midia);
  const [atualizando, setAtualizando] = useState(false);

  if (midia.fonte === "manual") return null;

  const lista = [...(notas?.lista ?? [])].sort((a, b) => ORDEM_FONTES.indexOf(a.fonte) - ORDEM_FONTES.indexOf(b.fonte));

  const atualizar = async () => {
    setAtualizando(true);
    try {
      const novas = await buscarNotasExternas(qc, midia.id, true);
      qc.setQueryData(["notas-externas", midia.id], novas);
    } catch (e) {
      avisarErro(e, "Não deu para atualizar as notas.");
    }
    setAtualizando(false);
  };

  return (
    <section className="mt-5" aria-labelledby="titulo-notas">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="titulo-notas" className="titulo text-22">Crítica e público</h2>
        {notas && (
          <button
            type="button"
            onClick={atualizar}
            disabled={atualizando}
            className="flex min-h-11 items-center gap-1.5 text-12 font-bold text-texto-suave disabled:opacity-60"
          >
            <RotateCw size={14} strokeWidth={2.4} className={atualizando ? "animate-spin" : ""} />
            {formatarData(notas.atualizado_em.slice(0, 10))}
          </button>
        )}
      </div>

      {isPending && !notas ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Esqueleto className="h-28" />
          <Esqueleto className="h-28" />
        </div>
      ) : isError && !notas ? (
        <p className="mt-2 text-13 text-texto-suave">Não deu para buscar as notas agora. Tente mais tarde.</p>
      ) : lista.length === 0 ? (
        <p className="mt-2 text-13 text-texto-suave">Ainda sem notas nos sites de avaliação.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {lista.map((n) => (
            <li key={n.fonte}>
              <Bloco nota={n} jogo={midia.tipo === "jogo"} />
            </li>
          ))}
        </ul>
      )}

      {notas && !notas.omdb && midia.tipo !== "jogo" && (
        <p className="mt-2 text-12 text-texto-suave">
          IMDb, Rotten Tomatoes e Metacritic aparecem quando a chave da OMDb estiver configurada.
        </p>
      )}
      {midia.tipo === "jogo" && lista.length > 0 && (
        <p className="mt-2 text-12 text-texto-suave">Médias da IGDB: crítica especializada e jogadores.</p>
      )}
    </section>
  );
}

function Bloco({ nota: n, jogo }: { nota: NotaExterna; jogo: boolean }) {
  const votos = formatarVotos(n.votos);
  const legenda =
    n.fonte === "igdb_critica"
      ? `${votos ?? "?"} ${n.votos === 1 ? "análise" : "análises"}`
      : votos
        ? `${votos} votos`
        : n.fonte === "rotten"
          ? "aprovação"
          : "crítica";

  const conteudo = (
    <>
      <span
        className={`inline-flex max-w-full items-center gap-0.5 truncate rounded-full px-2 py-0.5 text-11 font-bold ${
          n.fonte === "imdb" ? "bg-[#F5C518] text-black" : "bg-chip text-texto"
        }`}
      >
        {ROTULO_FONTE_NOTA[n.fonte]}
        {n.url && <ArrowUpRight size={11} strokeWidth={2.6} aria-hidden="true" />}
      </span>
      <p className="titulo mt-2 text-22">
        {n.texto}
        <span className="text-12 font-bold text-texto-suave">{ESCALA_FONTE_NOTA[n.fonte]}</span>
      </p>
      <p className="truncate text-11 text-texto-suave">{legenda}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-chip" aria-hidden="true">
        <div className={`h-full rounded-full ${COR_FAIXA[faixaDaNota(n)]}`} style={{ width: `${n.valor}%` }} />
      </div>
    </>
  );

  const classe = "block h-full rounded-[20px] bg-cartao p-3";
  const rotulo = `${ROTULO_FONTE_NOTA[n.fonte]}${jogo ? " (IGDB)" : ""}: ${n.texto}${ESCALA_FONTE_NOTA[n.fonte]}`;
  return n.url ? (
    <a href={n.url} target="_blank" rel="noopener noreferrer" aria-label={`${rotulo}, abrir o site`} className={classe}>
      {conteudo}
    </a>
  ) : (
    <div aria-label={rotulo} className={classe}>
      {conteudo}
    </div>
  );
}
