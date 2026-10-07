import { useId } from "react";

export type Expressao =
  | "neutro" // padrão
  | "feliz" // deu certo, salvou
  | "comemorando" // zerou, concluiu, meta batida
  | "deslumbrado" // platinou, recorde, retrospectiva cheia
  | "piscando" // boas-vindas, venda feita
  | "dormindo" // nada rolando, sem internet, guardado
  | "procurando" // busca, listas vazias
  | "confuso" // nada encontrado, página que não existe
  | "pensando" // carregando, em conserto
  | "surpreso" // alerta (garantia vencendo)
  | "triste" // sem acesso, abandonou, descartou
  | "tonto"; // erro, quebrou

const TINTA = "#00262B";
const CORPO = "#F4F4F4";

// Fantasminha: corpo claro com barra em zigue-zague, contorno petróleo
// e um halo em degradê roxo → verde por fora.
const FORMA =
  "M509.5 150.909V416.409V585.409L422 531.409L348 578.409L275.5 531.409L192 585.409V416.409V150.909C316.954 89.6083 386.433 91.7607 509.5 150.909Z";
const HALO =
  "M509.5 150.909H567.5C567.5 128.613 554.72 108.291 534.625 98.6333L509.5 150.909ZM192 150.909L166.454 98.8376C146.589 108.583 134 128.782 134 150.909H192ZM192 585.409H134C134 606.654 145.615 626.199 164.276 636.354C182.937 646.509 205.657 645.649 223.496 634.112L192 585.409ZM275.5 531.409L307.05 482.741C287.876 470.311 263.191 470.297 244.004 482.706L275.5 531.409ZM348 578.409L316.45 627.077C335.479 639.413 359.953 639.527 379.096 627.369L348 578.409ZM422 531.409L452.461 482.052C433.558 470.386 409.654 470.541 390.904 482.449L422 531.409ZM509.5 585.409L479.039 634.766C496.932 645.809 519.399 646.303 537.76 636.058C556.121 625.814 567.5 606.435 567.5 585.409H509.5ZM509.5 416.409H567.5V150.909H509.5H451.5V416.409H509.5ZM509.5 150.909L534.625 98.6333C470.079 67.6114 412.779 48.0807 351.78 47.7414C290.569 47.401 232.575 66.3998 166.454 98.8376L192 150.909L217.546 202.98C276.379 174.117 315.601 163.542 351.135 163.74C386.881 163.938 425.854 175.058 484.375 203.185L509.5 150.909ZM192 585.409L223.496 634.112L306.996 580.112L275.5 531.409L244.004 482.706L160.504 536.706L192 585.409ZM275.5 531.409L243.95 580.077L316.45 627.077L348 578.409L379.55 529.741L307.05 482.741L275.5 531.409ZM348 578.409L379.096 627.369L453.096 580.369L422 531.409L390.904 482.449L316.904 529.449L348 578.409ZM422 531.409L391.539 580.766L479.039 634.766L509.5 585.409L539.961 536.052L452.461 482.052L422 531.409ZM509.5 585.409H567.5V416.409H509.5H451.5V585.409H509.5ZM192 150.909H134V416.409H192H250V150.909H192ZM192 416.409H134V585.409H192H250V416.409H192Z";
const CONTORNO =
  "M509.5 150.909H542.5C542.5 138.224 535.229 126.661 523.795 121.166L509.5 150.909ZM192 150.909L177.465 121.282C166.163 126.827 159 138.32 159 150.909H192ZM192 585.409H159C159 597.497 165.609 608.617 176.226 614.395C186.844 620.173 199.77 619.683 209.92 613.119L192 585.409ZM275.5 531.409L293.451 503.719C282.542 496.646 268.497 496.639 257.58 503.699L275.5 531.409ZM348 578.409L330.049 606.1C340.876 613.118 354.801 613.183 365.693 606.265L348 578.409ZM422 531.409L439.331 503.326C428.576 496.689 414.976 496.777 404.307 503.553L422 531.409ZM509.5 585.409L492.169 613.492C502.349 619.774 515.132 620.056 525.579 614.227C536.026 608.398 542.5 597.372 542.5 585.409H509.5ZM509.5 416.409H542.5V150.909H509.5H476.5V416.409H509.5ZM509.5 150.909L523.795 121.166C460.548 90.7681 407.198 73.0502 351.641 72.7412C295.964 72.4315 242.015 89.6149 177.465 121.282L192 150.909L206.535 180.536C266.938 150.902 310.206 138.512 351.274 138.74C392.462 138.969 435.385 151.902 495.205 180.652L509.5 150.909ZM192 585.409L209.92 613.119L293.42 559.119L275.5 531.409L257.58 503.699L174.08 557.699L192 585.409ZM275.5 531.409L257.549 559.1L330.049 606.1L348 578.409L365.951 550.719L293.451 503.719L275.5 531.409ZM348 578.409L365.693 606.265L439.693 559.265L422 531.409L404.307 503.553L330.307 550.553L348 578.409ZM422 531.409L404.669 559.492L492.169 613.492L509.5 585.409L526.831 557.326L439.331 503.326L422 531.409ZM509.5 585.409H542.5V416.409H509.5H476.5V585.409H509.5ZM192 150.909H159V416.409H192H225V150.909H192ZM192 416.409H159V585.409H192H225V416.409H192Z";

// Brilho de quatro pontas
function brilho(x: number, y: number, r: number) {
  const k = r * 0.28;
  return `M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}Z`;
}

// Estrela de cinco pontas (olhos do deslumbrado)
function estrela(cx: number, cy: number, r: number) {
  const pontos = Array.from({ length: 10 }, (_, i) => {
    const raio = i % 2 === 0 ? r : r * 0.45;
    const angulo = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + raio * Math.cos(angulo)).toFixed(1)} ${(cy + raio * Math.sin(angulo)).toFixed(1)}`;
  });
  return `M${pontos.join("L")}Z`;
}

const traco = { stroke: TINTA, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
const SORRISO = "M298 392Q327 420 356 392";
const BOCA_ONDULADA = "M292 410Q304 396 316 410T340 410T364 410";

function Brilhos() {
  return (
    <>
      <path d={brilho(130, 40, 30)} fill="#5CE481" stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
      <path d={brilho(606, 46, 22)} fill="#AD6FFF" stroke={TINTA} strokeWidth={7} strokeLinejoin="round" />
    </>
  );
}

function Rosto({ expressao }: { expressao: Expressao }) {
  switch (expressao) {
    case "feliz":
      return (
        <>
          <path d="M248 302Q275.5 262 303 302" strokeWidth={26} {...traco} />
          <path d="M350.5 302Q378 262 405.5 302" strokeWidth={26} {...traco} />
          <path d={SORRISO} strokeWidth={18} {...traco} />
        </>
      );
    case "comemorando":
      return (
        <>
          <path d="M246 306L275.5 268L305 306" strokeWidth={30} {...traco} />
          <path d="M348.5 306L378 268L407.5 306" strokeWidth={30} {...traco} />
          <path d="M296 372H360C360 404 346 424 328 424C310 424 296 404 296 372Z" fill={TINTA} />
          <Brilhos />
        </>
      );
    case "deslumbrado":
      return (
        <>
          <path d={estrela(275.5, 290, 44)} fill={TINTA} stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
          <path d={estrela(378, 290, 44)} fill={TINTA} stroke={TINTA} strokeWidth={8} strokeLinejoin="round" />
          <ellipse cx="327" cy="398" rx="20" ry="24" fill={TINTA} />
          <Brilhos />
        </>
      );
    case "piscando":
      return (
        <>
          <path d="M275.5 265.5V317" strokeWidth={66} {...traco} />
          <path d="M350 298Q378 320 406 298" strokeWidth={24} {...traco} />
          <path d={SORRISO} strokeWidth={18} {...traco} />
        </>
      );
    case "dormindo":
      return (
        <>
          <path d="M248 298Q275.5 322 303 298" strokeWidth={26} {...traco} />
          <path d="M350.5 298Q378 322 405.5 298" strokeWidth={26} {...traco} />
          <path d="M578 -6H614L578 30H614" strokeWidth={13} {...traco} />
          <path d="M614 50H632L614 68H632" strokeWidth={9} {...traco} />
        </>
      );
    case "procurando":
      return (
        <>
          <path d="M332 236V276" strokeWidth={60} {...traco} />
          <path d="M432 236V276" strokeWidth={60} {...traco} />
        </>
      );
    case "confuso":
      return (
        <>
          <path d="M275.5 262V320" strokeWidth={66} {...traco} />
          <circle cx="378" cy="300" r="22" fill={TINTA} />
          <path d={BOCA_ONDULADA} strokeWidth={14} {...traco} />
          <path d="M584 26Q584 -4 610 -4Q634 -4 634 20Q634 38 612 46V60" strokeWidth={15} {...traco} />
          <circle cx="612" cy="86" r="9" fill={TINTA} />
        </>
      );
    case "pensando":
      return (
        <>
          <path d="M262 246V286" strokeWidth={60} {...traco} />
          <path d="M364 246V286" strokeWidth={60} {...traco} />
          <path d="M306 404H348" strokeWidth={16} {...traco} />
          <circle cx="580" cy="98" r="9" fill={TINTA} />
          <circle cx="604" cy="66" r="12" fill={TINTA} />
          <circle cx="628" cy="28" r="15" fill={TINTA} />
        </>
      );
    case "surpreso":
      return (
        <>
          <circle cx="275.5" cy="290" r="32" fill={TINTA} />
          <circle cx="378" cy="290" r="32" fill={TINTA} />
          <ellipse cx="327" cy="404" rx="18" ry="24" fill={TINTA} />
        </>
      );
    case "triste":
      return (
        <>
          <path d="M275.5 292V320" strokeWidth={56} {...traco} />
          <path d="M378 292V320" strokeWidth={56} {...traco} />
          <path d="M300 420Q327 396 354 420" strokeWidth={20} {...traco} />
        </>
      );
    case "tonto":
      return (
        <>
          <path d="M254 270L297 313M297 270L254 313" strokeWidth={22} {...traco} />
          <path d="M356.5 270L399.5 313M399.5 270L356.5 313" strokeWidth={22} {...traco} />
          <path d={BOCA_ONDULADA} strokeWidth={14} {...traco} />
        </>
      );
    default:
      return (
        <>
          <path d="M275.5 265.5V317" strokeWidth={66} {...traco} />
          <path d="M378 266V317.5" strokeWidth={66} {...traco} />
        </>
      );
  }
}

/** Mascote do Zerei: fantasminha de olhos em barra, com variações de expressão. */
export function Mascote({
  expressao = "neutro",
  animacao,
  className = "",
}: {
  expressao?: Expressao;
  /** flutuar: balanço lento (carregando, telas vazias); pular: comemoração. */
  animacao?: "flutuar" | "pular";
  className?: string;
}) {
  const degrade = `mascote-degrade-${useId().replace(/[^\w-]/g, "")}`;

  return (
    <svg
      viewBox="100 -20 545 680"
      className={`${animacao ? `mascote-${animacao}` : ""} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={degrade} x1="350.75" y1="105.737" x2="350.75" y2="585.409" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9E75FE" />
          <stop offset="0.15" stopColor="#AD6FFF" />
          <stop offset="0.48" stopColor="#5CE481" />
          <stop offset="1" stopColor="#5CE481" />
        </linearGradient>
      </defs>
      <path d={HALO} fill={`url(#${degrade})`} />
      <path d={FORMA} fill={CORPO} />
      <path d={CONTORNO} fill={TINTA} />
      <Rosto expressao={expressao} />
    </svg>
  );
}

/** Caminhos do mascote para quem desenha fora do React (ícones, cartões). */
export const MASCOTE_SVG = { FORMA, HALO, CONTORNO, TINTA, CORPO };
