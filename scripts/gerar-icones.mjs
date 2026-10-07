// Gera os ícones do PWA a partir do mascote (components/ui/mascote.tsx).
// Uso: npm run icones
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const FUNDO = "#00262B";

const fonte = await readFile("components/ui/mascote.tsx", "utf8");
const caminho = (nome) => fonte.match(new RegExp(`const ${nome} =[\\s]*"([^"]+)"`))[1];

// Mascote centralizado (desenho original: 434 x 600, centro em 350.75, 346.5)
const mascote = (escala) => `
  <defs>
    <linearGradient id="d" x1="350.75" y1="105.737" x2="350.75" y2="585.409" gradientUnits="userSpaceOnUse">
      <stop stop-color="#9E75FE" /><stop offset="0.15" stop-color="#AD6FFF" />
      <stop offset="0.48" stop-color="#5CE481" /><stop offset="1" stop-color="#5CE481" />
    </linearGradient>
  </defs>
  <g transform="translate(256 262) scale(${escala}) translate(-350.75 -346.5)">
    <path d="${caminho("HALO")}" fill="url(#d)" />
    <path d="${caminho("FORMA")}" fill="#F4F4F4" />
    <path d="${caminho("CONTORNO")}" fill="#00262B" />
    <path d="M275.5 265.5V317M378 266V317.5" stroke="#00262B" stroke-width="66" stroke-linecap="round" />
  </g>`;

// Ícone comum: quadrado petróleo com cantos arredondados.
const svgPadrao = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${FUNDO}" />${mascote(0.66)}
</svg>`;

// Maskable/Apple: fundo cheio e mascote reduzido para caber na zona segura.
const svgCheio = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${FUNDO}" />${mascote(0.5)}
</svg>`;

const saidas = [
  ["public/icons/icon-192.png", svgPadrao, 192],
  ["public/icons/icon-512.png", svgPadrao, 512],
  ["public/icons/maskable-512.png", svgCheio, 512],
  ["public/icons/apple-touch-icon.png", svgCheio, 180],
  ["app/icon.png", svgPadrao, 64],
];

await mkdir("public/icons", { recursive: true });
await writeFile("public/icons/icon.svg", svgPadrao.trim());
for (const [arquivo, svg, tamanho] of saidas) {
  await sharp(Buffer.from(svg)).resize(tamanho, tamanho).png().toFile(arquivo);
  console.log("gerado", arquivo);
}
