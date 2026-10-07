import { EstadoVazio } from "@/components/ui/estado-vazio";
import { TituloTela } from "@/components/ui/titulo-tela";

export const metadata = { title: "Listas · Zerei" };

export default function Listas() {
  return (
    <main>
      <TituloTela>Listas</TituloTela>
      <EstadoVazio
        expressao="dormindo"
        titulo="Nenhuma lista ainda."
        texto="Monte listas mistas de jogos, filmes e séries, na ordem que quiser."
      />
    </main>
  );
}
