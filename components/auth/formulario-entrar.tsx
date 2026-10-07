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

export function FormularioEntrar() {
  const router = useRouter();
  const params = useSearchParams();
  const voltar = caminhoSeguro(params.get("voltar"));

  const [etapa, setEtapa] = useState<Etapa>("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState<"email" | "codigo" | null>(null);
  const [erro, setErro] = useState<string | null>(
    params.get("erro") === "acesso" ? "Este e-mail não tem acesso ao Zerei. Peça ao administrador para liberar." : null,
  );

  async function enviarCodigo(evento?: React.FormEvent) {
    evento?.preventDefault();
    setErro(null);
    setCarregando("email");
    const supabase = criarClienteNavegador();

    // Acesso restrito: só manda código para e-mails liberados
    const { data: liberado, error: erroAcesso } = await supabase.rpc("email_tem_acesso", { p_email: email.trim() });
    if (erroAcesso || liberado !== true) {
      setCarregando(null);
      setErro(
        erroAcesso
          ? "Não deu para conferir o acesso agora. Tente de novo."
          : "Este e-mail não tem acesso ao Zerei. Peça ao administrador para liberar.",
      );
      return;
    }

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
    "h-14 w-full rounded-full border-2 border-borda bg-cartao px-5 text-corpo font-medium outline-none transition-colors placeholder:text-texto-suave focus:border-marca";
  const botaoPrincipal =
    "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-marca text-corpo font-bold text-white transition-colors active:bg-marca-escuro disabled:opacity-60";

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
