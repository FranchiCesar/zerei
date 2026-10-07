import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Zerei",
    short_name: "Zerei",
    description: "Tudo que você zerou, assistiu e montou.",
    lang: "pt-BR",
    start_url: "/inicio",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4F4F4",
    theme_color: "#00262B",
    categories: ["entertainment", "games", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Adicionar", url: "/adicionar", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Biblioteca", url: "/biblioteca", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
