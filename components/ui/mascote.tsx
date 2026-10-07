type Expressao = "neutro" | "comemorando" | "dormindo" | "procurando";

/** Monstrinho de um olho só, traço grosso, corpo azul-claro e chifres. */
export function Mascote({
  expressao = "neutro",
  className,
}: {
  expressao?: Expressao;
  className?: string;
}) {
  const traco = {
    stroke: "#0E0E0E",
    strokeWidth: 7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 180 200"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Chifres */}
      <path d="M62 52 L48 8" {...traco} fill="none" />
      <path d="M118 52 L132 8" {...traco} fill="none" />

      {/* Braços */}
      {expressao === "comemorando" ? (
        <>
          <path d="M28 120 L8 78" {...traco} fill="none" />
          <path d="M152 120 L172 78" {...traco} fill="none" />
        </>
      ) : (
        <>
          <path d="M28 112 L6 136" {...traco} fill="none" />
          <path d="M152 112 L174 136" {...traco} fill="none" />
        </>
      )}

      {/* Corpo */}
      <path
        d="M90 40 C140 40 156 82 156 130 L156 196 L24 196 L24 130 C24 82 40 40 90 40 Z"
        fill="#DCE7FF"
        {...traco}
      />

      {/* Olho */}
      {expressao === "dormindo" ? (
        <path d="M62 100 Q90 120 118 100" {...traco} fill="none" />
      ) : (
        <>
          <circle cx="90" cy="98" r="30" fill="#FFFFFF" {...traco} />
          <circle
            cx={expressao === "procurando" ? 100 : 92}
            cy={expressao === "procurando" ? 92 : 100}
            r="14"
            fill="#0E0E0E"
          />
          <circle
            cx={expressao === "procurando" ? 105 : 97}
            cy={expressao === "procurando" ? 87 : 95}
            r="4"
            fill="#FFFFFF"
          />
        </>
      )}

      {/* Boca */}
      {expressao === "comemorando" ? (
        <path d="M60 148 Q90 180 120 148 Z" fill="#0E0E0E" {...traco} />
      ) : expressao === "dormindo" ? (
        <circle cx="90" cy="156" r="7" fill="none" {...traco} />
      ) : (
        <path
          d="M58 150 L72 164 L86 150 L100 164 L114 150 L124 160"
          {...traco}
          fill="none"
        />
      )}
    </svg>
  );
}
