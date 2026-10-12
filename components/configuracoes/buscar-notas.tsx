"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { buscarNotasExternas, useRegistros } from "@/lib/dados";

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Busca de uma vez as notas de crítica e público de toda a biblioteca (para ordenar por elas). */
export function BuscarNotas() {
  const qc = useQueryClient();
  const { data: registros = [] } = useRegistros();
  const [rodando, setRodando] = useState(false);
  const [progresso, setProgresso] = useState({ feitos: 0, total: 0 });
  const [resultado, setResultado] = useState<string | null>(null);

  // Sem notas ainda, ou buscadas antes da chave da OMDb existir
  const faltam = registros.filter(
    (r) => r.midia.fonte !== "manual" && (!r.midia.dados_extra?.notas || (r.midia.tipo !== "jogo" && !r.midia.dados_extra.notas.omdb)),
  );

  const rodar = async () => {
    setRodando(true);
    setResultado(null);
    setProgresso({ feitos: 0, total: faltam.length });
    let falhas = 0;
    for (const [i, r] of faltam.entries()) {
      try {
        const notas = await buscarNotasExternas(qc, r.midia_id);
        qc.setQueryData(["notas-externas", r.midia_id], notas);
      } catch (e) {
        if ((e as { codigo?: string }).codigo === "nao_configurado") {
          setResultado("As chaves das APIs ainda não foram configuradas no servidor.");
          setRodando(false);
          return;
        }
        falhas++;
      }
      setProgresso({ feitos: i + 1, total: faltam.length });
      await esperar(350); // respeita o limite de 4 requisições/s da IGDB
    }
    setResultado(falhas ? `Pronto, mas ${falhas} não responderam. Tente de novo depois.` : "Pronto! Notas buscadas.");
    setRodando(false);
  };

  return (
    <section className="mt-4 rounded-[24px] bg-cartao p-5">
      <h2 className="titulo text-20">Notas da crítica</h2>
      <p className="mt-2 text-13 text-texto-suave">
        {faltam.length
          ? `${faltam.length} títulos ainda sem notas de IMDb, Metacritic, Rotten Tomatoes, TMDB ou IGDB. Com elas, dá para ordenar a biblioteca pelos mais bem avaliados.`
          : "Todos os títulos já têm notas. Elas se atualizam sozinhas uma vez por semana ao abrir a ficha."}
      </p>

      {rodando && (
        <div className="mt-4" role="status">
          <p className="text-13 font-bold">
            Buscando {progresso.feitos} de {progresso.total}...
          </p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-marca-claro">
            <div
              className="h-full rounded-full bg-marca transition-all"
              style={{ width: `${(progresso.feitos / Math.max(1, progresso.total)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {resultado && !rodando && <p className="mt-3 text-13 font-bold">{resultado}</p>}

      {faltam.length > 0 && !rodando && (
        <button type="button" onClick={rodar} className="botao botao-marca mt-4 w-full">
          <Star size={18} strokeWidth={2.2} /> Buscar notas de {faltam.length} títulos
        </button>
      )}
    </section>
  );
}
