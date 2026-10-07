import { Topo } from "@/components/ui/topo";
import { TituloTela } from "@/components/ui/titulo-tela";

export const metadata = { title: "Privacidade · Zerei" };

export default function Privacidade() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),32px)]">
      <Topo voltarPara="/configuracoes" />
      <TituloTela>Privacidade</TituloTela>
      <div className="mt-5 space-y-4 rounded-[24px] bg-cartao p-5 text-corpo leading-relaxed">
        <p>
          O Zerei guarda só o que você registra: sua biblioteca de jogos, filmes e séries, notas, listas, metas e as peças e
          fotos do seu setup, além do seu e-mail e nome para entrar na conta.
        </p>
        <p>
          Os dados ficam no Supabase, protegidos para que só a sua conta consiga ler e alterar o que é seu. Uma cópia fica no
          seu aparelho para o app abrir sem internet; ela é apagada quando você sai da conta.
        </p>
        <p>
          As fotos que você envia ficam num endereço de difícil adivinhação, mas qualquer pessoa com o link exato consegue
          abrir. Não envie fotos com informações pessoais.
        </p>
        <p>
          Buscas de títulos passam pelo nosso servidor até a IGDB e a TMDB, sem enviar seus dados pessoais. Não usamos
          anúncios nem vendemos dados.
        </p>
        <p>
          Em Configurações você pode exportar tudo em um arquivo e excluir a conta com todos os dados a qualquer momento.
        </p>
      </div>
    </main>
  );
}
