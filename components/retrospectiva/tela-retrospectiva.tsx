"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Share2, X } from "lucide-react";
import { Capa } from "@/components/ui/capa";
import { CarregandoTela } from "@/components/ui/esqueleto";
import { Mascote } from "@/components/ui/mascote";
import { compartilharCartao } from "@/lib/compartilhar";
import { useMetas, usePecas, useRegistros } from "@/lib/dados";
import { concluidosNoAno, contar, porGenero, valorSetup } from "@/lib/estatisticas";
import { anoDe, formatarCentavos, formatarNota, plural } from "@/lib/formato";
import type { Meta, Peca, RegistroComMidia } from "@/lib/tipos";

interface Slide {
  id: string;
  fundo: string;
  conteudo: React.ReactNode;
}

export function TelaRetrospectiva() {
  const { ano: anoParam } = useParams<{ ano: string }>();
  const ano = Number(anoParam) || new Date().getFullYear();
  const router = useRouter();
  const { data: registros, isPending } = useRegistros();
  const { data: pecas = [] } = usePecas();
  const { data: metas = [] } = useMetas();
  const [atual, setAtual] = useState(0);
  const [gerando, setGerando] = useState(false);

  const slides = registros ? montarSlides(ano, registros, pecas, metas) : [];
  const total = slides.length;

  const avancar = useCallback(() => setAtual((a) => Math.min(a + 1, total - 1)), [total]);
  const voltar = useCallback(() => setAtual((a) => Math.max(a - 1, 0)), []);
  const fechar = useCallback(() => router.push("/perfil"), [router]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") avancar();
      if (e.key === "ArrowLeft") voltar();
      if (e.key === "Escape") fechar();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [avancar, voltar, fechar]);

  if (isPending || !registros) return <CarregandoTela />;

  const slide = slides[Math.min(atual, total - 1)];
  const ultimo = atual === total - 1;

  return (
    <div
      className={`fixed inset-0 z-50 mx-auto flex max-w-md flex-col px-5 pt-[max(env(safe-area-inset-top),14px)] pb-[max(env(safe-area-inset-bottom),20px)] transition-colors duration-300 ${slide.fundo}`}
      role="region"
      aria-roledescription="stories"
      aria-label={`Retrospectiva ${ano}`}
    >
      {/* Barras de progresso */}
      <div className="flex gap-1.5" aria-hidden="true">
        {slides.map((s, i) => (
          <span key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-current/25">
            <span className={`block h-full rounded-full bg-current ${i <= atual ? "w-full" : "w-0"}`} />
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-13 font-bold">Zerei · {ano}</p>
        <button type="button" onClick={fechar} aria-label="Fechar retrospectiva" className="flex size-11 items-center justify-center rounded-full bg-current/10">
          <X size={22} strokeWidth={2.4} />
        </button>
      </div>

      {/* Conteúdo; toque à esquerda volta, à direita avança */}
      <div className="relative flex-1">
        <div aria-live="polite" className="flex h-full flex-col justify-center py-6">
          {slide.conteudo}
        </div>
        <button type="button" onClick={voltar} aria-label="Anterior" className="absolute inset-y-0 left-0 w-1/3" disabled={atual === 0} />
        {!ultimo && <button type="button" onClick={avancar} aria-label="Próximo" className="absolute inset-y-0 right-0 w-2/3" />}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={voltar} disabled={atual === 0} aria-label="Anterior" className="flex size-12 items-center justify-center rounded-full bg-current/10 disabled:opacity-30">
          <ChevronLeft size={24} strokeWidth={2.4} />
        </button>
        {ultimo ? (
          <button
            type="button"
            disabled={gerando}
            onClick={async () => {
              setGerando(true);
              await compartilharCartao(`/api/cartao?tipo=retro&ano=${ano}`, `zerei-retrospectiva-${ano}`, `Minha retrospectiva ${ano} no Zerei`);
              setGerando(false);
            }}
            className="botao flex-1 bg-tinta text-white"
          >
            <Share2 size={20} strokeWidth={2.2} /> {gerando ? "Gerando imagem..." : "Compartilhar"}
          </button>
        ) : (
          <span className="flex-1 text-center text-12 font-bold opacity-70">
            {atual + 1} de {total}
          </span>
        )}
        <button type="button" onClick={avancar} disabled={ultimo} aria-label="Próximo" className="flex size-12 items-center justify-center rounded-full bg-current/10 disabled:opacity-30">
          <ChevronRight size={24} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

function Numerao({ valor, legenda }: { valor: string | number; legenda: string }) {
  return (
    <>
      <p className="titulo text-[120px] leading-none">{valor}</p>
      <p className="titulo mt-3 text-destaque">{legenda}</p>
    </>
  );
}

function Capas({ itens }: { itens: RegistroComMidia[] }) {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      {itens.slice(0, 6).map((r) => (
        <Capa key={r.id} midia={r.midia} className="aspect-[3/4] w-full rounded-[14px]" tamanhoLetra="text-destaque" />
      ))}
    </div>
  );
}

function montarSlides(
  ano: number,
  registros: RegistroComMidia[],
  pecas: Peca[],
  metas: Meta[],
): Slide[] {
  const jogos = concluidosNoAno(registros, ano, "jogo");
  const filmes = concluidosNoAno(registros, ano, "filme");
  const series = concluidosNoAno(registros, ano, "serie");
  const doAno = [...jogos, ...filmes, ...series];
  const horas = Math.round(doAno.reduce((s, r) => s + (r.horas ?? 0), 0));
  const plataforma = contar(jogos.map((r) => r.plataforma).filter((p): p is string => Boolean(p)))[0];
  const genero = porGenero(doAno)[0];
  const melhor = [...doAno].filter((r) => r.nota != null).sort((a, b) => b.nota! - a.nota!)[0];
  const compras = pecas.filter((p) => anoDe(p.comprado_em) === ano);
  const metaJogos = metas.find((m) => m.ano === ano && m.tipo === "jogo");

  const slides: Slide[] = [
    {
      id: "abertura",
      fundo: "bg-marca text-white",
      conteudo: (
        <>
          <Mascote expressao="deslumbrado" animacao="pular" className="h-44 w-auto self-start" />
          <p className="titulo mt-6 text-tela">Seu {ano} no Zerei</p>
          <p className="mt-3 text-20 font-bold">Bora relembrar o que rolou.</p>
        </>
      ),
    },
  ];

  if (doAno.length === 0) {
    slides.push({
      id: "vazio",
      fundo: "bg-papel text-texto",
      conteudo: (
        <>
          <Mascote expressao="dormindo" className="h-40 w-auto self-start" />
          <p className="titulo mt-6 text-destaque">Ainda nada concluído com data em {ano}.</p>
          <p className="mt-3 text-corpo">
            Ao marcar algo como Zerado, Assistido ou Concluída, a data de fim entra sozinha e aparece aqui.
          </p>
        </>
      ),
    });
  }

  if (jogos.length) {
    slides.push({
      id: "jogos",
      fundo: "bg-tinta text-white",
      conteudo: (
        <>
          <Numerao valor={jogos.length} legenda={jogos.length === 1 ? "jogo zerado" : "jogos zerados"} />
          <Capas itens={jogos} />
        </>
      ),
    });
  }

  if (horas > 0 || plataforma) {
    slides.push({
      id: "horas",
      fundo: "bg-marca-claro text-tinta",
      conteudo: (
        <>
          {horas > 0 && <Numerao valor={horas} legenda="horas registradas" />}
          {plataforma && (
            <p className="mt-6 text-20 font-bold">
              Plataforma do ano: <span className="titulo text-destaque block">{plataforma.nome}</span>
            </p>
          )}
        </>
      ),
    });
  }

  if (filmes.length || series.length) {
    slides.push({
      id: "telas",
      fundo: "bg-papel text-texto",
      conteudo: (
        <>
          <p className="titulo text-tela">Fora dos games</p>
          <p className="titulo mt-6 text-[72px] leading-none">{filmes.length}</p>
          <p className="text-22 font-bold">{filmes.length === 1 ? "filme assistido" : "filmes assistidos"}</p>
          <p className="titulo mt-5 text-[72px] leading-none">{series.length}</p>
          <p className="text-22 font-bold">{series.length === 1 ? "série concluída" : "séries concluídas"}</p>
        </>
      ),
    });
  }

  if (melhor) {
    slides.push({
      id: "melhor",
      fundo: "bg-conquista text-tinta",
      conteudo: (
        <>
          <p className="text-20 font-bold">O mais bem avaliado</p>
          <Capa midia={melhor.midia} className="mt-4 aspect-[3/4] w-44 rounded-[22px] shadow-xl" />
          <p className="titulo mt-5 text-destaque">{melhor.midia.titulo}</p>
          <p className="titulo mt-2 text-tela">nota {formatarNota(melhor.nota)}</p>
        </>
      ),
    });
  }

  if (genero) {
    slides.push({
      id: "genero",
      fundo: "bg-marca text-white",
      conteudo: (
        <>
          <p className="text-20 font-bold">Seu gênero do ano</p>
          <p className="titulo mt-3 text-tela [overflow-wrap:anywhere]">{genero.nome}</p>
          <p className="mt-3 text-20 font-bold">{plural(genero.total, "título", "títulos")}</p>
        </>
      ),
    });
  }

  if (compras.length) {
    slides.push({
      id: "setup",
      fundo: "bg-tinta text-white",
      conteudo: (
        <>
          <p className="text-20 font-bold">No setup</p>
          <Numerao valor={compras.length} legenda={compras.length === 1 ? "peça nova" : "peças novas"} />
          <p className="mt-4 text-20 font-bold">{formatarCentavos(valorSetup(compras), true)} investidos</p>
        </>
      ),
    });
  }

  if (metaJogos) {
    const batida = jogos.length >= metaJogos.alvo;
    slides.push({
      id: "meta",
      fundo: batida ? "bg-conquista text-tinta" : "bg-marca-claro text-tinta",
      conteudo: (
        <>
          <Mascote expressao={batida ? "comemorando" : "pensando"} animacao={batida ? "pular" : undefined} className="h-36 w-auto self-start" />
          <p className="titulo mt-6 text-tela">{batida ? "Meta batida!" : "Quase lá"}</p>
          <p className="mt-3 text-22 font-bold">
            {jogos.length} de {metaJogos.alvo} jogos
          </p>
        </>
      ),
    });
  }

  slides.push({
    id: "final",
    fundo: "bg-marca text-white",
    conteudo: (
      <>
        <p className="titulo text-tela">Que ano.</p>
        <p className="mt-3 text-20 font-bold">Compartilhe o cartão com o resumo de {ano}.</p>
        {/* eslint-disable-next-line @next/next/no-img-element -- prévia do cartão gerado no servidor */}
        <img
          src={`/api/cartao?tipo=retro&ano=${ano}`}
          alt={`Cartão da retrospectiva ${ano}`}
          className="mt-5 max-h-[46dvh] self-center rounded-[22px] shadow-xl"
        />
      </>
    ),
  });

  return slides;
}
