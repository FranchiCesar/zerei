"use client";

import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Play } from "lucide-react";
import { CarregandoTela } from "@/components/ui/esqueleto";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Topo } from "@/components/ui/topo";
import { avisarErro } from "@/lib/avisos";
import {
  chaves,
  useEpisodiosVistos,
  useMarcarEpisodios,
  useMidia,
  useNotasTemporada,
  useRegistros,
  useSalvarNotaTemporada,
  useSalvarRegistro,
  useTemporadas,
  useUsuario,
} from "@/lib/dados";
import { formatarNota } from "@/lib/formato";
import { criarClienteNavegador } from "@/lib/supabase/client";
import type { Temporada } from "@/lib/tipos";

const NOTAS = Array.from({ length: 21 }, (_, i) => i / 2);

export function TelaTemporadas() {
  const { id } = useParams<{ id: string }>();
  const { data: midia, isPending } = useMidia(id);
  const { data: temporadas = [], isPending: carregandoTemporadas } = useTemporadas(id);
  const { data: vistos = [] } = useEpisodiosVistos(id);
  const { data: notas = [] } = useNotasTemporada(id);
  const { data: registros = [] } = useRegistros();
  const { data: usuario } = useUsuario();
  const marcar = useMarcarEpisodios(id);
  const salvarNota = useSalvarNotaTemporada(id);
  const salvarRegistro = useSalvarRegistro();

  if (isPending || carregandoTemporadas) return <CarregandoTela />;
  if (!midia || midia.tipo !== "serie") {
    return (
      <main>
        <Topo />
        <EstadoVazio titulo="Isso não é uma série." texto="Temporadas só existem para séries." />
      </main>
    );
  }

  const registro = registros.find((r) => r.midia_id === id);
  const visto = new Set(vistos.map((v) => `${v.temporada}-${v.episodio}`));
  const total = temporadas.reduce((s, t) => s + t.total_episodios, 0);
  const vistosValidos = temporadas.reduce(
    (s, t) => s + Array.from({ length: t.total_episodios }, (_, i) => visto.has(`${t.numero}-${i + 1}`)).filter(Boolean).length,
    0,
  );

  let proximo: { temporada: number; episodio: number } | null = null;
  for (const t of temporadas) {
    for (let e = 1; e <= t.total_episodios; e++) {
      if (!visto.has(`${t.numero}-${e}`)) {
        proximo = { temporada: t.numero, episodio: e };
        break;
      }
    }
    if (proximo) break;
  }

  /** Marca/desmarca e ajusta o status da série sozinho. */
  const aplicar = (eps: { temporada: number; episodio: number }[], marcarComoVisto: boolean) => {
    const depois = marcarComoVisto
      ? vistosValidos + eps.filter((e) => !visto.has(`${e.temporada}-${e.episodio}`)).length
      : vistosValidos - eps.filter((e) => visto.has(`${e.temporada}-${e.episodio}`)).length;

    marcar.mutate(
      { eps, visto: marcarComoVisto },
      {
        onSuccess: () => {
          if (!marcarComoVisto) return;
          if (total > 0 && depois >= total && registro?.status !== "concluida") {
            salvarRegistro.mutate({ midiaId: id, campos: { status: "concluida" } });
          } else if (!registro || registro.status === "quero_ver" || registro.status === "pausado") {
            salvarRegistro.mutate({ midiaId: id, campos: { status: "assistindo" } });
          }
        },
      },
    );
  };

  const podeDefinir = midia.fonte === "manual" && midia.criado_por === usuario?.id;

  return (
    <main>
      <Topo voltarPara={`/midia/${id}`} />
      <p className="mt-5 text-11 font-bold uppercase tracking-[0.14em] text-texto-suave">Temporadas</p>
      <h1 className="titulo mt-1 text-destaque [overflow-wrap:anywhere]">{midia.titulo}</h1>

      {temporadas.length === 0 ? (
        podeDefinir ? (
          <DefinirTemporadas midiaId={id} />
        ) : (
          <EstadoVazio titulo="Sem temporadas por aqui." texto="A base não trouxe temporadas para essa série." />
        )
      ) : (
        <>
          <section className="mt-5 rounded-[28px] bg-azul p-5 text-white shadow-destaque">
            <p className="text-13 font-bold">
              {vistosValidos} de {total} episódios
            </p>
            <div
              role="progressbar"
              aria-label="Progresso da série"
              aria-valuenow={vistosValidos}
              aria-valuemin={0}
              aria-valuemax={total}
              className="mt-2 h-2.5 overflow-hidden rounded-full bg-azul-escuro"
            >
              <div className="h-full rounded-full bg-tinta" style={{ width: `${total ? (vistosValidos / total) * 100 : 0}%` }} />
            </div>
            {proximo ? (
              <button
                type="button"
                disabled={marcar.isPending}
                onClick={() => aplicar([proximo!], true)}
                className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-cartao text-corpo font-bold text-texto"
              >
                <Play size={18} strokeWidth={2.4} className="fill-current" />
                Vi o T{proximo.temporada} E{proximo.episodio}
              </button>
            ) : (
              <p className="titulo mt-4 text-22">Tudo visto. Que maratona!</p>
            )}
          </section>

          <ul className="mt-4 space-y-3">
            {temporadas.map((t) => (
              <ItemTemporada
                key={t.id}
                temporada={t}
                visto={visto}
                nota={notas.find((n) => n.temporada === t.numero)?.nota ?? null}
                abertaInicial={proximo?.temporada === t.numero}
                aoMarcar={aplicar}
                aoNota={(nota) => salvarNota.mutate({ temporada: t.numero, nota })}
              />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

function ItemTemporada({
  temporada: t,
  visto,
  nota,
  abertaInicial,
  aoMarcar,
  aoNota,
}: {
  temporada: Temporada;
  visto: Set<string>;
  nota: number | null;
  abertaInicial: boolean;
  aoMarcar: (eps: { temporada: number; episodio: number }[], visto: boolean) => void;
  aoNota: (nota: number | null) => void;
}) {
  const eps = Array.from({ length: t.total_episodios }, (_, i) => ({ temporada: t.numero, episodio: i + 1 }));
  const feitos = eps.filter((e) => visto.has(`${t.numero}-${e.episodio}`)).length;
  const completa = feitos === t.total_episodios;

  return (
    <li>
      <details open={abertaInicial} className="group rounded-[24px] bg-cartao p-4">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3">
          <span
            className={`titulo flex size-11 shrink-0 items-center justify-center rounded-full text-20 ${
              completa ? "bg-conquista text-tinta" : "bg-chip"
            }`}
          >
            {completa ? <Check size={22} strokeWidth={2.6} /> : t.numero}
          </span>
          <span className="flex-1">
            <span className="block text-corpo font-bold">Temporada {t.numero}</span>
            <span className="block text-12 text-texto-suave">
              {feitos}/{t.total_episodios} episódios{nota != null ? ` · nota ${formatarNota(nota)}` : ""}
            </span>
            <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-azul-claro">
              <span className="block h-full rounded-full bg-azul" style={{ width: `${(feitos / t.total_episodios) * 100}%` }} />
            </span>
          </span>
        </summary>

        <div className="mt-4 grid grid-cols-6 gap-2">
          {eps.map((e) => {
            const marcado = visto.has(`${t.numero}-${e.episodio}`);
            return (
              <button
                key={e.episodio}
                type="button"
                aria-pressed={marcado}
                aria-label={`Episódio ${e.episodio}${marcado ? ", visto" : ""}`}
                onClick={() => aoMarcar([e], !marcado)}
                className={`flex h-11 items-center justify-center rounded-[14px] text-13 font-bold ${
                  marcado ? "bg-azul text-white" : "bg-chip"
                }`}
              >
                {e.episodio}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => aoMarcar(eps, !completa)}
            className="botao botao-chip min-h-11 flex-1 text-13"
          >
            {completa ? "Desmarcar temporada" : "Marcar temporada toda"}
          </button>
          <label htmlFor={`nota-t${t.numero}`} className="sr-only">
            Nota da temporada {t.numero}
          </label>
          <select
            id={`nota-t${t.numero}`}
            value={nota ?? ""}
            onChange={(ev) => aoNota(ev.target.value === "" ? null : Number(ev.target.value))}
            className="campo w-auto min-w-28"
          >
            <option value="">Sem nota</option>
            {NOTAS.map((n) => (
              <option key={n} value={n}>
                Nota {formatarNota(n)}
              </option>
            ))}
          </select>
        </div>
      </details>
    </li>
  );
}

function DefinirTemporadas({ midiaId }: { midiaId: string }) {
  const qc = useQueryClient();
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const episodios = texto.split(/[,;\s]+/).filter(Boolean).map(Number);
    if (!episodios.length || episodios.some((n) => !Number.isInteger(n) || n < 1 || n > 500)) {
      avisarErro(null, "Use números inteiros, ex.: 10, 8, 10");
      return;
    }
    setSalvando(true);
    const { error } = await criarClienteNavegador().rpc("definir_temporadas_manual", {
      p_midia: midiaId,
      p_episodios: episodios,
    });
    setSalvando(false);
    if (error) avisarErro(error);
    else qc.invalidateQueries({ queryKey: chaves.temporadas(midiaId) });
  };

  return (
    <form onSubmit={salvar} className="mt-5 rounded-[24px] bg-cartao p-5">
      <h2 className="titulo text-20">Cadastre as temporadas</h2>
      <label htmlFor="eps" className="mt-3 block text-13 text-texto-suave">
        Episódios de cada temporada, separados por vírgula.
      </label>
      <input id="eps" className="campo mt-2" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="10, 8, 10" />
      <button type="submit" disabled={salvando} className="botao botao-azul mt-3 w-full">
        {salvando ? "Salvando..." : "Salvar temporadas"}
      </button>
    </form>
  );
}
