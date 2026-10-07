import { Mascote } from "./mascote";

export function EstadoVazio({
  titulo,
  texto,
  expressao = "procurando",
}: {
  titulo: string;
  texto: string;
  expressao?: React.ComponentProps<typeof Mascote>["expressao"];
}) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-[28px] bg-cartao px-6 py-10 text-center">
      <Mascote expressao={expressao} className="h-32 w-auto" />
      <h2 className="titulo mt-5 text-22">{titulo}</h2>
      <p className="mt-2 max-w-64 text-corpo text-texto-suave">{texto}</p>
    </div>
  );
}
