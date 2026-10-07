"use client";

import Link from "next/link";
import { useState } from "react";
import { Link2 } from "lucide-react";
import { useVincular, useRegistros } from "@/lib/dados";
import type { ResultadoBusca } from "@/lib/tipos";

const normalizar = (t: string) =>
  t
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Liga de uma vez os títulos cadastrados à mão à IGDB/TMDB.
 * Só liga quando o nome bate exatamente (ou o 1º resultado tem o mesmo ano); o resto fica para ligar na ficha.
 */
export function LigarEmLote() {
  const { data: registros = [] } = useRegistros();
  const vincular = useVincular();
  const [rodando, setRodando] = useState(false);
  const [progresso, setProgresso] = useState({ feitos: 0, total: 0 });
  const [pendentes, setPendentes] = useState<{ id: string; titulo: string; tipo: string }[] | null>(null);
  const [ligados, setLigados] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  const manuais = registros.filter((r) => r.midia.fonte === "manual");

  const rodar = async () => {
    setRodando(true);
    setErro(null);
    setLigados(0);
    const sobra: { id: string; titulo: string; tipo: string }[] = [];
    setProgresso({ feitos: 0, total: manuais.length });

    for (const [i, r] of manuais.entries()) {
      const { midia } = r;
      try {
        const url =
          midia.tipo === "jogo"
            ? `/api/igdb?q=${encodeURIComponent(midia.titulo)}`
            : `/api/tmdb?q=${encodeURIComponent(midia.titulo)}&tipo=${midia.tipo}`;
        const resposta = await fetch(url);
        const json = await resposta.json();
        if (!resposta.ok) {
          if (json.erro === "nao_configurado") {
            setErro("As chaves da IGDB/TMDB ainda não foram configuradas no servidor.");
            break;
          }
          throw new Error(json.mensagem);
        }
        const resultados = (json.resultados as ResultadoBusca[]).filter((x) => x.tipo === midia.tipo);
        const alvo = normalizar(midia.titulo);
        const escolhido =
          resultados.find((x) => normalizar(x.titulo) === alvo && (!midia.ano || !x.ano || x.ano === midia.ano)) ??
          resultados.find((x) => normalizar(x.titulo) === alvo) ??
          (midia.ano && resultados[0]?.ano === midia.ano ? resultados[0] : undefined);

        if (escolhido) {
          await vincular.mutateAsync({ midiaId: midia.id, resultado: escolhido });
          setLigados((n) => n + 1);
        } else {
          sobra.push({ id: midia.id, titulo: midia.titulo, tipo: midia.tipo });
        }
      } catch {
        sobra.push({ id: midia.id, titulo: midia.titulo, tipo: midia.tipo });
      }
      setProgresso({ feitos: i + 1, total: manuais.length });
      await esperar(600); // respeita o limite de 4 requisições/s da IGDB
    }

    setPendentes(sobra);
    setRodando(false);
  };

  return (
    <section className="mt-4 rounded-[24px] bg-cartao p-5">
      <h2 className="titulo text-20">Ligar à IGDB e TMDB</h2>
      <p className="mt-2 text-13 text-texto-suave">
        {manuais.length
          ? `${manuais.length} títulos foram cadastrados à mão. Ligar traz capa, gêneros, ano e tempo para zerar, sem perder status, notas nem listas.`
          : "Todos os seus títulos já estão ligados à base."}
      </p>

      {rodando && (
        <div className="mt-4" role="status">
          <p className="text-13 font-bold">
            Ligando {progresso.feitos} de {progresso.total}... ({ligados} ligados)
          </p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-marca-claro">
            <div className="h-full rounded-full bg-marca transition-all" style={{ width: `${(progresso.feitos / Math.max(1, progresso.total)) * 100}%` }} />
          </div>
        </div>
      )}

      {erro && <p role="alert" className="mt-3 text-13 font-bold text-perigo">{erro}</p>}

      {!rodando && pendentes && (
        <div className="mt-4">
          <p className="text-13 font-bold">
            {ligados} ligados.{" "}
            {pendentes.length ? `${pendentes.length} precisam de você (nome diferente na base):` : "Tudo certo!"}
          </p>
          {pendentes.length > 0 && (
            <ul className="mt-2 space-y-1">
              {pendentes.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/adicionar?vincular=${p.id}&tipo=${p.tipo}&q=${encodeURIComponent(p.titulo)}`}
                    className="flex min-h-11 items-center gap-2 rounded-[14px] bg-chip px-3 text-13 font-bold"
                  >
                    <Link2 size={16} strokeWidth={2.2} /> {p.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {manuais.length > 0 && !rodando && (
        <button type="button" onClick={rodar} className="botao botao-marca mt-4 w-full">
          <Link2 size={18} strokeWidth={2.2} /> Ligar {manuais.length} títulos agora
        </button>
      )}
    </section>
  );
}
