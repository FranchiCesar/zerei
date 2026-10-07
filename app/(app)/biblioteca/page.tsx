import { EstadoVazio } from "@/components/ui/estado-vazio";
import { TituloTela } from "@/components/ui/titulo-tela";

export const metadata = { title: "Biblioteca · Zerei" };

export default function Biblioteca() {
  return (
    <main>
      <TituloTela>Biblioteca</TituloTela>
      <EstadoVazio
        titulo="Sua biblioteca está vazia."
        texto="Jogos, filmes e séries que você adicionar aparecem aqui."
      />
    </main>
  );
}
