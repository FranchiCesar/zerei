"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { avisarErro, mostrarAviso } from "./avisos";
import { hojeISO } from "./formato";
import { GRUPO_DO_STATUS } from "./status";
import { criarClienteNavegador } from "./supabase/client";
import type {
  EpisodioVisto,
  FotoSetup,
  ListaComItens,
  Meta,
  Midia,
  NotaTemporada,
  Peca,
  Perfil,
  Registro,
  RegistroComMidia,
  ResultadoBusca,
  StatusRegistro,
  Temporada,
  TipoMidia,
} from "./tipos";

const sb = () => criarClienteNavegador();

function ok<T>(resposta: { data: T | null; error: unknown }): T {
  if (resposta.error) throw resposta.error;
  return resposta.data as T;
}

export const chaves = {
  usuario: ["usuario"] as const,
  perfil: ["perfil"] as const,
  registros: ["registros"] as const,
  midia: (id: string) => ["midia", id] as const,
  temporadas: (id: string) => ["temporadas", id] as const,
  episodios: (id: string) => ["episodios", id] as const,
  notasTemporada: (id: string) => ["notas-temporada", id] as const,
  listas: ["listas"] as const,
  pecas: ["pecas"] as const,
  fotosSetup: ["fotos-setup"] as const,
  metas: ["metas"] as const,
};

// ============================================================
// Usuário e perfil
// ============================================================

export function useUsuario() {
  return useQuery({
    queryKey: chaves.usuario,
    // getSession lê do aparelho: funciona offline
    queryFn: async () => {
      const { data } = await sb().auth.getSession();
      const u = data.session?.user;
      return u ? { id: u.id, email: u.email ?? null } : null;
    },
    staleTime: Infinity,
  });
}

async function idUsuario() {
  const { data } = await sb().auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Sessão expirada");
  return id;
}

export function usePerfil() {
  return useQuery({
    queryKey: chaves.perfil,
    queryFn: async () => ok<Perfil | null>(await sb().from("perfis").select("*").maybeSingle()),
  });
}

export function useAtualizarPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (campos: Partial<Pick<Perfil, "nome" | "usuario">>) =>
      ok(await sb().from("perfis").update(campos).eq("id", await idUsuario()).select().single()),
    onSuccess: (perfil) => {
      qc.setQueryData(chaves.perfil, perfil);
      mostrarAviso("Perfil salvo.");
    },
    onError: (e: { code?: string }) =>
      avisarErro(e, e.code === "23505" ? "Esse nome de usuário já existe." : "Não deu para salvar o perfil."),
  });
}

// ============================================================
// Biblioteca
// ============================================================

export function useRegistros() {
  return useQuery({
    queryKey: chaves.registros,
    queryFn: async () =>
      ok<RegistroComMidia[]>(
        await sb()
          .from("registros")
          .select("*, midia:midias(*)")
          .order("atualizado_em", { ascending: false }),
      ),
  });
}

export function useMidia(id: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: chaves.midia(id),
    queryFn: async () => ok<Midia>(await sb().from("midias").select("*").eq("id", id).single()),
    // Se já veio junto com a biblioteca, mostra na hora
    initialData: () =>
      qc.getQueryData<RegistroComMidia[]>(chaves.registros)?.find((r) => r.midia_id === id)?.midia,
    initialDataUpdatedAt: () => qc.getQueryState(chaves.registros)?.dataUpdatedAt,
  });
}

/** Ajustes automáticos ao mudar de status (datas de início e fim). */
function completarDatas(campos: Partial<Registro>, atual?: Registro | null): Partial<Registro> {
  if (!campos.status) return campos;
  const grupo = GRUPO_DO_STATUS[campos.status];
  const extra: Partial<Registro> = {};
  if (grupo === "concluido" && !(campos.fim ?? atual?.fim)) extra.fim = hojeISO();
  if ((grupo === "ativo" || grupo === "concluido") && !(campos.inicio ?? atual?.inicio)) {
    extra.inicio = extra.fim ?? hojeISO();
  }
  return { ...campos, ...extra };
}

const MENSAGEM_CONCLUSAO: Partial<Record<StatusRegistro, string>> = {
  zerado: "Zerado! Qual vai ser o próximo?",
  assistido: "Assistido! Mais um pra conta.",
  concluida: "Série concluída! Que maratona.",
};

export function useSalvarRegistro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ midiaId, campos }: { midiaId: string; campos: Partial<Registro> }) => {
      const lista = qc.getQueryData<RegistroComMidia[]>(chaves.registros);
      const atual = lista?.find((r) => r.midia_id === midiaId) ?? null;
      const dados = completarDatas(campos, atual);

      if (atual) {
        return ok<Registro>(
          await sb().from("registros").update(dados).eq("id", atual.id).select().single(),
        );
      }
      return ok<Registro>(
        await sb()
          .from("registros")
          .insert({ midia_id: midiaId, status: "na_fila", ...dados })
          .select()
          .single(),
      );
    },
    onSuccess: (registro, { campos }) => {
      qc.invalidateQueries({ queryKey: chaves.registros });
      const mensagem = campos.status ? MENSAGEM_CONCLUSAO[campos.status] : undefined;
      mostrarAviso(mensagem ?? "Salvo.", mensagem ? "conquista" : "ok");
      return registro;
    },
    onError: (e) => avisarErro(e, "Não deu para salvar."),
  });
}

export function useRemoverRegistro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => ok(await sb().from("registros").delete().eq("id", id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chaves.registros });
      mostrarAviso("Removido da biblioteca.");
    },
    onError: (e) => avisarErro(e),
  });
}

async function chamarApi<T>(url: string, corpo: unknown): Promise<T> {
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  const json = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw Object.assign(new Error(json.mensagem ?? "Falha"), json);
  return json as T;
}

/** Busca → banco: copia a mídia (se preciso) e cria o registro com o status escolhido. */
export function useAdicionarDaBusca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ resultado, status }: { resultado: ResultadoBusca; status: StatusRegistro }) => {
      const { id } = await chamarApi<{ id: string }>("/api/midias", {
        fonte: resultado.fonte,
        id_externo: resultado.id_externo,
      });
      const { error } = await sb()
        .from("registros")
        .upsert(completarDatas({ usuario_id: await idUsuario(), midia_id: id, status }), {
          onConflict: "usuario_id,midia_id",
        });
      if (error) throw error;
      return id;
    },
    onSuccess: (_id, { status }) => {
      qc.invalidateQueries({ queryKey: chaves.registros });
      mostrarAviso(MENSAGEM_CONCLUSAO[status] ?? "Adicionado à biblioteca.", MENSAGEM_CONCLUSAO[status] ? "conquista" : "ok");
    },
    onError: (e: { erro?: string; mensagem?: string }) =>
      avisarErro(e, e.erro === "nao_configurado" ? "A busca ainda não foi configurada (chaves das APIs)." : "Não deu para adicionar."),
  });
}

/** Busca → mídia no banco, sem criar registro (para abrir a ficha). */
export async function abrirResultado(resultado: ResultadoBusca) {
  const { id } = await chamarApi<{ id: string }>("/api/midias", {
    fonte: resultado.fonte,
    id_externo: resultado.id_externo,
  });
  return id;
}

export function useCriarManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dados: {
      tipo: TipoMidia;
      titulo: string;
      ano: number | null;
      plataformas: string[];
      status: StatusRegistro;
      episodiosPorTemporada?: number[];
    }) => {
      const id = ok<string>(
        await sb().rpc("criar_midia_manual", {
          p_tipo: dados.tipo,
          p_titulo: dados.titulo,
          p_ano: dados.ano,
          p_plataformas: dados.plataformas,
        }),
      );
      if (dados.tipo === "serie" && dados.episodiosPorTemporada?.length) {
        ok(await sb().rpc("definir_temporadas_manual", { p_midia: id, p_episodios: dados.episodiosPorTemporada }));
      }
      ok(await sb().from("registros").insert(completarDatas({ midia_id: id, status: dados.status })));
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chaves.registros });
      mostrarAviso("Cadastrado na biblioteca.");
    },
    onError: (e) => avisarErro(e, "Não deu para cadastrar."),
  });
}

export function useVincular() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ midiaId, resultado }: { midiaId: string; resultado: ResultadoBusca }) =>
      chamarApi<{ id: string }>("/api/midias/vincular", {
        midia_id: midiaId,
        fonte: resultado.fonte,
        id_externo: resultado.id_externo,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chaves.registros });
      qc.invalidateQueries({ queryKey: chaves.listas });
    },
  });
}

// ============================================================
// Séries
// ============================================================

export function useTemporadas(midiaId: string) {
  return useQuery({
    queryKey: chaves.temporadas(midiaId),
    queryFn: async () =>
      ok<Temporada[]>(await sb().from("temporadas").select("*").eq("midia_id", midiaId).order("numero")),
  });
}

export function useEpisodiosVistos(midiaId: string) {
  return useQuery({
    queryKey: chaves.episodios(midiaId),
    queryFn: async () =>
      ok<EpisodioVisto[]>(
        await sb().from("episodios_vistos").select("midia_id, temporada, episodio, visto_em").eq("midia_id", midiaId),
      ),
  });
}

export function useNotasTemporada(midiaId: string) {
  return useQuery({
    queryKey: chaves.notasTemporada(midiaId),
    queryFn: async () =>
      ok<NotaTemporada[]>(
        await sb().from("notas_temporada").select("midia_id, temporada, nota").eq("midia_id", midiaId),
      ),
  });
}

export function useMarcarEpisodios(midiaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eps, visto }: { eps: { temporada: number; episodio: number }[]; visto: boolean }) => {
      if (!eps.length) return;
      if (visto) {
        ok(
          await sb()
            .from("episodios_vistos")
            .upsert(eps.map((e) => ({ midia_id: midiaId, ...e })), { ignoreDuplicates: true }),
        );
      } else {
        for (const temporada of new Set(eps.map((e) => e.temporada))) {
          ok(
            await sb()
              .from("episodios_vistos")
              .delete()
              .eq("midia_id", midiaId)
              .eq("temporada", temporada)
              .in("episodio", eps.filter((e) => e.temporada === temporada).map((e) => e.episodio)),
          );
        }
      }
    },
    // Marca na tela antes de o servidor responder
    onMutate: async ({ eps, visto }) => {
      await qc.cancelQueries({ queryKey: chaves.episodios(midiaId) });
      const anterior = qc.getQueryData<EpisodioVisto[]>(chaves.episodios(midiaId)) ?? [];
      const chave = (e: { temporada: number; episodio: number }) => `${e.temporada}-${e.episodio}`;
      const alvo = new Set(eps.map(chave));
      const sem = anterior.filter((e) => !alvo.has(chave(e)));
      const novos = visto
        ? [...sem, ...eps.map((e) => ({ ...e, midia_id: midiaId, visto_em: new Date().toISOString() }))]
        : sem;
      qc.setQueryData(chaves.episodios(midiaId), novos);
      return { anterior };
    },
    onError: (e, _v, contexto) => {
      if (contexto) qc.setQueryData(chaves.episodios(midiaId), contexto.anterior);
      avisarErro(e);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: chaves.episodios(midiaId) }),
  });
}

export function useSalvarNotaTemporada(midiaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ temporada, nota }: { temporada: number; nota: number | null }) => {
      if (nota == null) {
        ok(await sb().from("notas_temporada").delete().eq("midia_id", midiaId).eq("temporada", temporada));
      } else {
        ok(await sb().from("notas_temporada").upsert({ midia_id: midiaId, temporada, nota }));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.notasTemporada(midiaId) }),
    onError: (e) => avisarErro(e),
  });
}

// ============================================================
// Listas
// ============================================================

export function useListas() {
  return useQuery({
    queryKey: chaves.listas,
    queryFn: async () => {
      const listas = ok<ListaComItens[]>(
        await sb()
          .from("listas")
          .select("*, itens:itens_lista(lista_id, midia_id, posicao, adicionado_em, midia:midias(id, titulo, capa_url, tipo, ano))")
          .order("criada_em", { ascending: false }),
      );
      listas.forEach((l) => l.itens.sort((a, b) => a.posicao - b.posicao));
      return listas;
    },
  });
}

export function useCriarLista() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dados: { nome: string; descricao: string | null }) =>
      ok<{ id: string }>(await sb().from("listas").insert(dados).select("id").single()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chaves.listas });
      mostrarAviso("Lista criada.");
    },
    onError: (e) => avisarErro(e, "Não deu para criar a lista."),
  });
}

export function useEditarLista() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...campos }: { id: string; nome?: string; descricao?: string | null }) =>
      ok(await sb().from("listas").update(campos).eq("id", id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.listas }),
    onError: (e) => avisarErro(e),
  });
}

export function useApagarLista() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => ok(await sb().from("listas").delete().eq("id", id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chaves.listas });
      mostrarAviso("Lista apagada.");
    },
    onError: (e) => avisarErro(e),
  });
}

export function useAlternarItemLista() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listaId, midiaId, incluir }: { listaId: string; midiaId: string; incluir: boolean }) => {
      if (incluir) {
        const listas = qc.getQueryData<ListaComItens[]>(chaves.listas);
        const itens = listas?.find((l) => l.id === listaId)?.itens ?? [];
        const posicao = itens.length ? Math.max(...itens.map((i) => i.posicao)) + 1 : 0;
        ok(await sb().from("itens_lista").insert({ lista_id: listaId, midia_id: midiaId, posicao }));
      } else {
        ok(await sb().from("itens_lista").delete().eq("lista_id", listaId).eq("midia_id", midiaId));
      }
    },
    onSuccess: (_r, { incluir }) => {
      qc.invalidateQueries({ queryKey: chaves.listas });
      mostrarAviso(incluir ? "Adicionado à lista." : "Tirado da lista.");
    },
    onError: (e) => avisarErro(e),
  });
}

export function useReordenarLista() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listaId, ordem }: { listaId: string; ordem: string[] }) =>
      ok(
        await sb()
          .from("itens_lista")
          .upsert(ordem.map((midia_id, posicao) => ({ lista_id: listaId, midia_id, posicao }))),
      ),
    onMutate: async ({ listaId, ordem }) => {
      await qc.cancelQueries({ queryKey: chaves.listas });
      const anterior = qc.getQueryData<ListaComItens[]>(chaves.listas);
      qc.setQueryData<ListaComItens[]>(chaves.listas, (listas) =>
        listas?.map((l) =>
          l.id !== listaId
            ? l
            : {
                ...l,
                itens: ordem
                  .map((id, posicao) => {
                    const item = l.itens.find((i) => i.midia_id === id);
                    return item ? { ...item, posicao } : null;
                  })
                  .filter((i) => i !== null),
              },
        ),
      );
      return { anterior };
    },
    onError: (e, _v, contexto) => {
      if (contexto?.anterior) qc.setQueryData(chaves.listas, contexto.anterior);
      avisarErro(e, "Não deu para salvar a nova ordem.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: chaves.listas }),
  });
}

// ============================================================
// Setup
// ============================================================

export function usePecas() {
  return useQuery({
    queryKey: chaves.pecas,
    queryFn: async () =>
      ok<Peca[]>(await sb().from("pecas").select("*").order("preco_centavos", { ascending: false, nullsFirst: false })),
  });
}

export function useSalvarPeca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...campos }: Partial<Peca> & { id?: string }) => {
      if (id) return ok<Peca>(await sb().from("pecas").update(campos).eq("id", id).select().single());
      return ok<Peca>(await sb().from("pecas").insert(campos).select().single());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chaves.pecas });
      mostrarAviso("Peça salva.");
    },
    onError: (e) => avisarErro(e, "Não deu para salvar a peça."),
  });
}

export function useApagarPeca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (peca: Peca) => {
      ok(await sb().from("pecas").delete().eq("id", peca.id));
      if (peca.foto_url) await apagarFoto(peca.foto_url);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chaves.pecas });
      qc.invalidateQueries({ queryKey: chaves.registros });
      mostrarAviso("Peça apagada.");
    },
    onError: (e) => avisarErro(e),
  });
}

export function useFotosSetup() {
  return useQuery({
    queryKey: chaves.fotosSetup,
    queryFn: async () =>
      ok<FotoSetup[]>(await sb().from("fotos_setup").select("*").order("tirada_em", { ascending: false })),
  });
}

export function useAdicionarFotoSetup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ arquivo, legenda }: { arquivo: File; legenda: string | null }) => {
      const url = await enviarFoto(arquivo, "setup");
      ok(await sb().from("fotos_setup").insert({ foto_url: url, legenda }));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chaves.fotosSetup });
      mostrarAviso("Foto adicionada à galeria.");
    },
    onError: (e) => avisarErro(e, "Não deu para enviar a foto."),
  });
}

export function useApagarFotoSetup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (foto: FotoSetup) => {
      ok(await sb().from("fotos_setup").delete().eq("id", foto.id));
      await apagarFoto(foto.foto_url);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.fotosSetup }),
    onError: (e) => avisarErro(e),
  });
}

/** Reduz a foto (até 1600 px, WebP) antes de enviar: economiza dados e armazenamento. */
async function comprimir(arquivo: File): Promise<Blob> {
  const imagem = await createImageBitmap(arquivo);
  const escala = Math.min(1, 1600 / Math.max(imagem.width, imagem.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(imagem.width * escala);
  canvas.height = Math.round(imagem.height * escala);
  canvas.getContext("2d")!.drawImage(imagem, 0, 0, canvas.width, canvas.height);
  return new Promise((resolver, rejeitar) =>
    canvas.toBlob((b) => (b ? resolver(b) : rejeitar(new Error("Falha ao converter a foto"))), "image/webp", 0.82),
  );
}

export async function enviarFoto(arquivo: File, pasta: "pecas" | "setup") {
  const usuario = await idUsuario();
  const caminho = `${usuario}/${pasta}/${crypto.randomUUID()}.webp`;
  const { error } = await sb()
    .storage.from("fotos")
    .upload(caminho, await comprimir(arquivo), { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw error;
  return sb().storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
}

async function apagarFoto(url: string) {
  const caminho = url.split("/storage/v1/object/public/fotos/")[1];
  if (caminho) await sb().storage.from("fotos").remove([decodeURIComponent(caminho)]);
}

// ============================================================
// Metas
// ============================================================

export function useMetas() {
  return useQuery({
    queryKey: chaves.metas,
    queryFn: async () => ok<Meta[]>(await sb().from("metas").select("*")),
  });
}

export function useSalvarMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ano, tipo, alvo }: { ano: number; tipo: TipoMidia; alvo: number | null }) => {
      const usuario_id = await idUsuario();
      if (!alvo) {
        ok(await sb().from("metas").delete().eq("usuario_id", usuario_id).eq("ano", ano).eq("tipo", tipo));
      } else {
        ok(await sb().from("metas").upsert({ usuario_id, ano, tipo, alvo }));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.metas }),
    onError: (e) => avisarErro(e, "Não deu para salvar a meta."),
  });
}

// ============================================================
// Acesso restrito (e-mails autorizados)
// ============================================================

export interface EmailPermitido {
  email: string;
  papel: "admin" | "usuario";
  adicionado_em: string;
}

export function useAcesso() {
  return useQuery({
    queryKey: ["acesso"],
    queryFn: async () => {
      const [acesso, admin] = await Promise.all([sb().rpc("tem_acesso"), sb().rpc("sou_admin")]);
      if (acesso.error) throw acesso.error;
      return { temAcesso: acesso.data === true, admin: admin.data === true };
    },
    staleTime: 5 * 60_000,
  });
}

export function useEmailsPermitidos(ativo: boolean) {
  return useQuery({
    queryKey: ["emails-permitidos"],
    enabled: ativo,
    queryFn: async () =>
      ok<EmailPermitido[]>(
        await sb().from("emails_permitidos").select("email, papel, adicionado_em").order("adicionado_em"),
      ),
  });
}

export function useAdicionarEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) =>
      ok(
        await sb()
          .from("emails_permitidos")
          .insert({ email: email.trim().toLowerCase(), adicionado_por: await idUsuario() }),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emails-permitidos"] });
      mostrarAviso("E-mail liberado.");
    },
    onError: (e: { code?: string }) =>
      avisarErro(e, e.code === "23505" ? "Esse e-mail já está liberado." : e.code === "23514" ? "E-mail inválido." : "Não deu para liberar."),
  });
}

export function useRemoverEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => ok(await sb().from("emails_permitidos").delete().eq("email", email)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emails-permitidos"] });
      mostrarAviso("Acesso removido.");
    },
    onError: (e) => avisarErro(e, "Não deu para remover."),
  });
}
