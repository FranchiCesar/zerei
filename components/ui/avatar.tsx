import type { Perfil } from "@/lib/tipos";

/** Foto de perfil com o anel em degradê da marca; sem foto, mostra a inicial. */
export function Avatar({
  perfil,
  nomeReserva,
  className = "size-12",
  tamanhoLetra = "text-20",
}: {
  perfil: Pick<Perfil, "nome" | "avatar_url"> | null | undefined;
  nomeReserva?: string;
  className?: string;
  tamanhoLetra?: string;
}) {
  const nome = perfil?.nome?.trim() || nomeReserva || "Z";
  return (
    <span className={`bg-gradiente block shrink-0 rounded-full p-[3px] ${className}`}>
      {perfil?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- foto do Storage, já reduzida no envio
        <img
          src={perfil.avatar_url}
          alt=""
          referrerPolicy="no-referrer"
          className="size-full rounded-full border-2 border-papel object-cover"
        />
      ) : (
        <span
          className={`titulo flex size-full items-center justify-center rounded-full border-2 border-papel bg-tinta text-conquista ${tamanhoLetra}`}
        >
          {nome[0]?.toUpperCase()}
        </span>
      )}
    </span>
  );
}
