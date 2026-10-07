import { Mascote } from "@/components/ui/mascote";

export const metadata = { title: "Sem conexão · Zerei" };

export default function Offline() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Mascote expressao="dormindo" className="h-40 w-auto" />
      <h1 className="titulo mt-6 text-destaque">Sem conexão.</h1>
      <p className="mt-3 text-corpo text-texto-suave">
        Essa tela ainda não foi salva no aparelho. Quando a internet voltar, é só tentar de novo.
      </p>
    </main>
  );
}
