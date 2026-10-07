import { NextResponse } from "next/server";
import { naoAutorizado, respostaDeErro, usuarioLogado } from "@/lib/api";
import { criarClienteAdmin } from "@/lib/supabase/admin";

// Exclui a conta e tudo o que é dela (as tabelas apagam em cascata).
export async function DELETE() {
  const usuario = await usuarioLogado();
  if (!usuario) return naoAutorizado();

  try {
    const admin = criarClienteAdmin();

    // Fotos: pasta <usuario_id>/ e subpastas
    for (const pasta of [usuario.id, `${usuario.id}/pecas`, `${usuario.id}/setup`]) {
      const { data: arquivos } = await admin.storage.from("fotos").list(pasta, { limit: 1000 });
      const caminhos = (arquivos ?? []).filter((a) => a.id).map((a) => `${pasta}/${a.name}`);
      if (caminhos.length) await admin.storage.from("fotos").remove(caminhos);
    }

    const { error } = await admin.auth.admin.deleteUser(usuario.id);
    if (error) throw error;
    await usuario.supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return respostaDeErro(erro);
  }
}
