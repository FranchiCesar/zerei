import {
  Armchair,
  Box,
  Cable,
  CircuitBoard,
  Cpu,
  Fan,
  Gamepad2,
  Gpu,
  HardDrive,
  Headphones,
  MemoryStick,
  Monitor,
  Mouse,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CategoriaPeca, Peca } from "@/lib/tipos";

export const ICONE_CATEGORIA: Record<CategoriaPeca, LucideIcon> = {
  processador: Cpu,
  placa_video: Gpu,
  memoria: MemoryStick,
  placa_mae: CircuitBoard,
  armazenamento: HardDrive,
  fonte: Zap,
  gabinete: Box,
  refrigeracao: Fan,
  console: Gamepad2,
  monitor: Monitor,
  periferico: Mouse,
  audio: Headphones,
  movel: Armchair,
  acessorio: Cable,
};

/** Foto da peça, ou o ícone da categoria quando não tem foto. */
export function ImagemPeca({ peca, className = "", tamanhoIcone = 22 }: { peca: Peca; className?: string; tamanhoIcone?: number }) {
  if (peca.foto_url) {
    // eslint-disable-next-line @next/next/no-img-element -- foto do Supabase Storage, já comprimida
    return <img src={peca.foto_url} alt="" loading="lazy" className={`object-cover ${className}`} />;
  }
  const Icone = ICONE_CATEGORIA[peca.categoria];
  return (
    <div aria-hidden="true" className={`flex items-center justify-center bg-marca-claro text-marca-texto ${className}`}>
      <Icone size={tamanhoIcone} strokeWidth={2.2} />
    </div>
  );
}
