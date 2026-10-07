import type { Midia } from "@/lib/tipos";

// Sem capa: bloco com a inicial, nas cores da marca (como no mockup)
const FUNDOS = ["bg-tinta text-conquista", "bg-marca text-white", "bg-conquista text-tinta", "bg-marca-claro text-marca-texto"];

function corPorTitulo(titulo: string) {
  let soma = 0;
  for (const letra of titulo) soma = (soma * 31 + letra.charCodeAt(0)) >>> 0;
  return FUNDOS[soma % FUNDOS.length];
}

export function Capa({
  midia,
  className = "",
  tamanhoLetra = "text-destaque",
}: {
  midia: Pick<Midia, "titulo" | "capa_url">;
  className?: string;
  tamanhoLetra?: string;
}) {
  if (midia.capa_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- capas externas (IGDB/TMDB), sem otimização
      <img
        src={midia.capa_url}
        alt=""
        loading="lazy"
        decoding="async"
        className={`object-cover ${className}`}
      />
    );
  }
  const inicial = midia.titulo.replace(/^(the|o|a)\s+/i, "").replace(/[^\p{L}\p{N}]/gu, "")[0] ?? "?";
  return (
    <div
      aria-hidden="true"
      className={`titulo flex items-center justify-center ${corPorTitulo(midia.titulo)} ${tamanhoLetra} ${className}`}
    >
      {inicial.toUpperCase()}
    </div>
  );
}
