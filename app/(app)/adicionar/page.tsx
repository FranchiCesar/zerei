import { EstadoVazio } from "@/components/ui/estado-vazio";
import { TituloTela } from "@/components/ui/titulo-tela";

export const metadata = { title: "Adicionar · Zerei" };

export default function Adicionar() {
  return (
    <main>
      <TituloTela>Adicionar</TituloTela>
      <EstadoVazio
        titulo="Busca chegando em breve."
        texto="Aqui você vai buscar jogos, filmes e séries em um só lugar."
      />
    </main>
  );
}
