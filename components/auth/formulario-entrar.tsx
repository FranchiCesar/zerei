"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { caminhoSeguro } from "@/lib/caminho-seguro";
import { criarClienteNavegador } from "@/lib/supabase/client";

type Etapa = "email" | "codigo";

function mensagemDeErro(erro: { message?: string; status?: number; code?: string }) {
  if (erro.status === 429 || erro.code === "over_email_send_rate_limit") {
    return "Muitos e-mails em pouco tempo. Espere alguns minutos e tente de novo.";
  }
  if (erro.code === "otp_expired" || erro.message?.toLowerCase().includes("token")) {
    return "Código inválido ou expirado. Confira ou peça um novo.";
  }
  if (erro.code === "validation_failed" || erro.code === "email_address_invalid") {
    return "Esse e-mail não parece certo. Confere aí?";
  }
  return "Algo deu errado. Tente de novo em instantes.";
}

function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function FormularioEntrar() {
  const router = useRouter();
  const params = useSearchParams();
  const voltar = caminhoSeguro(params.get("voltar"));

  const [etapa, setEtapa] = useState<Etapa>("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState<"google" | "email" | "codigo" | null>(null);
  const [erro, setErro] = useState<string | null>(
    params.get("erro") === "google" ? "Não deu para entrar com o Google. Tente de novo." : null,
  );

  async function entrarComGoogle() {
    setErro(null);
    setCarregando("google");
    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?voltar=${encodeURIComponent(voltar)}`,
      },
    });
    // Em caso de sucesso o navegador já saiu da página
    if (error) {
      setErro(mensagemDeErro(error));
      setCarregando(null);
    }
  }

  async function enviarCodigo(evento?: React.FormEvent) {
    evento?.preventDefault();
    setErro(null);
    setCarregando("email");
    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setCarregando(null);
    if (error) {
      setErro(mensagemDeErro(error));
      return;
    }
    setCodigo("");
    setEtapa("codigo");
  }

  async function confirmarCodigo(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setCarregando("codigo");
    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: codigo,
      type: "email",
    });
    if (error) {
      setErro(mensagemDeErro(error));
      setCarregando(null);
      return;
    }
    router.replace(voltar);
    router.refresh();
  }

  const campo =
    "h-14 w-full rounded-full border-2 border-borda bg-cartao px-5 text-corpo font-medium outline-none transition-colors placeholder:text-texto-suave focus:border-azul";
  const botaoPrincipal =
    "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-azul text-corpo font-bold text-white transition-colors active:bg-azul-escuro disabled:opacity-60";

  if (etapa === "codigo") {
    return (
      <form onSubmit={confirmarCodigo} className="rounded-[28px] bg-cartao p-5">
        <button
          type="button"
          onClick={() => {
            setEtapa("email");
            setErro(null);
          }}
          className="-ml-2 flex h-11 items-center gap-1 rounded-full px-2 text-13 font-bold text-texto-suave"
        >
          <ArrowLeft size={18} strokeWidth={2.2} /> Trocar e-mail
        </button>
        <h2 className="titulo mt-2 text-22">Confira seu e-mail</h2>
        <p className="mt-2 text-13 text-texto-suave">
          Mandamos um código para <strong className="text-texto">{email}</strong>. Digite aqui
          embaixo. Se não chegar, olhe o spam.
        </p>
        <label htmlFor="codigo" className="sr-only">
          Código recebido por e-mail
        </label>
        <input
          id="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6,10}"
          maxLength={10}
          required
          autoFocus
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className={`${campo} mt-4 text-center text-22 font-bold tracking-[0.4em]`}
        />
        {erro && (
          <p role="alert" className="mt-3 text-13 font-bold text-perigo">
            {erro}
          </p>
        )}
        <button type="submit" disabled={carregando !== null || codigo.length < 6} className={`${botaoPrincipal} mt-4`}>
          {carregando === "codigo" ? "Entrando..." : "Entrar"}
        </button>
        <button
          type="button"
          onClick={() => enviarCodigo()}
          disabled={carregando !== null}
          className="mt-2 h-11 w-full rounded-full text-13 font-bold text-texto-suave underline underline-offset-4 disabled:opacity-60"
        >
          {carregando === "email" ? "Enviando..." : "Mandar outro código"}
        </button>
      </form>
    );
  }

  return (
    <div className="rounded-[28px] bg-cartao p-5">
      <button
        type="button"
        onClick={entrarComGoogle}
        disabled={carregando !== null}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-full border-2 border-borda bg-cartao text-corpo font-bold transition-colors hover:border-texto disabled:opacity-60"
      >
        <LogoGoogle />
        {carregando === "google" ? "Abrindo o Google..." : "Entrar com Google"}
      </button>

      <div className="my-4 flex items-center gap-3 text-12 font-bold text-texto-suave" aria-hidden="true">
        <span className="h-0.5 flex-1 rounded-full bg-borda" />
        ou
        <span className="h-0.5 flex-1 rounded-full bg-borda" />
      </div>

      <form onSubmit={enviarCodigo}>
        <label htmlFor="email" className="sr-only">
          E-mail
        </label>
        <div className="relative">
          <Mail
            size={20}
            strokeWidth={2.2}
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-texto-suave"
          />
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={`${campo} pl-13`}
          />
        </div>
        {erro && (
          <p role="alert" className="mt-3 text-13 font-bold text-perigo">
            {erro}
          </p>
        )}
        <button type="submit" disabled={carregando !== null} className={`${botaoPrincipal} mt-3`}>
          {carregando === "email" ? "Enviando código..." : "Entrar com e-mail"}
          {carregando !== "email" && <ArrowRight size={20} strokeWidth={2.2} />}
        </button>
        <p className="mt-3 text-center text-12 text-texto-suave">
          Sem senha: mandamos um código para o seu e-mail.
        </p>
      </form>
    </div>
  );
}
