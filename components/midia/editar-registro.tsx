"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Heart, Plus, X } from "lucide-react";
import { Painel } from "@/components/ui/painel";
import { useSalvarRegistro, usePecas } from "@/lib/dados";
import { formatarNota } from "@/lib/formato";
import {
  CRITERIOS,
  PLATAFORMAS_COMUNS,
  SERVICOS,
  STATUS_POR_TIPO,
  TAGS_SUGERIDAS,
  COR_GRUPO,
  GRUPO_DO_STATUS,
  rotuloStatus,
} from "@/lib/status";
import type { Midia, Registro, StatusRegistro } from "@/lib/tipos";

const numeroOuNulo = z.union([z.number(), z.null()]);

const esquema = z
  .object({
    status: z.string(),
    plataforma: z.string().max(40),
    servico: z.string().max(40),
    peca_id: z.string(),
    inicio: z.string(),
    fim: z.string(),
    horas: numeroOuNulo.refine((v) => v == null || (v >= 0 && v < 100000), "Horas inválidas"),
    conclusao_pct: numeroOuNulo.refine((v) => v == null || (v >= 0 && v <= 100), "Use de 0 a 100"),
    nota: numeroOuNulo,
    notas_criterio: z.record(z.string(), z.number().min(0).max(10)),
    resumo: z.string().max(2000),
    tags: z.array(z.string().max(30)).max(12),
    favorito: z.boolean(),
    revisto: z.boolean(),
  })
  .refine((v) => !v.inicio || !v.fim || v.fim >= v.inicio, {
    message: "O fim não pode ser antes do início",
    path: ["fim"],
  });

type Formulario = z.infer<typeof esquema>;

const paraNumero = (texto: string) => {
  if (texto.trim() === "") return null;
  const n = Number(texto.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

export function EditarRegistro({
  midia,
  registro,
  aberto,
  aoFechar,
}: {
  midia: Midia;
  registro: Registro | null | undefined;
  aberto: boolean;
  aoFechar: () => void;
}) {
  return (
    <Painel aberto={aberto} aoFechar={aoFechar} titulo={registro ? "Editar registro" : "Adicionar"}>
      {/* Remonta a cada abertura para começar com os dados atuais */}
      {aberto && <FormularioRegistro midia={midia} registro={registro} aoSalvar={aoFechar} />}
    </Painel>
  );
}

function FormularioRegistro({
  midia,
  registro,
  aoSalvar,
}: {
  midia: Midia;
  registro: Registro | null | undefined;
  aoSalvar: () => void;
}) {
  const salvar = useSalvarRegistro();
  const { data: pecas = [] } = usePecas();
  const [novaTag, setNovaTag] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const jogo = midia.tipo === "jogo";

  const { control, register, handleSubmit, setValue } = useForm<Formulario>({
    defaultValues: {
      status: registro?.status ?? STATUS_POR_TIPO[midia.tipo][0],
      plataforma: registro?.plataforma ?? "",
      servico: registro?.servico ?? "",
      peca_id: registro?.peca_id ?? "",
      inicio: registro?.inicio ?? "",
      fim: registro?.fim ?? "",
      horas: registro?.horas ?? null,
      conclusao_pct: registro?.conclusao_pct ?? null,
      nota: registro?.nota ?? null,
      notas_criterio: (registro?.notas_criterio ?? {}) as Record<string, number>,
      resumo: registro?.resumo ?? "",
      tags: registro?.tags ?? [],
      favorito: registro?.favorito ?? false,
      revisto: registro?.revisto ?? false,
    },
  });

  const tags = useWatch({ control, name: "tags" });
  const maquinas = pecas.filter(
    (p) => (p.categoria === "console" || p.categoria === "gabinete") && p.status !== "vendido",
  );

  const enviar = handleSubmit((valores) => {
    const validado = esquema.safeParse(valores);
    if (!validado.success) {
      setErro(validado.error.issues[0]?.message ?? "Confira os campos.");
      return;
    }
    const v = validado.data;
    setErro(null);
    salvar.mutate(
      {
        midiaId: midia.id,
        campos: {
          status: v.status as StatusRegistro,
          plataforma: jogo ? v.plataforma.trim() || null : null,
          servico: jogo ? null : v.servico || null,
          peca_id: jogo ? v.peca_id || null : null,
          inicio: v.inicio || null,
          fim: v.fim || null,
          horas: v.horas,
          conclusao_pct: jogo ? v.conclusao_pct : null,
          nota: v.nota,
          notas_criterio: jogo ? v.notas_criterio : {},
          resumo: v.resumo.trim() || null,
          tags: v.tags,
          favorito: v.favorito,
          revisto: midia.tipo === "filme" ? v.revisto : false,
        },
      },
      { onSuccess: aoSalvar },
    );
  });

  const adicionarTag = (tag: string) => {
    const limpa = tag.trim().toLowerCase();
    if (limpa && !tags.includes(limpa)) setValue("tags", [...tags, limpa]);
    setNovaTag("");
  };

  return (
    <form onSubmit={enviar} className="space-y-5 pt-2">
      {/* Status */}
      <fieldset>
        <legend className="rotulo">Status</legend>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {STATUS_POR_TIPO[midia.tipo].map((s) => {
                const ativo = field.value === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => field.onChange(s)}
                    className={`min-h-11 rounded-full px-4 text-13 font-bold transition-colors ${
                      ativo ? COR_GRUPO[GRUPO_DO_STATUS[s]] : "bg-chip"
                    }`}
                  >
                    {rotuloStatus(s, midia.tipo)}
                  </button>
                );
              })}
            </div>
          )}
        />
      </fieldset>

      {/* Onde */}
      {jogo ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="plataforma" className="rotulo">Plataforma</label>
            <input id="plataforma" list="plataformas" className="campo" placeholder="PS5" {...register("plataforma")} />
            <datalist id="plataformas">
              {[...new Set([...midia.plataformas, ...PLATAFORMAS_COMUNS])].map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="peca" className="rotulo">Máquina do setup</label>
            <select id="peca" className="campo" {...register("peca_id")}>
              <option value="">Nenhuma</option>
              {maquinas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.categoria === "gabinete" ? `PC (${p.modelo})` : p.modelo}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="servico" className="rotulo">Onde assistiu</label>
          <select id="servico" className="campo" {...register("servico")}>
            <option value="">Não informado</option>
            {SERVICOS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Datas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="inicio" className="rotulo">Início</label>
          <input id="inicio" type="date" className="campo" {...register("inicio")} />
        </div>
        <div>
          <label htmlFor="fim" className="rotulo">Fim</label>
          <input id="fim" type="date" className="campo" {...register("fim")} />
        </div>
      </div>

      {/* Progresso */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="horas" className="rotulo">{jogo ? "Horas jogadas" : "Horas assistidas"}</label>
          <input
            id="horas"
            inputMode="decimal"
            className="campo"
            placeholder="0"
            {...register("horas", { setValueAs: (v) => (typeof v === "number" ? v : paraNumero(String(v ?? ""))) })}
          />
        </div>
        {jogo && (
          <div>
            <label htmlFor="conclusao" className="rotulo">Conclusão (%)</label>
            <input
              id="conclusao"
              inputMode="numeric"
              className="campo"
              placeholder="0 a 100"
              {...register("conclusao_pct", {
                setValueAs: (v) => (typeof v === "number" ? v : paraNumero(String(v ?? ""))),
              })}
            />
          </div>
        )}
      </div>

      {/* Nota geral */}
      <Controller
        control={control}
        name="nota"
        render={({ field }) => (
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="nota" className="rotulo">Nota geral</label>
              {field.value != null ? (
                <button type="button" onClick={() => field.onChange(null)} className="text-12 font-bold text-texto-suave underline">
                  Tirar nota
                </button>
              ) : (
                <span className="text-12 text-texto-suave">Arraste para dar nota</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                id="nota"
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={field.value ?? 5}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className={`h-11 flex-1 ${field.value == null ? "opacity-40" : ""}`}
              />
              <span className="titulo w-12 text-right text-22">{formatarNota(field.value)}</span>
            </div>
          </div>
        )}
      />

      {/* Notas por critério (jogos) */}
      {jogo && (
        <Controller
          control={control}
          name="notas_criterio"
          render={({ field }) => (
            <details className="rounded-[18px] bg-chip p-4" open={Object.keys(field.value).length > 0}>
              <summary className="min-h-6 cursor-pointer text-13 font-bold">Notas por critério</summary>
              <div className="mt-3 space-y-2">
                {CRITERIOS.map(({ chave, rotulo }) => (
                  <div key={chave} className="flex items-center gap-3">
                    <label htmlFor={`c-${chave}`} className="w-28 shrink-0 text-13">{rotulo}</label>
                    <input
                      id={`c-${chave}`}
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={field.value[chave] ?? 5}
                      onChange={(e) => field.onChange({ ...field.value, [chave]: Number(e.target.value) })}
                      className={`h-10 flex-1 ${field.value[chave] == null ? "opacity-40" : ""}`}
                    />
                    <span className="w-8 text-right text-13 font-bold">{formatarNota(field.value[chave])}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        />
      )}

      {/* Resumo e tags */}
      <div>
        <label htmlFor="resumo" className="rotulo">Resumo pessoal</label>
        <textarea
          id="resumo"
          rows={3}
          className="campo resize-none"
          placeholder="O que achou? Vale a pena?"
          {...register("resumo")}
        />
      </div>

      <div>
        <p className="rotulo">Tags</p>
        <div className="flex flex-wrap gap-2">
          {[...new Set([...TAGS_SUGERIDAS, ...tags])].map((tag) => {
            const ativa = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={ativa}
                onClick={() => setValue("tags", ativa ? tags.filter((t) => t !== tag) : [...tags, tag])}
                className={`flex min-h-10 items-center gap-1 rounded-full px-3 text-12 font-bold ${
                  ativa ? "bg-marca text-white" : "bg-chip"
                }`}
              >
                {tag}
                {ativa && <X size={14} strokeWidth={2.4} />}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <label htmlFor="nova-tag" className="sr-only">Nova tag</label>
          <input
            id="nova-tag"
            value={novaTag}
            onChange={(e) => setNovaTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionarTag(novaTag);
              }
            }}
            className="campo"
            placeholder="Outra tag"
            maxLength={30}
          />
          <button
            type="button"
            onClick={() => adicionarTag(novaTag)}
            aria-label="Adicionar tag"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-chip"
          >
            <Plus size={20} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Marcações */}
      <div className="flex flex-wrap gap-2">
        <Controller
          control={control}
          name="favorito"
          render={({ field }) => (
            <button
              type="button"
              aria-pressed={field.value}
              onClick={() => field.onChange(!field.value)}
              className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-13 font-bold ${
                field.value ? "bg-tinta text-white" : "bg-chip"
              }`}
            >
              <Heart size={18} strokeWidth={2.2} className={field.value ? "fill-marca text-marca" : ""} />
              Favorito
            </button>
          )}
        />
        {midia.tipo === "filme" && (
          <Controller
            control={control}
            name="revisto"
            render={({ field }) => (
              <button
                type="button"
                aria-pressed={field.value}
                onClick={() => field.onChange(!field.value)}
                className={`min-h-11 rounded-full px-4 text-13 font-bold ${field.value ? "bg-tinta text-white" : "bg-chip"}`}
              >
                Revisto
              </button>
            )}
          />
        )}
      </div>

      {erro && (
        <p role="alert" className="text-13 font-bold text-perigo">{erro}</p>
      )}

      <button type="submit" disabled={salvar.isPending} className="botao botao-marca w-full">
        {salvar.isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
