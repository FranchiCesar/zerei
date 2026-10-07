import type { NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = {
  // Tudo, menos arquivos estáticos, ícones, manifesto e service worker
  matcher: [
    "/((?!_next/static|_next/image|icons/|icon.png|manifest.webmanifest|serwist/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
