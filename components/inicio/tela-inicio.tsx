"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronRight, LayoutGrid, Star } from "lucide-react";
import { EditarRegistro } from "@/components/midia/editar-registro";
import { AvisoInstalar } from "@/components/pwa/aviso-instalar";
import { Avatar } from "@/components/ui/avatar";
import { Capa } from "@/components/ui/capa";
import { CarregandoTela } from "@/components/ui/esqueleto";
import { Mascote } from "@/components/ui/mascote";
import { TituloTela } from "@/components/ui/titulo-tela";
import { useMetas, usePecas, usePerfil, useRegistros, useEpisodiosVistos, useTemporadas } from "@/lib/dados";
import { concluido, progressoMetas, valorSetup } from "@/lib/estatisticas";
import { formatarCentavos, formatarData, formatarHoras } from "@/lib/formato";
import { ROTULO_TIPO_PLURAL } from "@/lib/status";
import type { RegistroComMidia } from "@/lib/tipos";

const TEMPOS = [
  { rotulo: "Qualquer", max: null },
  { rotulo: "Até 10 h", max: 10 },
  { rotulo: "Até 30 h", max: 30 },
  { rotulo: "Até 60 h", max: 60 },
] as const;

export function TelaInicio() {
  const { data: registros, isPending } = useRegistros();
  const { data: metas = [] } = useMetas();
  const { data: pecas = [] } = usePecas();
  const { data: perfil } = usePerfil();
  const [editando, setEditando] = useState<RegistroComMidia | null>(null);
  const [tempoMax, setTempoMax] = useState<number | null>(null);

  if (isPending || !registros) {
    return <CarregandoTela />;
  }

  const ano = new Date().getFullYear();
  const zerados = registros.filter((r) => r.status === "zerado").length;
  const jogando = registros.filter((r) => r.status === "jogando");
  const assistindo = registros.filter((r) => r.status === "assistindo");
  const fila = registros
    .filter((r) => r.status === "na_fila" || r.status === "quero_ver")
    .filter((r) => tempoMax == null || (r.midia.tempo_zerar_h != null && r.midia.tempo_zerar_h <= tempoMax))
    .sort((a, b) => (a.midia.tempo_zerar_h ?? 999) - (b.midia.tempo_zerar_h ?? 999));
  const ultimos = registros
    .filter(concluido)
    .sort((a, b) => (b.fim ?? b.atualizado_em).localeCompare(a.fim ?? a.atualizado_em))
    .slice(0, 5);
  const metasAno = progressoMetas(registros, metas, ano);
  const metaJogos = metasAno[0];
  const pecasEmUso = pecas.filter((p) => p.status !== "vendido");
  const primeiroNome = perfil?.nome?.trim().split(/\s+/)[0] || "Você";

  return (
    <main>
      <header className="flex items-center justify-between gap-3">
        <Link href="/perfil" aria-label="Perfil" className="flex min-w-0 items-center gap-2.5 rounded-full bg-cartao py-1 pl-1 pr-4">
          <Avatar perfil={perfil} className="size-11" tamanhoLetra="text-20" />
          <span className="truncate text-corpo font-bold">{primeiroNome}</span>
        </Link>
        <Link
          href="/biblioteca?tipo=jogo&grupo=concluido"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-tinta py-2.5 pl-4 pr-3.5 text-corpo font-bold text-white"
        >
          {zerados} {zerados === 1 ? "zerado" : "zerados"}
          <Star size={18} strokeWidth={2.2} className="fill-conquista text-conquista" />
        </Link>
      </header>

      <AvisoInstalar />

      <TituloTela>
        Jogando
        <br />
        agora
      </TituloTela>

      {jogando.length === 0 ? (
        <section className="relative mt-5 overflow-hidden rounded-[28px] bg-marca p-5 text-white shadow-destaque">
          <Mascote expressao="dormindo" className="pointer-events-none absolute right-3 top-5 h-36 w-auto" />
          <div className="relative max-w-[62%]">
            <h2 className="titulo text-destaque">Nada rolando.</h2>
            <p className="mt-2 text-13 font-bold">Escolha o próximo da fila e marque como Jogando.</p>
          </div>
          <Link
            href="/biblioteca?tipo=jogo&grupo=fila"
            className="relative mt-6 flex h-14 items-center justify-center gap-2 rounded-full bg-cartao text-corpo font-bold text-texto"
          >
            Ver a fila <ArrowRight size={20} strokeWidth={2.2} />
          </Link>
        </section>
      ) : (
        <div className="sem-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4">
          {jogando.map((r) => (
            <CartaoJogando
              key={r.id}
              registro={r}
              sozinho={jogando.length === 1}
              aoAtualizar={() => setEditando(r)}
            />
          ))}
        </div>
      )}

      {assistindo.length > 0 && (
        <section className="mt-4">
          <h2 className="titulo text-22">Assistindo agora</h2>
          <ul className="mt-3 space-y-3">
            {assistindo.map((r) => (
              <CartaoAssistindo key={r.id} registro={r} />
            ))}
          </ul>
        </section>
      )}

      {/* Meta anual */}
      <section className="mt-4 rounded-[24px] bg-cartao p-5">
        {metaJogos.alvo ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-11 font-bold uppercase tracking-[0.14em] text-texto-suave">Meta {ano}</p>
              <p className="mt-1 text-22 font-bold">
                {metaJogos.feitos} de {metaJogos.alvo} jogos
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {metasAno.slice(1).map((m) => (
                  <span key={m.tipo} className="rounded-full bg-chip px-3 py-1.5 text-12 font-bold">
                    {m.feitos}
                    {m.alvo ? `/${m.alvo}` : ""} {ROTULO_TIPO_PLURAL[m.tipo].toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
            <PontosMeta feitos={metaJogos.feitos} alvo={metaJogos.alvo} />
          </div>
        ) : (
          <Link href="/configuracoes#metas" className="flex items-center justify-between gap-3">
            <div>
              <p className="text-11 font-bold uppercase tracking-[0.14em] text-texto-suave">Meta {ano}</p>
              <p className="mt-1 text-20 font-bold">Defina sua meta do ano</p>
              <p className="text-13 text-texto-suave">
                Até agora: {metasAno.map((m) => `${m.feitos} ${ROTULO_TIPO_PLURAL[m.tipo].toLowerCase()}`).join(" · ")}
              </p>
            </div>
            <ChevronRight size={22} strokeWidth={2.2} />
          </Link>
        )}
      </section>

      {/* Próximos da fila */}
      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="titulo text-22">Próximos da fila</h2>
          <Link href="/biblioteca?grupo=fila" className="text-13 font-bold underline underline-offset-4">
            Ver tudo
          </Link>
        </div>
        <div className="sem-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Tempo disponível">
          {TEMPOS.map((t) => (
            <button
              key={t.rotulo}
              type="button"
              aria-pressed={tempoMax === t.max}
              onClick={() => setTempoMax(t.max)}
              className={`min-h-10 shrink-0 rounded-full px-4 text-12 font-bold ${
                tempoMax === t.max ? "bg-tinta text-white" : "bg-cartao"
              }`}
            >
              {t.rotulo}
            </button>
          ))}
        </div>
        {fila.length === 0 ? (
          <p className="mt-3 rounded-[22px] bg-cartao p-5 text-corpo font-bold">
            {tempoMax == null ? "Backlog limpo. Que lenda." : "Nada na fila que caiba nesse tempo."}
          </p>
        ) : (
          <ul className="sem-scrollbar -mx-4 mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
            {fila.slice(0, 12).map((r) => (
              <li key={r.id} className="w-[124px] shrink-0 snap-start">
                <Link href={`/midia/${r.midia_id}`} className="block overflow-hidden rounded-[22px] bg-cartao">
                  <Capa midia={r.midia} className="h-[164px] w-full" />
                  <div className="px-3 py-2.5">
                    <p className="truncate text-13 font-bold">{r.midia.titulo}</p>
                    <p className="truncate text-11 text-texto-suave">
                      {[r.plataforma ?? r.midia.plataformas[0], formatarHoras(r.midia.tempo_zerar_h)]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Últimos concluídos */}
      {ultimos.length > 0 && (
        <section className="mt-6">
          <h2 className="titulo text-22">Últimos concluídos</h2>
          <ul className="mt-3 divide-y-2 divide-chip overflow-hidden rounded-[22px] bg-cartao">
            {ultimos.map((r) => (
              <li key={r.id}>
                <Link href={`/midia/${r.midia_id}`} className="flex items-center gap-3 p-3">
                  <Capa midia={r.midia} className="h-14 w-10 shrink-0 rounded-[10px]" tamanhoLetra="text-20" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-corpo font-bold">{r.midia.titulo}</p>
                    <p className="text-12 text-texto-suave">{r.fim ? formatarData(r.fim) : "Sem data"}</p>
                  </div>
                  <span className="rounded-full bg-conquista px-2.5 py-1 text-11 font-bold text-tinta">
                    {r.midia.tipo === "jogo" ? "Zerado" : r.midia.tipo === "filme" ? "Assistido" : "Concluída"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Atalho do setup */}
      <Link href="/setup" className="mt-6 flex items-center gap-4 rounded-[24px] bg-tinta p-5 text-white">
        <LayoutGrid size={28} strokeWidth={2.2} className="text-conquista" />
        <div className="flex-1">
          <p className="text-20 font-bold">Meu setup</p>
          <p className="text-13 text-white/70">
            {pecasEmUso.length} peças · {formatarCentavos(valorSetup(pecasEmUso), true)}
          </p>
        </div>
        <ChevronRight size={22} strokeWidth={2.2} />
      </Link>

      {editando && (
        <EditarRegistro
          midia={editando.midia}
          registro={editando}
          aberto
          aoFechar={() => setEditando(null)}
        />
      )}
    </main>
  );
}

function CartaoJogando({
  registro: r,
  sozinho,
  aoAtualizar,
}: {
  registro: RegistroComMidia;
  sozinho: boolean;
  aoAtualizar: () => void;
}) {
  const chip = [r.plataforma ?? r.midia.plataformas[0], r.midia.generos[0]].filter(Boolean).join(" · ");
  const pct = r.conclusao_pct ?? 0;
  const detalhes = [
    r.horas != null ? `${formatarHoras(r.horas)?.replace(" h", " h jogadas")}` : null,
    r.conclusao_pct != null ? `${r.conclusao_pct}% da história` : null,
  ].filter(Boolean);

  return (
    <section
      className={`relative shrink-0 snap-start overflow-hidden rounded-[28px] bg-marca p-5 text-white shadow-destaque ${
        sozinho ? "w-full" : "w-[88%]"
      }`}
    >
      <Mascote className="pointer-events-none absolute right-3 top-8 h-36 w-auto" />
      <Link href={`/midia/${r.midia_id}`} className="relative block">
        {chip && (
          <span className="inline-block rounded-full bg-cartao px-3 py-1.5 text-12 font-bold text-texto">{chip}</span>
        )}
        <h2 className="titulo mt-3 max-w-[60%] text-destaque [overflow-wrap:anywhere]">{r.midia.titulo}</h2>
        <p className="mt-2 text-13 font-bold">{detalhes.join(" · ") || "Sem progresso registrado"}</p>
        <div
          role="progressbar"
          aria-label="Progresso da história"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-3 h-2.5 w-[58%] overflow-hidden rounded-full bg-marca-escuro"
        >
          <div className="h-full rounded-full bg-tinta" style={{ width: `${pct}%` }} />
        </div>
      </Link>
      <button
        type="button"
        onClick={aoAtualizar}
        className="relative mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-cartao text-corpo font-bold text-texto transition-transform active:scale-[0.98]"
      >
        Atualizar progresso
        <ArrowRight size={20} strokeWidth={2.2} />
      </button>
    </section>
  );
}

function CartaoAssistindo({ registro: r }: { registro: RegistroComMidia }) {
  const { data: temporadas = [] } = useTemporadas(r.midia_id);
  const { data: vistos = [] } = useEpisodiosVistos(r.midia_id);
  const total = temporadas.reduce((s, t) => s + t.total_episodios, 0);
  const visto = new Set(vistos.map((v) => `${v.temporada}-${v.episodio}`));
  let proximo: string | null = null;
  for (const t of temporadas) {
    for (let e = 1; e <= t.total_episodios && !proximo; e++) {
      if (!visto.has(`${t.numero}-${e}`)) proximo = `T${t.numero} E${e}`;
    }
    if (proximo) break;
  }

  return (
    <li>
      <Link href={`/midia/${r.midia_id}/temporadas`} className="flex items-center gap-3 rounded-[22px] bg-cartao p-3">
        <Capa midia={r.midia} className="h-16 w-12 shrink-0 rounded-[12px]" tamanhoLetra="text-20" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-corpo font-bold">{r.midia.titulo}</p>
          <p className="text-12 text-texto-suave">
            {proximo ? `Próximo: ${proximo}` : total ? "Tudo visto!" : "Sem temporadas cadastradas"}
          </p>
          {total > 0 && (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-marca-claro">
              <div className="h-full rounded-full bg-marca" style={{ width: `${(vistos.length / total) * 100}%` }} />
            </div>
          )}
        </div>
        <ChevronRight size={20} strokeWidth={2.2} />
      </Link>
    </li>
  );
}

function PontosMeta({ feitos, alvo }: { feitos: number; alvo: number }) {
  // Até 10 pontos; com metas maiores, cada ponto vale mais de um título
  const porPonto = Math.max(1, Math.ceil(alvo / 10));
  const total = Math.ceil(alvo / porPonto);
  const cheios = Math.floor(feitos / porPonto);
  const batida = feitos >= alvo;
  return (
    <ul aria-label={`${feitos} de ${alvo}`} className="grid shrink-0 grid-cols-5 gap-2">
      {Array.from({ length: total }, (_, i) => (
        <li
          key={i}
          className={`size-5 rounded-full border-2 ${
            i < cheios ? `border-texto ${batida ? "bg-conquista" : "bg-marca"}` : "border-borda"
          }`}
        />
      ))}
    </ul>
  );
}
