"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Painel } from "@/components/ui/painel";
import { useCriarManual } from "@/lib/dados";
import { PLATAFORMAS_COMUNS, ROTULO_TIPO, STATUS_INICIAL, STATUS_POR_TIPO, rotuloStatus } from "@/lib/status";
import type { StatusRegistro, TipoMidia } from "@/lib/tipos";

const esquema = z.object({
  titulo: z.string().trim().min(1, "Dê um título").max(300),
  ano: z.union([z.null(), z.number().int().min(1870, "Ano inválido").max(2200, "Ano inválido")]),
  episodios: z.array(z.number().int().min(1).max(500)).max(60),
});

export function CadastroManual({
  aberto,
  aoFechar,
  tituloInicial,
  tipoInicial,
}: {
  aberto: boolean;
  aoFechar: () => void;
  tituloInicial: string;
  tipoInicial: TipoMidia;
}) {
  return (
    <Painel aberto={aberto} aoFechar={aoFechar} titulo="Cadastrar manualmente">
      {aberto && <Formulario tituloInicial={tituloInicial} tipoInicial={tipoInicial} aoSalvar={aoFechar} />}
    </Painel>
  );
}

function Formulario({
  tituloInicial,
  tipoInicial,
  aoSalvar,
}: {
  tituloInicial: string;
  tipoInicial: TipoMidia;
  aoSalvar: () => void;
}) {
  const router = useRouter();
  const criar = useCriarManual();
  const [tipo, setTipo] = useState<TipoMidia>(tipoInicial);
  const [titulo, setTitulo] = useState(tituloInicial);
  const [ano, setAno] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [status, setStatus] = useState<StatusRegistro>(STATUS_INICIAL[tipoInicial]);
  const [episodios, setEpisodios] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const trocarTipo = (novo: TipoMidia) => {
    setTipo(novo);
    setStatus(STATUS_INICIAL[novo]);
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const dados = esquema.safeParse({
      titulo,
      ano: ano.trim() ? Number(ano) : null,
      episodios: tipo === "serie" ? episodios.split(/[,;\s]+/).filter(Boolean).map(Number) : [],
    });
    if (!dados.success) {
      setErro(dados.error.issues[0]?.message ?? "Confira os campos.");
      return;
    }
    setErro(null);
    criar.mutate(
      {
        tipo,
        titulo: dados.data.titulo,
        ano: dados.data.ano,
        plataformas: tipo === "jogo" && plataforma.trim() ? [plataforma.trim()] : [],
        status,
        episodiosPorTemporada: dados.data.episodios,
      },
      {
        onSuccess: (id) => {
          aoSalvar();
          router.push(`/midia/${id}`);
        },
      },
    );
  };

  return (
    <form onSubmit={enviar} className="space-y-4 pt-2">
      <fieldset>
        <legend className="rotulo">Tipo</legend>
        <div className="flex gap-2">
          {(["jogo", "filme", "serie"] as TipoMidia[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tipo === t}
              onClick={() => trocarTipo(t)}
              className={`min-h-11 flex-1 rounded-full text-13 font-bold ${tipo === t ? "bg-tinta text-white" : "bg-chip"}`}
            >
              {ROTULO_TIPO[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="m-titulo" className="rotulo">Título</label>
        <input id="m-titulo" className="campo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required maxLength={300} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="m-ano" className="rotulo">Ano</label>
          <input id="m-ano" inputMode="numeric" className="campo" value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2024" />
        </div>
        {tipo === "jogo" && (
          <div>
            <label htmlFor="m-plataforma" className="rotulo">Plataforma</label>
            <input id="m-plataforma" list="m-plataformas" className="campo" value={plataforma} onChange={(e) => setPlataforma(e.target.value)} placeholder="PS5" />
            <datalist id="m-plataformas">
              {PLATAFORMAS_COMUNS.map((p) => <option key={p} value={p} />)}
            </datalist>
          </div>
        )}
      </div>

      {tipo === "serie" && (
        <div>
          <label htmlFor="m-episodios" className="rotulo">Episódios por temporada</label>
          <input
            id="m-episodios"
            className="campo"
            value={episodios}
            onChange={(e) => setEpisodios(e.target.value)}
            placeholder="Ex.: 10, 8, 10"
          />
          <p className="mt-1 text-12 text-texto-suave">Um número por temporada, separados por vírgula.</p>
        </div>
      )}

      <fieldset>
        <legend className="rotulo">Status</legend>
        <div className="flex flex-wrap gap-2">
          {STATUS_POR_TIPO[tipo].map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={`min-h-11 rounded-full px-4 text-13 font-bold ${status === s ? "bg-marca text-white" : "bg-chip"}`}
            >
              {rotuloStatus(s, tipo)}
            </button>
          ))}
        </div>
      </fieldset>

      {erro && <p role="alert" className="text-13 font-bold text-perigo">{erro}</p>}

      <button type="submit" disabled={criar.isPending} className="botao botao-marca w-full">
        {criar.isPending ? "Cadastrando..." : "Cadastrar"}
      </button>
    </form>
  );
}
