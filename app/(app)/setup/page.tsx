import { EstadoVazio } from "@/components/ui/estado-vazio";
import { TituloTela } from "@/components/ui/titulo-tela";

export const metadata = { title: "Meu setup · Zerei" };

export default function Setup() {
  return (
    <main>
      <TituloTela>
        Meu
        <br />
        setup
      </TituloTela>
      <EstadoVazio
        expressao="dormindo"
        titulo="Seu setup está sem peças."
        texto="Comece pela principal."
      />
    </main>
  );
}
