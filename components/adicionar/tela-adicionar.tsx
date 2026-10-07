"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Check, Link2, Loader2, Plus, Search, X } from "lucide-react";
import { CadastroManual } from "@/components/midia/cadastro-manual";
import { Capa } from "@/components/ui/capa";
import { Mascote } from "@/components/ui/mascote";
import { Topo } from "@/components/ui/topo";
import { TituloTela } from "@/components/ui/titulo-tela";
import { avisarErro, mostrarAviso } from "@/lib/avisos";
import { ErroBusca, useAtrasado, useBusca, type FiltroBusca } from "@/lib/busca";
import { abrirResultado, useAdicionarDaBusca, useRegistros, useVincular } from "@/lib/dados";
import { COR_GRUPO, GRUPO_DO_STATUS, STATUS_POR_TIPO, rotuloStatus } from "@/lib/status";
import type { ResultadoBusca, TipoMidia } from "@/lib/tipos";

const FILTROS: { valor: FiltroBusca; rotulo: string }[] = [
  { valor: "tudo", rotulo: "Tudo" },
  { valor: "jogo", rotulo: "Jogo" },
  { valor: "filme", rotulo: "Filme" },
  { valor: "serie", rotulo: "Série" },
];

const chaveResultado = (r: ResultadoBusca) => `${r.fonte}:${r.id_externo}`;

export function TelaAdicionar() {
  const router = useRouter();
  const params = useSearchParams();
  // Modo "ligar": troca uma mídia manual pela oficial da IGDB/TMDB
  const vincularId = params.get("vincular");
  const tipoParam = params.get("tipo") as TipoMidia | null;

  const [termo, setTermo] = useState(params.get("q") ?? "");
  const [filtro, setFiltro] = useState<FiltroBusca>(tipoParam ?? "tudo");
  const [escolhendo, setEscolhendo] = useState<string | null>(null);
  const [abrindo, setAbrindo] = useState<string | null>(null);
  const [manualAberto, setManualAberto] = useState(false);

  const termoAtrasado = useAtrasado(termo.trim());
  const busca = useBusca(termoAtrasado, filtro);
  const { data: registros = [] } = useRegistros();
  const adicionar = useAdicionarDaBusca();
  const vincular = useVincular();

  // Títulos que já estão na biblioteca
  const naBiblioteca = new Map(
    registros
      .filter((r) => r.midia.id_externo)
      .map((r) => [`${r.midia.fonte}:${r.midia.id_externo}`, r]),
  );

  const abrir = async (resultado: ResultadoBusca) => {
    const chave = chaveResultado(resultado);
    setAbrindo(chave);
    try {
      if (vincularId) {
        const { id } = await vincular.mutateAsync({ midiaId: vincularId, resultado });
        mostrarAviso("Ligado! Capa e dados atualizados.");
        router.replace(`/midia/${id}`);
        return;
      }
      const existente = naBiblioteca.get(chave);
      router.push(`/midia/${existente ? existente.midia_id : await abrirResultado(resultado)}`);
    } catch (e) {
      const erro = e as { erro?: string; mensagem?: string; id?: string };
      if (erro.erro === "duplicado" && erro.id) {
        mostrarAviso(erro.mensagem ?? "Já está na biblioteca.", "erro");
        router.replace(`/midia/${erro.id}`);
      } else {
        avisarErro(e, erro.mensagem ?? "Não deu para abrir.");
      }
    } finally {
      setAbrindo(null);
    }
  };

  const erroBusca = busca.error instanceof ErroBusca ? busca.error : null;
  const resultados = busca.data ?? [];
  const semResultado = busca.isSuccess && termoAtrasado.length >= 2 && resultados.length === 0;

  return (
    <main>
      {vincularId && <Topo />}
      <TituloTela>{vincularId ? "Ligar à base" : "Adicionar"}</TituloTela>
      {vincularId && (
        <p className="mt-3 text-corpo text-texto-suave">
          Escolha o título certo para trazer capa, gêneros e ano. Seu status, notas e listas continuam.
        </p>
      )}

      <div className="relative mt-5">
        <Search
          size={20}
          strokeWidth={2.2}
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-texto-suave"
        />
        <label htmlFor="busca" className="sr-only">Buscar jogo, filme ou série</label>
        <input
          id="busca"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar jogo, filme ou série"
          className="h-14 w-full rounded-full border-2 border-transparent bg-cartao pr-12 pl-13 text-corpo font-medium outline-none focus:border-azul"
        />
        {termo && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => setTermo("")}
            className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {!vincularId && (
        <div className="mt-3 flex gap-2" role="group" aria-label="Filtrar por tipo">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              aria-pressed={filtro === f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`min-h-11 flex-1 rounded-full text-13 font-bold ${
                filtro === f.valor ? "bg-tinta text-white" : "bg-cartao"
              }`}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
      )}

      {/* Estados */}
      {termoAtrasado.length < 2 && !vincularId && (
        <div className="mt-8 flex flex-col items-center text-center">
          <Mascote expressao="procurando" className="h-28 w-auto" />
          <p className="mt-4 max-w-64 text-corpo text-texto-suave">
            Digite o nome e escolha o status direto no resultado.
          </p>
          <button type="button" onClick={() => setManualAberto(true)} className="mt-3 text-13 font-bold underline underline-offset-4">
            Ou cadastre manualmente
          </button>
        </div>
      )}

      {busca.isFetching && resultados.length === 0 && (
        <div role="status" className="mt-8 flex justify-center">
          <Loader2 size={28} className="animate-spin text-azul" aria-label="Buscando" />
        </div>
      )}

      {erroBusca && (
        <div role="alert" className="mt-6 rounded-[22px] bg-cartao p-5">
          <p className="text-corpo font-bold">
            {erroBusca.codigo === "nao_configurado"
              ? "A busca ainda não foi configurada."
              : "A busca falhou agora."}
          </p>
          <p className="mt-1 text-13 text-texto-suave">
            {erroBusca.codigo === "nao_configurado"
              ? "Faltam as chaves da IGDB/TMDB no servidor. Enquanto isso, dá para cadastrar manualmente."
              : "Pode ser a conexão ou o limite da API. Tente de novo em instantes."}
          </p>
          {!vincularId && (
            <button type="button" onClick={() => setManualAberto(true)} className="botao botao-chip mt-4 w-full">
              Cadastrar manualmente
            </button>
          )}
        </div>
      )}

      {semResultado && (
        <div className="mt-8 flex flex-col items-center text-center">
          <Mascote expressao="procurando" className="h-28 w-auto" />
          <p className="mt-4 max-w-64 text-corpo font-bold">Esse não encontramos. Quer cadastrar manualmente?</p>
          {!vincularId && (
            <button type="button" onClick={() => setManualAberto(true)} className="botao botao-azul mt-4">
              Cadastrar manualmente
            </button>
          )}
        </div>
      )}

      {resultados.length > 0 && (
        <ul className="mt-5 space-y-3" aria-busy={busca.isFetching}>
          {resultados
            .filter((r) => !vincularId || !tipoParam || r.tipo === tipoParam)
            .map((r) => {
              const chave = chaveResultado(r);
              const registro = naBiblioteca.get(chave);
              return (
                <li key={chave} className="rounded-[22px] bg-cartao p-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => abrir(r)}
                      disabled={abrindo !== null}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <Capa midia={r} className="h-20 w-14 shrink-0 rounded-[12px]" tamanhoLetra="text-22" />
                      <span className="min-w-0">
                        <span className="block text-corpo font-bold leading-snug">{r.titulo}</span>
                        <span className="block truncate text-12 text-texto-suave">
                          {[r.ano, r.detalhe].filter(Boolean).join(" · ")}
                        </span>
                        {registro && (
                          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-11 font-bold ${COR_GRUPO[GRUPO_DO_STATUS[registro.status]]}`}>
                            {rotuloStatus(registro.status, r.tipo)}
                          </span>
                        )}
                      </span>
                    </button>
                    {abrindo === chave ? (
                      <Loader2 size={22} className="mx-3 animate-spin text-azul" aria-label="Abrindo" />
                    ) : vincularId ? (
                      <Link2 size={22} strokeWidth={2.2} className="mx-3 text-texto-suave" aria-hidden="true" />
                    ) : registro ? (
                      <Check size={22} strokeWidth={2.4} className="mx-3 text-azul" aria-label="Na biblioteca" />
                    ) : (
                      <button
                        type="button"
                        aria-label={`Adicionar ${r.titulo}`}
                        aria-expanded={escolhendo === chave}
                        onClick={() => setEscolhendo(escolhendo === chave ? null : chave)}
                        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-azul text-white"
                      >
                        <Plus size={22} strokeWidth={2.4} />
                      </button>
                    )}
                  </div>

                  {escolhendo === chave && !registro && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t-2 border-chip pt-3">
                      {STATUS_POR_TIPO[r.tipo].map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={adicionar.isPending}
                          onClick={() =>
                            adicionar.mutate({ resultado: r, status: s }, { onSuccess: () => setEscolhendo(null) })
                          }
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
        </ul>
      )}

      {resultados.length > 0 && !vincularId && (
        <button type="button" onClick={() => setManualAberto(true)} className="mx-auto mt-4 block min-h-11 text-13 font-bold underline underline-offset-4">
          Não achou? Cadastre manualmente
        </button>
      )}

      <p className="mt-6 text-center text-11 text-texto-suave">
        Jogos: IGDB · Filmes e séries: TMDB. Este app usa a API da TMDB, mas não é endossado nem certificado por ela.
      </p>

      <CadastroManual
        aberto={manualAberto}
        aoFechar={() => setManualAberto(false)}
        tituloInicial={termo}
        tipoInicial={filtro === "tudo" ? "jogo" : filtro}
      />
    </main>
  );
}
