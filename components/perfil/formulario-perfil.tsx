"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useAtualizarPerfil, usePerfil, useTrocarFotoPerfil, useUsuario } from "@/lib/dados";

/** Foto, nome e usuário. Usado no painel do Perfil e em Configurações. */
export function FormularioPerfil({ aoSalvar }: { aoSalvar?: () => void }) {
  const { data: perfil } = usePerfil();
  const { data: usuario } = useUsuario();
  const atualizar = useAtualizarPerfil();
  const trocarFoto = useTrocarFotoPerfil();
  const arquivo = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar perfil={perfil} nomeReserva={usuario?.email ?? undefined} className="size-20" tamanhoLetra="text-destaque" />
        <div className="flex flex-1 flex-col gap-2">
          <button
            type="button"
            onClick={() => arquivo.current?.click()}
            disabled={trocarFoto.isPending}
            className="botao botao-chip min-h-11 text-13"
          >
            <Camera size={18} strokeWidth={2.2} />
            {trocarFoto.isPending ? "Enviando..." : perfil?.avatar_url ? "Trocar foto" : "Colocar foto"}
          </button>
          {perfil?.avatar_url && (
            <button
              type="button"
              onClick={() => trocarFoto.mutate(null)}
              disabled={trocarFoto.isPending}
              className="flex min-h-11 items-center justify-center gap-2 text-13 font-bold text-perigo"
            >
              <Trash2 size={16} strokeWidth={2.2} /> Remover foto
            </button>
          )}
        </div>
        <input
          ref={arquivo}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-label="Escolher foto de perfil"
          onChange={(e) => {
            const foto = e.target.files?.[0];
            e.target.value = "";
            if (foto) trocarFoto.mutate(foto);
          }}
        />
      </div>

      <form
        key={perfil?.id ?? "carregando"}
        onSubmit={(e) => {
          e.preventDefault();
          const dados = new FormData(e.currentTarget);
          const nome = String(dados.get("nome") ?? "").trim().slice(0, 60);
          const apelido = String(dados.get("usuario") ?? "").trim().toLowerCase();
          if (!nome) {
            setErro("Coloque um nome.");
            return;
          }
          if (apelido && !/^[a-z0-9_]{3,20}$/.test(apelido)) {
            setErro("Usuário: 3 a 20 letras minúsculas, números ou _");
            return;
          }
          setErro(null);
          atualizar.mutate({ nome, usuario: apelido || null }, { onSuccess: () => aoSalvar?.() });
        }}
        className="mt-5 space-y-3"
      >
        <div>
          <label htmlFor="perfil-nome" className="rotulo">Nome</label>
          <input id="perfil-nome" name="nome" className="campo" defaultValue={perfil?.nome ?? ""} maxLength={60} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="perfil-usuario" className="rotulo">Usuário</label>
          <input
            id="perfil-usuario"
            name="usuario"
            className="campo"
            defaultValue={perfil?.usuario ?? ""}
            placeholder="cesar"
            maxLength={20}
            autoCapitalize="none"
            autoComplete="username"
          />
        </div>
        {erro && <p role="alert" className="text-13 font-bold text-perigo">{erro}</p>}
        <button type="submit" disabled={atualizar.isPending} className="botao botao-marca w-full">
          {atualizar.isPending ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
