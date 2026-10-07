"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronRight, Clock, Heart, Link2, ListPlus, Pencil, Trash2 } from "lucide-react";
import { EditarRegistro } from "@/components/midia/editar-registro";
import { Capa } from "@/components/ui/capa";
import { ChipStatus } from "@/components/ui/chip-status";
import { CarregandoTela } from "@/components/ui/esqueleto";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { BotaoRedondo, Topo } from "@/components/ui/topo";
import {
  useAlternarItemLista,
  useEpisodiosVistos,
  useListas,
  useMidia,
  usePecas,
  useRegistros,
  useRemoverRegistro,
  useSalvarRegistro,
  useTemporadas,
} from "@/lib/dados";
import { formatarData, formatarDuracao, formatarHoras, formatarNota } from "@/lib/formato";
import { COR_GRUPO, CRITERIOS, GRUPO_DO_STATUS, ROTULO_TIPO, STATUS_POR_TIPO, rotuloStatus } from "@/lib/status";
import type { Midia } from "@/lib/tipos";

export function TelaFicha() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: midia, isPending, isError } = useMidia(id);
  const { data: registros = [] } = useRegistros();
  const { data: pecas = [] } = usePecas();
  const salvar = useSalvarRegistro();
  const remover = useRemoverRegistro();
  const [editando, setEditando] = useState(false);
  const [sinopseAberta, setSinopseAberta] = useState(false);

  if (isPending) return <CarregandoTela />;
  if (isError || !midia) {
    return (
      <main>
        <Topo />
        <EstadoVazio titulo="Não encontramos esse título." texto="Ele pode ter sido apagado ou ligado a outro cadastro." />
      </main>
    );
  }

  const registro = registros.find((r) => r.midia_id === midia.id) ?? null;
  const maquina = registro?.peca_id ? pecas.find((p) => p.id === registro.peca_id) : null;
  const sinopse = midia.dados_extra?.sinopse;
  const criterios = CRITERIOS.filter((c) => registro?.notas_criterio?.[c.chave] != null);

  return (
    <main>
      <Topo voltarPara="/biblioteca">
        {registro && (
          <BotaoRedondo
            rotulo={registro.favorito ? "Tirar dos favoritos" : "Favoritar"}
            ativo={registro.favorito}
            onClick={() => salvar.mutate({ midiaId: midia.id, campos: { favorito: !registro.favorito } })}
          >
            <Heart size={22} strokeWidth={2.2} className={registro.favorito ? "fill-white" : ""} />
          </BotaoRedondo>
        )}
      </Topo>

      {/* Cabeçalho */}
      <section className="mt-5 flex gap-4">
        <Capa midia={midia} className="h-[180px] w-[126px] shrink-0 rounded-[20px] shadow-lg" />
        <div className="min-w-0 flex-1 pt-1">
          <p className="text-11 font-bold uppercase tracking-[0.14em] text-texto-suave">
            {[ROTULO_TIPO[midia.tipo], midia.ano].filter(Boolean).join(" · ")}
          </p>
          <h1 className="titulo mt-2 text-destaque [overflow-wrap:anywhere]">{midia.titulo}</h1>
          {midia.dados_extra?.desenvolvedora && (
            <p className="mt-2 text-13 text-texto-suave">{midia.dados_extra.desenvolvedora}</p>
          )}
          {registro && <ChipStatus status={registro.status} tipo={midia.tipo} className="mt-3" />}
        </div>
      </section>

      {(midia.generos.length > 0 || midia.plataformas.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {midia.generos.map((g) => (
            <span key={g} className="rounded-full bg-azul-claro px-3 py-1.5 text-12 font-bold text-azul-texto">
              {g}
            </span>
          ))}
          {midia.plataformas.slice(0, 6).map((p) => (
            <span key={p} className="rounded-full bg-cartao px-3 py-1.5 text-12 font-bold">
              {p}
            </span>
          ))}
        </div>
      )}

      {midia.fonte === "manual" && (
        <Link
          href={`/adicionar?vincular=${midia.id}&tipo=${midia.tipo}&q=${encodeURIComponent(midia.titulo)}`}
          className="mt-4 flex items-center gap-3 rounded-[22px] border-2 border-dashed border-borda p-4"
        >
          <Link2 size={22} strokeWidth={2.2} className="shrink-0 text-azul" />
          <span className="flex-1 text-13">
            <strong className="block text-corpo">Cadastrado à mão</strong>
            Ligue à {midia.tipo === "jogo" ? "IGDB" : "TMDB"} para trazer capa, gêneros e mais.
          </span>
          <ChevronRight size={20} strokeWidth={2.2} />
        </Link>
      )}

      {/* Seu registro */}
      {registro ? (
        <section className="mt-5 rounded-[28px] bg-cartao p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-11 font-bold uppercase tracking-[0.14em] text-texto-suave">Sua nota</p>
              <p className="titulo mt-1 text-tela">{formatarNota(registro.nota)}</p>
            </div>
            <button type="button" onClick={() => setEditando(true)} className="botao botao-azul">
              <Pencil size={18} strokeWidth={2.2} /> Editar
            </button>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            {[
              ["Horas", formatarHoras(registro.horas)],
              midia.tipo === "jogo" ? ["Conclusão", registro.conclusao_pct != null ? `${registro.conclusao_pct}%` : null] : null,
              midia.tipo === "jogo" ? ["Plataforma", registro.plataforma] : ["Onde", registro.servico],
              maquina ? ["Máquina", maquina.modelo] : null,
              ["Início", registro.inicio ? formatarData(registro.inicio) : null],
              ["Fim", registro.fim ? formatarData(registro.fim) : null],
              midia.tipo === "filme" && registro.revisto ? ["Revisto", "Sim"] : null,
            ]
              .filter((linha): linha is [string, string | null] => linha !== null)
              .filter(([, valor]) => valor)
              .map(([rotulo, valor]) => (
                <div key={rotulo} className="rounded-[16px] bg-chip p-3">
                  <dt className="text-11 font-bold uppercase tracking-[0.1em] text-texto-suave">{rotulo}</dt>
                  <dd className="mt-0.5 truncate text-corpo font-bold">{valor}</dd>
                </div>
              ))}
          </dl>

          {criterios.length > 0 && (
            <ul className="mt-4 space-y-2">
              {criterios.map(({ chave, rotulo }) => {
                const valor = registro.notas_criterio[chave]!;
                return (
                  <li key={chave} className="flex items-center gap-3 text-13">
                    <span className="w-28 shrink-0">{rotulo}</span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-azul-claro">
                      <span className="block h-full rounded-full bg-azul" style={{ width: `${valor * 10}%` }} />
                    </span>
                    <span className="w-8 text-right font-bold">{formatarNota(valor)}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {registro.resumo && (
            <blockquote className="mt-4 border-l-4 border-azul pl-3 text-corpo">{registro.resumo}</blockquote>
          )}
          {registro.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {registro.tags.map((t) => (
                <span key={t} className="rounded-full bg-tinta px-3 py-1 text-12 font-bold text-white">
                  {t}
                </span>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="mt-5 rounded-[28px] bg-cartao p-5">
          <h2 className="titulo text-22">Adicionar à biblioteca</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUS_POR_TIPO[midia.tipo].map((s) => (
              <button
                key={s}
                type="button"
                disabled={salvar.isPending}
                onClick={() => salvar.mutate({ midiaId: midia.id, campos: { status: s } })}
                className={`min-h-11 rounded-full px-4 text-13 font-bold ${COR_GRUPO[GRUPO_DO_STATUS[s]]}`}
              >
                {rotuloStatus(s, midia.tipo)}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setEditando(true)} className="mt-3 text-13 font-bold underline underline-offset-4">
            Adicionar com nota e detalhes
          </button>
        </section>
      )}

      {midia.tipo === "serie" && <BlocoTemporadas midiaId={midia.id} />}

      {/* Sobre */}
      {(sinopse || midia.tempo_zerar_h || midia.duracao_min) && (
        <section className="mt-5 rounded-[24px] bg-cartao p-5">
          <h2 className="titulo text-20">Sobre</h2>
          {(midia.tempo_zerar_h || midia.duracao_min) && (
            <p className="mt-3 flex items-center gap-2 text-13 font-bold">
              <Clock size={18} strokeWidth={2.2} className="text-azul" />
              {midia.tipo === "jogo"
                ? `Em média ${formatarHoras(midia.tempo_zerar_h)} para zerar`
                : midia.tipo === "filme"
                  ? `Duração: ${formatarDuracao(midia.duracao_min)}`
                  : `Episódios de ~${formatarDuracao(midia.duracao_min)}`}
            </p>
          )}
          {sinopse && (
            <>
              <p className={`mt-3 text-corpo leading-relaxed ${sinopseAberta ? "" : "line-clamp-4"}`}>{sinopse}</p>
              {sinopse.length > 220 && (
                <button type="button" onClick={() => setSinopseAberta(!sinopseAberta)} className="mt-1 min-h-11 text-13 font-bold underline">
                  {sinopseAberta ? "Mostrar menos" : "Ler tudo"}
                </button>
              )}
            </>
          )}
          {midia.dados_extra?.elenco && midia.dados_extra.elenco.length > 0 && (
            <>
              <h3 className="mt-4 text-13 font-bold">Elenco</h3>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-13 text-texto-suave">
                {midia.dados_extra.elenco.map((p) => (
                  <li key={p.nome}>
                    <span className="font-bold text-texto">{p.nome}</span>
                    {p.personagem ? ` (${p.personagem})` : ""}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {registro && <BlocoListas midia={midia} />}

      {registro && (
        <button
          type="button"
          disabled={remover.isPending}
          onClick={() => {
            if (window.confirm(`Tirar "${midia.titulo}" da biblioteca? Notas e progresso serão apagados.`)) {
              remover.mutate(registro.id, { onSuccess: () => router.replace("/biblioteca") });
            }
          }}
          className="botao botao-perigo mt-6 w-full"
        >
          <Trash2 size={18} strokeWidth={2.2} /> Tirar da biblioteca
        </button>
      )}

      {midia.fonte === "tmdb" && (
        <p className="mt-6 text-center text-11 text-texto-suave">Dados e imagens: TMDB.</p>
      )}
      {midia.fonte === "igdb" && <p className="mt-6 text-center text-11 text-texto-suave">Dados e imagens: IGDB.</p>}

      <EditarRegistro midia={midia} registro={registro} aberto={editando} aoFechar={() => setEditando(false)} />
    </main>
  );
}

function BlocoTemporadas({ midiaId }: { midiaId: string }) {
  const { data: temporadas = [] } = useTemporadas(midiaId);
  const { data: vistos = [] } = useEpisodiosVistos(midiaId);
  const total = temporadas.reduce((s, t) => s + t.total_episodios, 0);
  return (
    <Link href={`/midia/${midiaId}/temporadas`} className="mt-5 block rounded-[24px] bg-tinta p-5 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="titulo text-20">Temporadas</h2>
          <p className="mt-1 text-13 text-white/70">
            {total
              ? `${vistos.length} de ${total} episódios · ${temporadas.length} temporadas`
              : "Nenhuma temporada cadastrada"}
          </p>
        </div>
        <ChevronRight size={22} strokeWidth={2.2} />
      </div>
      {total > 0 && (
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-azul" style={{ width: `${(vistos.length / total) * 100}%` }} />
        </div>
      )}
    </Link>
  );
}

function BlocoListas({ midia }: { midia: Midia }) {
  const { data: listas = [] } = useListas();
  const alternar = useAlternarItemLista();
  return (
    <section className="mt-5 rounded-[24px] bg-cartao p-5">
      <div className="flex items-center justify-between">
        <h2 className="titulo text-20">Listas</h2>
        <Link href="/listas?nova=1" className="flex min-h-11 items-center gap-1 text-13 font-bold">
          <ListPlus size={18} strokeWidth={2.2} /> Nova
        </Link>
      </div>
      {listas.length === 0 ? (
        <p className="mt-2 text-13 text-texto-suave">Você ainda não criou listas.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {listas.map((l) => {
            const dentro = l.itens.some((i) => i.midia_id === midia.id);
            return (
              <button
                key={l.id}
                type="button"
                aria-pressed={dentro}
                disabled={alternar.isPending}
                onClick={() => alternar.mutate({ listaId: l.id, midiaId: midia.id, incluir: !dentro })}
                className={`flex min-h-11 items-center gap-1.5 rounded-full px-4 text-13 font-bold ${
                  dentro ? "bg-azul text-white" : "bg-chip"
                }`}
              >
                {dentro && <Check size={16} strokeWidth={2.6} />}
                {l.nome}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
