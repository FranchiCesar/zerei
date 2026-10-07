"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Camera, X } from "lucide-react";
import { CarregandoTela } from "@/components/ui/esqueleto";
import { Topo } from "@/components/ui/topo";
import { avisarErro } from "@/lib/avisos";
import { enviarFoto, usePecas, useSalvarPeca } from "@/lib/dados";
import { centavosParaTexto, reaisParaCentavos } from "@/lib/formato";
import { GRUPOS_SETUP, ROTULO_CATEGORIA, ROTULO_STATUS_PECA } from "@/lib/status";
import type { CategoriaPeca, Peca, StatusPeca } from "@/lib/tipos";

const esquema = z
  .object({
    categoria: z.string().min(1),
    marca: z.string().trim().max(80),
    modelo: z.string().trim().min(1, "Informe o modelo").max(200),
    preco: z.string().refine((v) => !v.trim() || reaisParaCentavos(v) != null, "Preço inválido"),
    comprado_em: z.string(),
    loja: z.string().trim().max(80),
    garantia_ate: z.string(),
    status: z.string(),
    observacoes: z.string().trim().max(500),
  })
  .refine((v) => !v.garantia_ate || !v.comprado_em || v.garantia_ate >= v.comprado_em, {
    message: "A garantia não pode acabar antes da compra",
  });

type Formulario = z.infer<typeof esquema>;

export function FormularioPeca() {
  const { id } = useParams<{ id?: string }>();
  const { data: pecas, isPending } = usePecas();
  if (id && isPending) return <CarregandoTela />;
  const peca = id ? pecas?.find((p) => p.id === id) : undefined;
  return <Formulario key={peca?.id ?? "nova"} peca={peca} />;
}

function Formulario({ peca }: { peca?: Peca }) {
  const router = useRouter();
  const salvar = useSalvarPeca();
  const entrada = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [tirarFoto, setTirarFoto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const previa = useMemo(() => (arquivo ? URL.createObjectURL(arquivo) : null), [arquivo]);
  useEffect(() => () => {
    if (previa) URL.revokeObjectURL(previa);
  }, [previa]);

  const { register, handleSubmit } = useForm<Formulario>({
    defaultValues: {
      categoria: peca?.categoria ?? "",
      marca: peca?.marca ?? "",
      modelo: peca?.modelo ?? "",
      preco: centavosParaTexto(peca?.preco_centavos ?? null),
      comprado_em: peca?.comprado_em ?? "",
      loja: peca?.loja ?? "",
      garantia_ate: peca?.garantia_ate ?? "",
      status: peca?.status ?? "em_uso",
      observacoes: peca?.observacoes ?? "",
    },
  });

  const fotoAtual = tirarFoto ? null : (previa ?? peca?.foto_url ?? null);

  const enviar = handleSubmit(async (valores) => {
    const v = esquema.safeParse(valores);
    if (!v.success) {
      setErro(v.error.issues[0]?.message ?? "Confira os campos.");
      return;
    }
    if (!v.data.categoria) {
      setErro("Escolha a categoria");
      return;
    }
    setErro(null);

    let foto_url = tirarFoto ? null : (peca?.foto_url ?? null);
    if (arquivo) {
      setEnviando(true);
      try {
        foto_url = await enviarFoto(arquivo, "pecas");
      } catch (e) {
        setEnviando(false);
        avisarErro(e, "Não deu para enviar a foto.");
        return;
      }
      setEnviando(false);
    }

    salvar.mutate(
      {
        id: peca?.id,
        categoria: v.data.categoria as CategoriaPeca,
        marca: v.data.marca || null,
        modelo: v.data.modelo,
        preco_centavos: reaisParaCentavos(v.data.preco),
        comprado_em: v.data.comprado_em || null,
        loja: v.data.loja || null,
        garantia_ate: v.data.garantia_ate || null,
        status: v.data.status as StatusPeca,
        observacoes: v.data.observacoes || null,
        foto_url,
      },
      { onSuccess: (salva) => router.replace(`/setup/${salva.id}`) },
    );
  });

  return (
    <main>
      <Topo voltarPara="/setup" />
      <h1 className="titulo mt-6 text-tela">{peca ? "Editar peça" : "Nova peça"}</h1>

      <form onSubmit={enviar} className="mt-5 space-y-4">
        {/* Foto: no celular abre câmera ou galeria */}
        <div>
          <p className="rotulo">Foto</p>
          {fotoAtual ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- prévia local ou Storage */}
              <img src={fotoAtual} alt="Foto da peça" className="aspect-[4/3] w-full rounded-[24px] object-cover" />
              <button
                type="button"
                onClick={() => {
                  setArquivo(null);
                  setTirarFoto(true);
                }}
                aria-label="Remover foto"
                className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-tinta/80 text-white"
              >
                <X size={20} strokeWidth={2.2} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => entrada.current?.click()}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed border-borda bg-cartao text-corpo font-bold"
            >
              <Camera size={32} strokeWidth={2.2} className="text-marca" />
              Tirar ou escolher foto
            </button>
          )}
          <input
            ref={entrada}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setArquivo(f);
                setTirarFoto(false);
              }
              e.target.value = "";
            }}
          />
        </div>

        <div>
          <label htmlFor="categoria" className="rotulo">Categoria</label>
          <select id="categoria" className="campo" {...register("categoria")}>
            <option value="" disabled>Escolha</option>
            {GRUPOS_SETUP.map((g) => (
              <optgroup key={g.rotulo} label={g.rotulo}>
                {g.categorias.map((c) => (
                  <option key={c} value={c}>{ROTULO_CATEGORIA[c]}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="marca" className="rotulo">Marca</label>
            <input id="marca" className="campo" placeholder="MSI" {...register("marca")} />
          </div>
          <div>
            <label htmlFor="preco" className="rotulo">Preço pago (R$)</label>
            <input id="preco" inputMode="decimal" className="campo" placeholder="1.800,00" {...register("preco")} />
          </div>
        </div>

        <div>
          <label htmlFor="modelo" className="rotulo">Modelo</label>
          <input id="modelo" className="campo" placeholder="GeForce RTX 4060 Ventus 2X" {...register("modelo")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="comprado_em" className="rotulo">Data da compra</label>
            <input id="comprado_em" type="date" className="campo" {...register("comprado_em")} />
          </div>
          <div>
            <label htmlFor="garantia_ate" className="rotulo">Garantia até</label>
            <input id="garantia_ate" type="date" className="campo" {...register("garantia_ate")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="loja" className="rotulo">Loja</label>
            <input id="loja" className="campo" placeholder="Kabum" {...register("loja")} />
          </div>
          <div>
            <label htmlFor="status" className="rotulo">Status</label>
            <select id="status" className="campo" {...register("status")}>
              {(Object.keys(ROTULO_STATUS_PECA) as StatusPeca[]).map((s) => (
                <option key={s} value={s}>{ROTULO_STATUS_PECA[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="observacoes" className="rotulo">Observações</label>
          <textarea id="observacoes" rows={3} className="campo resize-none" {...register("observacoes")} />
        </div>

        {erro && <p role="alert" className="text-13 font-bold text-perigo">{erro}</p>}

        <button type="submit" disabled={enviando || salvar.isPending} className="botao botao-marca w-full">
          {enviando ? "Enviando foto..." : salvar.isPending ? "Salvando..." : "Salvar peça"}
        </button>
      </form>
    </main>
  );
}
