"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronRight, Download, Gamepad2, Lock, Monitor, Pencil, Settings, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";
import { FormularioPerfil } from "@/components/perfil/formulario-perfil";
import { Avatar } from "@/components/ui/avatar";
import { CarregandoTela, Esqueleto } from "@/components/ui/esqueleto";
import { Painel } from "@/components/ui/painel";
import { TituloTela } from "@/components/ui/titulo-tela";
import { useMetas, usePecas, usePerfil, useRegistros, useUsuario } from "@/lib/dados";
import {
  conquistas,
  linhaDoTempo,
  porGenero,
  porPlataforma,
  progressoMetas,
  totalHoras,
  valorSetup,
} from "@/lib/estatisticas";
import { formatarCentavos, formatarData } from "@/lib/formato";
import { ROTULO_TIPO_PLURAL } from "@/lib/status";

// Recharts só no navegador, e fora do pacote inicial
const GraficoRanking = dynamic(() => import("./grafico-ranking").then((m) => m.GraficoRanking), {
  ssr: false,
  loading: () => <Esqueleto className="h-48" />,
});

export function TelaPerfil() {
  const { data: registros, isPending } = useRegistros();
  const { data: pecas = [] } = usePecas();
  const { data: metas = [] } = useMetas();
  const { data: perfil } = usePerfil();
  const { data: usuario } = useUsuario();
  const [editando, setEditando] = useState(false);

  if (isPending || !registros) return <CarregandoTela />;

  const ano = new Date().getFullYear();
  const zerados = registros.filter((r) => r.status === "zerado").length;
  const filmes = registros.filter((r) => r.status === "assistido").length;
  const series = registros.filter((r) => r.status === "concluida").length;
  const horas = Math.round(totalHoras(registros));
  const setup = valorSetup(pecas.filter((p) => p.status !== "vendido"));
  const generos = porGenero(registros);
  const plataformas = porPlataforma(registros);
  const lista = conquistas(registros, pecas);
  const eventos = linhaDoTempo(registros, pecas).slice(0, 15);
  const metasAno = progressoMetas(registros, metas, ano);
  const nome = perfil?.nome ?? usuario?.email?.split("@")[0] ?? "Você";

  return (
    <main>
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setEditando(true)}
          aria-label="Editar perfil"
          className="relative shrink-0"
        >
          <Avatar perfil={perfil} nomeReserva={nome} className="size-16" tamanhoLetra="text-destaque" />
          <span className="absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border-2 border-papel bg-marca text-white">
            <Pencil size={13} strokeWidth={2.6} />
          </span>
        </button>
        <button type="button" onClick={() => setEditando(true)} className="min-w-0 flex-1 text-left">
          <p className="truncate text-20 font-bold">{nome}</p>
          <p className="truncate text-13 text-texto-suave">{perfil?.usuario ? `@${perfil.usuario}` : usuario?.email}</p>
        </button>
        <Link href="/configuracoes" aria-label="Configurações" className="flex size-12 items-center justify-center rounded-full bg-cartao">
          <Settings size={22} strokeWidth={2.2} />
        </Link>
      </header>

      <TituloTela>Perfil</TituloTela>

      {/* Totais */}
      <section className="mt-5 grid grid-cols-2 gap-3" aria-label="Totais">
        <Total valor={zerados} rotulo="jogos zerados" destaque />
        <Total valor={filmes} rotulo="filmes assistidos" />
        <Total valor={series} rotulo="séries concluídas" />
        <Total valor={horas} rotulo="horas registradas" />
        <Link href="/setup" className="col-span-2 flex items-center gap-3 rounded-[22px] bg-tinta p-4 text-white">
          <Monitor size={24} strokeWidth={2.2} className="text-conquista" />
          <span className="flex-1">
            <span className="block text-11 font-bold uppercase tracking-[0.14em] text-white/70">Meu setup</span>
            <span className="titulo text-22">{formatarCentavos(setup, true)}</span>
          </span>
          <ChevronRight size={22} strokeWidth={2.2} />
        </Link>
      </section>

      {/* Retrospectiva */}
      <Link
        href={`/retrospectiva/${ano}`}
        className="mt-3 flex items-center gap-3 rounded-[22px] bg-conquista p-4 text-tinta"
      >
        <Sparkles size={24} strokeWidth={2.2} />
        <span className="flex-1">
          <span className="block text-20 font-bold">Retrospectiva {ano}</span>
          <span className="text-13">Seu ano em stories, pronto para compartilhar</span>
        </span>
        <ChevronRight size={22} strokeWidth={2.2} />
      </Link>

      {/* Metas */}
      <section className="mt-6 rounded-[24px] bg-cartao p-5">
        <div className="flex items-center justify-between">
          <h2 className="titulo text-22">Metas {ano}</h2>
          <Link href="/configuracoes#metas" className="min-h-11 content-center text-13 font-bold underline underline-offset-4">
            Editar
          </Link>
        </div>
        <ul className="mt-3 space-y-3">
          {metasAno.map((m) => (
            <li key={m.tipo}>
              <div className="flex justify-between text-13 font-bold">
                <span>{ROTULO_TIPO_PLURAL[m.tipo]}</span>
                <span>{m.alvo ? `${m.feitos} de ${m.alvo}` : `${m.feitos} · sem meta`}</span>
              </div>
              {m.alvo && (
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-marca-claro">
                  <div
                    className={`h-full rounded-full ${m.feitos >= m.alvo ? "bg-conquista" : "bg-marca"}`}
                    style={{ width: `${Math.min(100, (m.feitos / m.alvo) * 100)}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Gráficos */}
      <section className="mt-4 rounded-[24px] bg-cartao p-5">
        <h2 className="titulo text-22">Gêneros</h2>
        {generos.length ? (
          <div className="mt-3">
            <GraficoRanking dados={generos} rotulo="Títulos por gênero" unidade={["título", "títulos"]} />
          </div>
        ) : (
          <p className="mt-2 text-13 text-texto-suave">
            Os gêneros vêm da IGDB e da TMDB. Ligue seus títulos cadastrados à mão (na ficha de cada um, ou de uma vez em
            Configurações) para ver este gráfico.
          </p>
        )}
      </section>

      <section className="mt-4 rounded-[24px] bg-cartao p-5">
        <h2 className="titulo text-22">Plataformas</h2>
        {plataformas.length ? (
          <div className="mt-3">
            <GraficoRanking dados={plataformas} rotulo="Jogos por plataforma" unidade={["jogo", "jogos"]} />
          </div>
        ) : (
          <p className="mt-2 text-13 text-texto-suave">Informe a plataforma nos seus jogos para ver onde você mais joga.</p>
        )}
      </section>

      {/* Conquistas */}
      <section className="mt-6">
        <h2 className="titulo text-22">Conquistas</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3">
          {lista.map((c) => (
            <li
              key={c.id}
              className={`rounded-[22px] p-4 ${c.obtida ? "bg-conquista text-tinta" : "bg-cartao text-texto-suave"}`}
            >
              {c.obtida ? <Trophy size={22} strokeWidth={2.2} /> : <Lock size={22} strokeWidth={2.2} />}
              <p className={`mt-2 text-corpo font-bold ${c.obtida ? "" : "text-texto"}`}>{c.titulo}</p>
              <p className="text-12">{c.descricao}</p>
              <span className="sr-only">{c.obtida ? "Obtida" : "Bloqueada"}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Linha do tempo */}
      <section className="mt-6">
        <h2 className="titulo text-22">Linha do tempo</h2>
        {eventos.length === 0 ? (
          <p className="mt-2 rounded-[22px] bg-cartao p-4 text-13 text-texto-suave">
            Aparece aqui tudo o que você concluir (com data de fim) e as peças com data de compra.
          </p>
        ) : (
          <ol className="mt-3 border-l-2 border-borda pl-5">
            {eventos.map((e) => (
              <li key={`${e.href}-${e.data}`} className="relative pb-4">
                <span
                  className={`absolute top-1.5 -left-[27px] size-3 rounded-full ring-4 ring-papel ${e.tipo === "peca" ? "bg-marca" : "bg-conquista"}`}
                  aria-hidden="true"
                />
                <Link href={e.href} className="block">
                  <p className="text-12 text-texto-suave">{formatarData(e.data)} · {e.detalhe}</p>
                  <p className="text-corpo font-bold">{e.titulo}</p>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <nav className="mt-4 space-y-2" aria-label="Mais">
        <LinhaLink href="/biblioteca" icone={<Gamepad2 size={22} strokeWidth={2.2} />} texto="Biblioteca completa" />
        <LinhaLink href="/instalar" icone={<Download size={22} strokeWidth={2.2} />} texto="Instalar o app" />
        <LinhaLink href="/configuracoes" icone={<Settings size={22} strokeWidth={2.2} />} texto="Configurações" />
      </nav>

      <Painel aberto={editando} aoFechar={() => setEditando(false)} titulo="Editar perfil">
        <div className="pt-2">
          <FormularioPerfil aoSalvar={() => setEditando(false)} />
        </div>
      </Painel>
    </main>
  );
}

function Total({ valor, rotulo, destaque = false }: { valor: number; rotulo: string; destaque?: boolean }) {
  return (
    <div className={`rounded-[22px] p-4 ${destaque ? "bg-marca text-white" : "bg-cartao"}`}>
      <p className="titulo text-destaque">{valor.toLocaleString("pt-BR")}</p>
      <p className={`mt-1 text-12 font-bold ${destaque ? "" : "text-texto-suave"}`}>{rotulo}</p>
    </div>
  );
}

function LinhaLink({ href, icone, texto }: { href: string; icone: React.ReactNode; texto: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-[22px] bg-cartao p-4">
      <span className="flex size-10 items-center justify-center rounded-full bg-marca-claro text-marca-texto">{icone}</span>
      <span className="flex-1 text-corpo font-bold">{texto}</span>
      <ChevronRight size={20} strokeWidth={2.2} />
    </Link>
  );
}
