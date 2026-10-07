import Link from "next/link";
import { Mascote } from "@/components/ui/mascote";

export default function NaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Mascote expressao="confuso" animacao="flutuar" className="h-40 w-auto" />
      <h1 className="titulo mt-6 text-destaque">Essa página não existe.</h1>
      <p className="mt-3 text-corpo text-texto-suave">O link pode estar errado ou a página mudou de lugar.</p>
      <Link href="/inicio" className="botao botao-marca mt-6">
        Voltar para o início
      </Link>
    </main>
  );
}
