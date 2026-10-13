"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, Loader2, Plus } from "lucide-react";
import { Capa } from "@/components/ui/capa";
import { Esqueleto } from "@/components/ui/esqueleto";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Topo } from "@/components/ui/topo";
import { avisarErro } from "@/lib/avisos";
import { abrirResultado, useAdicionarDaBusca, useRegistros } from "@/lib/dados";
import { formatarVotos } from "@/lib/notas";
import { usePreferencia } from "@/lib/preferencia";
import { COR_GRUPO, GRUPO_DO_STATUS, STATUS_POR_TIPO, rotuloStatus } from "@/lib/status";
import type { CriterioRanking, ItemRanking, PeriodoRanking, PlataformaRanking, TipoMidia } from "@/lib/tipos";

const POR_PAGINA = 20;
const MAX_PAGINAS = 25;

const TIPOS: { valor: TipoMidia; rotulo: string }[] = [
  { valor: "jogo", rotulo: "Jogos" },
  { valor: "filme", rotulo: "Filmes" },
  { valor: "serie", rotulo: "Séries" },
];

const CRITERIOS: Record<TipoMidia, { valor: CriterioRanking; rotulo: string }[]> = {
  jogo: [
    { valor: "critica", rotulo: "Crítica" },
    { valor: "publico", rotulo: "Jogadores" },
  ],
  filme: [
    { valor: "publico", rotulo: "Mais bem avaliados" },
    { valor: "em_alta", rotulo: "Em alta" },
  ],
  serie: [
    { valor: "publico", rotulo: "Mais bem avaliadas" },
    { valor: "em_alta", rotulo: "Em alta" },
  ],
};

const ANO = new Date().getFullYear();
const PERIODOS: { valor: PeriodoRanking; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos os tempos" },
  { valor: "ano", rotulo: String(ANO) },
  { valor: "ano_passado", rotulo: String(ANO - 1) },
  { valor: "2020", rotulo: "Anos 2020" },
  { valor: "2010", rotulo: "Anos 2010" },
  { valor: "2000", rotulo: "Anos 2000" },
  { valor: "1990", rotulo: "Anos 90" },
  { valor: "1980", rotulo: "Anos 80" },
];

const PLATAFORMAS: { valor: PlataformaRanking; rotulo: string }[] = [
  { valor: "todas", rotulo: "Todas as plataformas" },
  { valor: "ps5", rotulo: "PS5" },
  { valor: "ps4", rotulo: "PS4" },
  { valor: "pc", rotulo: "PC" },
  { valor: "switch2", rotulo: "Switch 2" },
  { valor: "switch", rotulo: "Switch" },
  { valor: "xbox", rotulo: "Xbox Series" },
];

const chave = (r: ItemRanking) => `${r.fonte}:${r.id_externo}`;

/** Rankings gerais: os mais bem avaliados do mundo, não só da biblioteca. */
export function TelaRankings() {
  const router = useRouter();
  const [tipo, setTipo] = usePreferencia<TipoMidia>("ranking-tipo", "jogo");
  const [criterioSalvo, setCriterio] = usePreferencia<CriterioRanking>("ranking-criterio", "critica");
  const [periodo, setPeriodo] = usePreferencia<PeriodoRanking>("ranking-periodo", "todos");
  const [plataforma, setPlataforma] = usePreferencia<PlataformaRanking>("ranking-plataforma", "todas");
  const criterio = CRITERIOS[tipo].some((c) => c.valor === criterioSalvo) ? criterioSalvo : CRITERIOS[tipo][0].valor;

  const { data: registros = [] } = useRegistros();
  const naBiblioteca = new Map(
    registros.filter((r) => r.midia.id_externo).map((r) => [`${r.midia.fonte}:${r.midia.id_externo}`, r]),
  );
  const adicionar = useAdicionarDaBusca();
  const [abrindo, setAbrindo] = useState<string | null>(null);
  const [escolhendo, setEscolhendo] = useState<string | null>(null);

  const filtro = {
    tipo,
    criterio,
    periodo: criterio === "em_alta" ? "todos" : periodo,
    plataforma: tipo === "jogo" ? plataforma : "todas",
  };

  const ranking = useInfiniteQuery({
    queryKey: ["ranking", filtro],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ ...filtro, pagina: String(pageParam) });
      const resposta = await fetch(`/api/rankings?${params}`);
      const json = await resposta.json();
      if (!resposta.ok) throw Object.assign(new Error(json.mensagem), { codigo: json.erro });
      return json.itens as ItemRanking[];
    },
    initialPageParam: 1,
    getNextPageParam: (ultima, todas) =>
      ultima.length === POR_PAGINA && todas.length < MAX_PAGINAS ? todas.length + 1 : undefined,
    staleTime: 60 * 60 * 1000,
  });

  // A paginação das APIs pode repetir um título entre páginas
  const vistos = new Set<string>();
  const itens = (ranking.data?.pages.flat() ?? []).filter((r) => !vistos.has(chave(r)) && vistos.add(chave(r)));

  const abrir = async (item: ItemRanking) => {
    const k = chave(item);
    setAbrindo(k);
    try {
      const existente = naBiblioteca.get(k);
      router.push(`/midia/${existente ? existente.midia_id : await abrirResultado(item)}`);
    } catch (e) {
      avisarErro(e, "Não deu para abrir.");
      setAbrindo(null);
    }
  };

  return (
    <main>
      <Topo voltarPara="/inicio" />
      <h1 className="titulo mt-6 text-tela">Rankings</h1>
      <p className="mt-2 text-corpo text-texto-suave">Os mais bem avaliados do mundo, não só da sua biblioteca.</p>

      <div className="mt-5 grid grid-cols-3 gap-1 rounded-full bg-cartao p-1" role="tablist" aria-label="Tipo">
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            type="button"
            role="tab"
            aria-selected={tipo === t.valor}
            onClick={() => {
              setTipo(t.valor);
              setEscolhendo(null);
            }}
            className={`min-h-11 rounded-full text-13 font-bold ${tipo === t.valor ? "bg-tinta text-white" : ""}`}
          >
            {t.rotulo}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Critério">
        {CRITERIOS[tipo].map((c) => (
          <button
            key={c.valor}
            type="button"
            aria-pressed={criterio === c.valor}
            onClick={() => setCriterio(c.valor)}
            className={`min-h-10 rounded-full px-4 text-12 font-bold ${criterio === c.valor ? "bg-marca text-white" : "bg-cartao"}`}
          >
            {c.rotulo}
          </button>
        ))}
      </div>

      {criterio !== "em_alta" && (
        <div className={`mt-3 grid gap-2 ${tipo === "jogo" ? "grid-cols-2" : "grid-cols-1"}`}>
          <div>
            <label htmlFor="ranking-periodo" className="sr-only">Período</label>
            <select
              id="ranking-periodo"
              className="campo"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as PeriodoRanking)}
            >
              {PERIODOS.map((p) => (
                <option key={p.valor} value={p.valor}>{p.rotulo}</option>
              ))}
            </select>
          </div>
          {tipo === "jogo" && (
            <div>
              <label htmlFor="ranking-plataforma" className="sr-only">Plataforma</label>
              <select
                id="ranking-plataforma"
                className="campo"
                value={plataforma}
                onChange={(e) => setPlataforma(e.target.value as PlataformaRanking)}
              >
                {PLATAFORMAS.map((p) => (
                  <option key={p.valor} value={p.valor}>{p.rotulo}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-12 text-texto-suave">
        {tipo === "jogo"
          ? criterio === "critica"
            ? "Média das análises da crítica especializada, pela IGDB."
            : "Média das notas dos jogadores na IGDB."
          : criterio === "em_alta"
            ? "O que mais está sendo visto e comentado nesta semana, pelo TMDB."
            : "Nota média do público no TMDB, com um mínimo de votos para valer."}
      </p>

      {ranking.isPending ? (
        <div className="mt-4 space-y-2" role="status" aria-label="Carregando ranking">
          {Array.from({ length: 6 }, (_, i) => (
            <Esqueleto key={i} className="h-24" />
          ))}
        </div>
      ) : ranking.isError ? (
        <EstadoVazio
          expressao="tonto"
          titulo="O ranking não carregou."
          texto={(ranking.error as { codigo?: string }).codigo === "nao_configurado" ? "Faltam as chaves das APIs no servidor." : "Pode ser a conexão. Tente de novo em instantes."}
        />
      ) : itens.length === 0 ? (
        <EstadoVazio expressao="confuso" titulo="Nada nesse recorte." texto="Tente outro período ou outra plataforma." />
      ) : (
        <ol className="mt-4 space-y-2">
          {itens.map((r, i) => {
            const k = chave(r);
            const registro = naBiblioteca.get(k);
            const posicao = i + 1;
            return (
              <li key={k} className="rounded-[22px] bg-cartao p-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => abrir(r)}
                    disabled={abrindo !== null}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className={`titulo w-8 shrink-0 text-center ${posicao <= 3 ? "text-destaque text-marca-texto" : "text-20 text-texto-suave"}`}
                      aria-label={`${posicao}º lugar`}
                    >
                      {posicao}
                    </span>
                    <Capa midia={r} className="h-20 w-14 shrink-0 rounded-[12px]" tamanhoLetra="text-22" />
                    <span className="min-w-0">
                      <span className="block text-corpo font-bold leading-snug">{r.titulo}</span>
                      <span className="block truncate text-12 text-texto-suave">
                        {[r.ano, r.tipo === "jogo" ? r.detalhe : null].filter(Boolean).join(" · ")}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-marca px-2 py-0.5 text-11 font-bold text-white">
                          {r.texto}
                          <span className="opacity-75">{r.escala}</span>
                        </span>
                        {r.votos != null && (
                          <span className="text-11 text-texto-suave">
                            {formatarVotos(r.votos)} {r.tipo_votos}
                          </span>
                        )}
                        {registro && (
                          <span className={`rounded-full px-2 py-0.5 text-11 font-bold ${COR_GRUPO[GRUPO_DO_STATUS[registro.status]]}`}>
                            {rotuloStatus(registro.status, r.tipo)}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                  {abrindo === k ? (
                    <Loader2 size={22} className="mx-3 animate-spin text-marca" aria-label="Abrindo" />
                  ) : registro ? (
                    <Check size={22} strokeWidth={2.4} className="mx-3 shrink-0 text-marca" aria-label="Na biblioteca" />
                  ) : (
                    <button
                      type="button"
                      aria-label={`Adicionar ${r.titulo}`}
                      aria-expanded={escolhendo === k}
                      onClick={() => setEscolhendo(escolhendo === k ? null : k)}
                      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-marca text-white"
                    >
                      <Plus size={22} strokeWidth={2.4} />
                    </button>
                  )}
                </div>

                {escolhendo === k && !registro && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t-2 border-chip pt-3">
                    {STATUS_POR_TIPO[r.tipo].map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={adicionar.isPending}
                        onClick={() => adicionar.mutate({ resultado: r, status: s }, { onSuccess: () => setEscolhendo(null) })}
                        className={`min-h-11 rounded-full px-4 text-13 font-bold ${COR_GRUPO[GRUPO_DO_STATUS[s]]} disabled:opacity-60`}
                      >
                        {rotuloStatus(s, r.tipo)}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {ranking.hasNextPage && (
        <button
          type="button"
          onClick={() => ranking.fetchNextPage()}
          disabled={ranking.isFetchingNextPage}
          className="botao botao-chip mt-4 w-full"
        >
          {ranking.isFetchingNextPage ? "Carregando..." : "Ver mais"}
        </button>
      )}

      <p className="mt-6 text-center text-11 text-texto-suave">
        Jogos: IGDB · Filmes e séries: TMDB. Este app usa a API da TMDB, mas não é endossado nem certificado por ela.
      </p>
    </main>
  );
}
