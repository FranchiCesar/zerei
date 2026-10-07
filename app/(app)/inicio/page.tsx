import Link from "next/link";
import { ArrowRight, LayoutGrid, Star } from "lucide-react";
import { AvisoInstalar } from "@/components/pwa/aviso-instalar";
import { Mascote } from "@/components/ui/mascote";
import { TituloTela } from "@/components/ui/titulo-tela";
import { jogandoAgora, meta, proximosDaFila } from "@/lib/mock";

export const metadata = { title: "Início · Zerei" };

const corCapa = {
  tinta: "bg-tinta text-azul",
  azul: "bg-azul text-tinta",
  neutro: "bg-[#D6D3C4] text-tinta",
} as const;

export default function Inicio() {
  const pontos = Array.from({ length: meta.alvoJogos }, (_, i) => i < meta.jogosZerados);
  // Até 10 pontos por bloco; com metas maiores, cada ponto vale mais de um jogo
  const porPonto = Math.ceil(meta.alvoJogos / 10);
  const pontosVisiveis = pontos.filter((_, i) => i % porPonto === 0);

  return (
    <main>
      {/* Topo */}
      <header className="flex items-center justify-between">
        <Link
          href="/setup"
          aria-label="Meu setup"
          className="flex size-12 items-center justify-center rounded-full bg-cartao"
        >
          <LayoutGrid size={22} strokeWidth={2.2} />
        </Link>
        <p className="flex items-center gap-1.5 text-20 font-bold">
          {meta.jogosZerados} zerados
          <Star size={20} strokeWidth={2.2} className="fill-azul text-texto" />
        </p>
        <Link
          href="/perfil"
          aria-label="Perfil"
          className="titulo flex size-12 items-center justify-center rounded-full bg-tinta text-20 text-azul"
        >
          Z
        </Link>
      </header>

      <AvisoInstalar />

      <TituloTela>
        Jogando
        <br />
        agora
      </TituloTela>

      {/* Cartão em destaque */}
      <section className="relative mt-5 overflow-hidden rounded-[28px] bg-azul p-5 text-white shadow-destaque">
        <Mascote className="pointer-events-none absolute -right-4 top-10 h-40 w-auto" />
        <div className="relative">
          <span className="inline-block rounded-full bg-cartao px-3 py-1.5 text-12 font-bold text-texto">
            {jogandoAgora.plataforma} · {jogandoAgora.genero}
          </span>
          <h2 className="titulo mt-3 max-w-[60%] text-destaque">{jogandoAgora.titulo}</h2>
          <p className="mt-2 text-13 font-bold">
            {jogandoAgora.horas} h jogadas · {jogandoAgora.conclusaoPct}% da história
          </p>
          <div
            role="progressbar"
            aria-label="Progresso da história"
            aria-valuenow={jogandoAgora.conclusaoPct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-3 h-2.5 w-[58%] overflow-hidden rounded-full bg-azul-escuro"
          >
            <div
              className="h-full rounded-full bg-tinta"
              style={{ width: `${jogandoAgora.conclusaoPct}%` }}
            />
          </div>
        </div>
        <Link
          href={`/midia/${jogandoAgora.id}`}
          className="relative mt-6 flex h-14 items-center justify-center gap-2 rounded-full bg-cartao text-corpo font-bold text-texto transition-transform active:scale-[0.98]"
        >
          Atualizar progresso
          <ArrowRight size={20} strokeWidth={2.2} />
        </Link>
      </section>

      {/* Meta anual */}
      <section className="mt-4 flex items-center justify-between gap-4 rounded-[24px] bg-cartao p-5">
        <div>
          <p className="text-11 font-bold uppercase tracking-[0.14em] text-texto-suave">
            Meta {meta.ano}
          </p>
          <p className="mt-1 text-22 font-bold">
            {meta.jogosZerados} de {meta.alvoJogos} jogos
          </p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full bg-chip px-3 py-1.5 text-12 font-bold">
              {meta.filmes} filmes
            </span>
            <span className="rounded-full bg-chip px-3 py-1.5 text-12 font-bold">
              {meta.series} séries
            </span>
          </div>
        </div>
        <ul
          aria-label={`${meta.jogosZerados} de ${meta.alvoJogos} jogos zerados`}
          className="grid shrink-0 grid-cols-5 gap-2"
        >
          {pontosVisiveis.map((cheio, i) => (
            <li
              key={i}
              className={`size-5 rounded-full border-2 ${
                cheio ? "border-texto bg-azul" : "border-borda"
              }`}
            />
          ))}
        </ul>
      </section>

      {/* Próximos da fila */}
      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="titulo text-22">Próximos da fila</h2>
          <Link href="/biblioteca?status=fila" className="text-13 font-bold underline underline-offset-4">
            Ver tudo
          </Link>
        </div>
        <ul className="sem-scrollbar -mx-4 mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
          {proximosDaFila.map((item) => (
            <li key={item.id} className="w-[124px] shrink-0 snap-start">
              <Link href={`/midia/${item.id}`} className="block overflow-hidden rounded-[22px] bg-cartao">
                <div
                  className={`titulo flex h-20 items-center justify-center text-destaque ${corCapa[item.cor]}`}
                  aria-hidden="true"
                >
                  {item.titulo[0]}
                </div>
                <div className="px-3 py-2.5">
                  <p className="truncate text-13 font-bold">{item.titulo}</p>
                  <p className="text-11 text-texto-suave">{item.plataforma}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
