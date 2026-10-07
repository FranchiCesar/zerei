// Gera os ícones do PWA a partir do SVG do logo.
// Uso: node scripts/gerar-icones.mjs
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const AZUL = "#2F6BFF";

// "Z" branco cujo traço final vira um check.
const marca = `
  <path d="M112 142 H306 L112 322 H232 L288 376 L404 236"
    fill="none" stroke="#FFFFFF" stroke-width="52"
    stroke-linecap="round" stroke-linejoin="round" />`;

// Ícone comum: quadrado azul com cantos arredondados.
const svgPadrao = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${AZUL}" />${marca}
</svg>`;

// Maskable/Apple: fundo cheio e marca reduzida para caber na zona segura.
const svgCheio = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${AZUL}" />
  <g transform="translate(256 256) scale(0.78) translate(-256 -256)">${marca}</g>
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
