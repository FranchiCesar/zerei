import { COR_GRUPO, GRUPO_DO_STATUS, rotuloStatus } from "@/lib/status";
import type { StatusRegistro, TipoMidia } from "@/lib/tipos";

export function ChipStatus({
  status,
  tipo,
  className = "",
}: {
  status: StatusRegistro;
  tipo: TipoMidia;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-11 font-bold ${COR_GRUPO[GRUPO_DO_STATUS[status]]} ${className}`}
    >
      {rotuloStatus(status, tipo)}
    </span>
  );
}
