"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Heart, LayoutGrid, List, Pencil, Search, SlidersHorizontal } from "lucide-react";
import { EditarRegistro } from "@/components/midia/editar-registro";
import { Capa } from "@/components/ui/capa";
import { ChipStatus } from "@/components/ui/chip-status";
import { CarregandoTela } from "@/components/ui/esqueleto";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Painel } from "@/components/ui/painel";
import { TituloTela } from "@/components/ui/titulo-tela";
import { useRegistros } from "@/lib/dados";
import { formatarNota } from "@/lib/formato";
import { usePreferencia } from "@/lib/preferencia";
import { GRUPO_DO_STATUS, ROTULO_GRUPO, type GrupoStatus } from "@/lib/status";
import type { RegistroComMidia, TipoMidia } from "@/lib/tipos";

type FiltroTipo = "tudo" | TipoMidia;
type Ordem = "recentes" | "titulo" | "nota" | "ano" | "concluidos";

const TIPOS: { valor: FiltroTipo; rotulo: string }[] = [
  { valor: "tudo", rotulo: "Tudo" },
  { valor: "jogo", rotulo: "Jogos" },
  { valor: "filme", rotulo: "Filmes" },
  { valor: "serie", rotulo: "Séries" },
];

const GRUPOS: GrupoStatus[] = ["ativo", "fila", "concluido", "pausado", "abandonado", "desejo"];

const ORDENS: { valor: Ordem; rotulo: string }[] = [
  { valor: "recentes", rotulo: "Mexidos por último" },
  { valor: "concluidos", rotulo: "Concluídos por último" },
  { valor: "titulo", rotulo: "Título (A–Z)" },
  { valor: "nota", rotulo: "Maior nota" },
  { valor: "ano", rotulo: "Lançamento mais novo" },
];

const ordenar: Record<Ordem, (a: RegistroComMidia, b: RegistroComMidia) => number> = {
  recentes: (a, b) => b.atualizado_em.localeCompare(a.atualizado_em),
  concluidos: (a, b) => (b.fim ?? "").localeCompare(a.fim ?? ""),
  titulo: (a, b) => a.midia.titulo.localeCompare(b.midia.titulo, "pt-BR"),
  nota: (a, b) => (b.nota ?? -1) - (a.nota ?? -1),
  ano: (a, b) => (b.midia.ano ?? 0) - (a.midia.ano ?? 0),
};

export function TelaBiblioteca() {
  const params = useSearchParams();
  const { data: registros, isPending } = useRegistros();

  const [tipo, setTipo] = useState<FiltroTipo>((params.get("tipo") as FiltroTipo) ?? "tudo");
  const [grupo, setGrupo] = useState<GrupoStatus | "todos">((params.get("grupo") as GrupoStatus) ?? "todos");
  const [texto, setTexto] = useState("");
  const [visao, setVisao] = usePreferencia<"grade" | "lista">("biblioteca-visao", "grade");
  const [ordem, setOrdem] = usePreferencia<Ordem>("biblioteca-ordem", "recentes");
  const [plataforma, setPlataforma] = useState("");
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [tag, setTag] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [editando, setEditando] = useState<RegistroComMidia | null>(null);

  const doTipo = useMemo(
    () => (registros ?? []).filter((r) => tipo === "tudo" || r.midia.tipo === tipo),
    [registros, tipo],
  );

  const plataformas = useMemo(
    () => [...new Set(doTipo.map((r) => r.plataforma ?? r.servico).filter((p): p is string => Boolean(p)))].sort(),
    [doTipo],
  );
  const tags = useMemo(() => [...new Set(doTipo.flatMap((r) => r.tags))].sort(), [doTipo]);

  if (isPending || !registros) return <CarregandoTela />;

  const busca = texto.trim().toLowerCase();
  const filtrados = doTipo
    .filter((r) => grupo === "todos" || GRUPO_DO_STATUS[r.status] === grupo)
    .filter((r) => !busca || r.midia.titulo.toLowerCase().includes(busca))
    .filter((r) => !plataforma || r.plataforma === plataforma || r.servico === plataforma)
    .filter((r) => !soFavoritos || r.favorito)
    .filter((r) => !tag || r.tags.includes(tag))
    .sort(ordenar[ordem]);

  const contagem = (g: GrupoStatus | "todos") =>
    g === "todos" ? doTipo.length : doTipo.filter((r) => GRUPO_DO_STATUS[r.status] === g).length;
  const filtrosAtivos = [plataforma, soFavoritos, tag].filter(Boolean).length;

  return (
    <main>
      <TituloTela>Biblioteca</TituloTela>

      <div className="mt-5 flex gap-2" role="group" aria-label="Tipo">
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            type="button"
            aria-pressed={tipo === t.valor}
            onClick={() => setTipo(t.valor)}
            className={`min-h-11 flex-1 rounded-full text-13 font-bold ${tipo === t.valor ? "bg-tinta text-white" : "bg-cartao"}`}
          >
            {t.rotulo}
          </button>
        ))}
      </div>

      <div className="sem-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="Status">
        {(["todos", ...GRUPOS] as const).map((g) => {
          const n = contagem(g);
          if (g !== "todos" && n === 0 && grupo !== g) return null;
          return (
            <button
              key={g}
              role="tab"
              type="button"
              aria-selected={grupo === g}
              onClick={() => setGrupo(g)}
              className={`min-h-10 shrink-0 rounded-full px-4 text-12 font-bold ${
                grupo === g ? "bg-marca text-white" : "bg-cartao"
              }`}
            >
              {g === "todos" ? "Todos" : ROTULO_GRUPO[g]} <span className="opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Search size={18} strokeWidth={2.2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-texto-suave" />
          <label htmlFor="filtro-texto" className="sr-only">Procurar na biblioteca</label>
          <input
            id="filtro-texto"
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Procurar"
            className="h-12 w-full rounded-full bg-cartao pr-4 pl-11 text-corpo outline-none focus:ring-2 focus:ring-marca"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltrosAbertos(true)}
          aria-label={`Filtros e ordem${filtrosAtivos ? `, ${filtrosAtivos} ativos` : ""}`}
          className={`relative flex size-12 items-center justify-center rounded-full ${filtrosAtivos ? "bg-marca text-white" : "bg-cartao"}`}
        >
          <SlidersHorizontal size={20} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={() => setVisao(visao === "grade" ? "lista" : "grade")}
          aria-label={visao === "grade" ? "Ver em lista" : "Ver em grade"}
          className="flex size-12 items-center justify-center rounded-full bg-cartao"
        >
          {visao === "grade" ? <List size={20} strokeWidth={2.2} /> : <LayoutGrid size={20} strokeWidth={2.2} />}
        </button>
      </div>

      {registros.length === 0 ? (
        <EstadoVazio
          titulo="Sua biblioteca está vazia."
          texto="Toque no + para adicionar o primeiro jogo, filme ou série."
        />
      ) : filtrados.length === 0 ? (
        <EstadoVazio
          titulo={grupo === "fila" ? "Backlog limpo. Que lenda." : "Nada por aqui."}
          texto="Mude o filtro ou a aba para ver outros títulos."
        />
      ) : visao === "grade" ? (
        <ul className="mt-4 grid grid-cols-3 gap-3">
          {filtrados.map((r) => (
            <li key={r.id}>
              <Link href={`/midia/${r.midia_id}`} className="group block">
                <div className="relative overflow-hidden rounded-[18px]">
                  <Capa midia={r.midia} className="aspect-[3/4] w-full" />
                  {r.nota != null && (
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-tinta/85 px-2 py-0.5 text-11 font-bold text-white">
                      {formatarNota(r.nota)}
                    </span>
                  )}
                  {r.favorito && (
                    <Heart size={16} strokeWidth={2.4} className="absolute top-2 left-2 fill-marca text-white" aria-label="Favorito" />
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-12 font-bold leading-tight">{r.midia.titulo}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 space-y-2">
          {filtrados.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-[20px] bg-cartao p-2.5">
              <Link href={`/midia/${r.midia_id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <Capa midia={r.midia} className="h-16 w-12 shrink-0 rounded-[12px]" tamanhoLetra="text-20" />
                <div className="min-w-0">
                  <p className="truncate text-corpo font-bold">{r.midia.titulo}</p>
                  <p className="truncate text-12 text-texto-suave">
                    {[r.midia.ano, r.plataforma ?? r.servico, r.nota != null ? `nota ${formatarNota(r.nota)}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <ChipStatus status={r.status} tipo={r.midia.tipo} className="mt-1" />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setEditando(r)}
                aria-label={`Editar ${r.midia.titulo}`}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-chip"
              >
                <Pencil size={18} strokeWidth={2.2} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Painel aberto={filtrosAbertos} aoFechar={() => setFiltrosAbertos(false)} titulo="Filtros e ordem">
        <div className="space-y-4 pt-2">
          <div>
            <label htmlFor="ordem" className="rotulo">Ordenar por</label>
            <select id="ordem" className="campo" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
              {ORDENS.map((o) => (
                <option key={o.valor} value={o.valor}>{o.rotulo}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="plataforma-f" className="rotulo">Plataforma ou serviço</label>
            <select id="plataforma-f" className="campo" value={plataforma} onChange={(e) => setPlataforma(e.target.value)}>
              <option value="">Todas</option>
              {plataformas.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          {tags.length > 0 && (
            <div>
              <label htmlFor="tag-f" className="rotulo">Tag</label>
              <select id="tag-f" className="campo" value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="">Qualquer</option>
                {tags.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
          <label className="flex min-h-11 items-center gap-3 text-corpo font-bold">
            <input type="checkbox" checked={soFavoritos} onChange={(e) => setSoFavoritos(e.target.checked)} className="size-5" />
            Só favoritos
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setPlataforma("");
                setTag("");
                setSoFavoritos(false);
              }}
              className="botao botao-chip flex-1"
            >
              Limpar
            </button>
            <button type="button" onClick={() => setFiltrosAbertos(false)} className="botao botao-marca flex-1">
              Ver {filtrados.length}
            </button>
          </div>
        </div>
      </Painel>

      {editando && (
        <EditarRegistro midia={editando.midia} registro={editando} aberto aoFechar={() => setEditando(null)} />
      )}
    </main>
  );
}
