-- Funções chamadas pelo app.
-- midias e temporadas continuam sem escrita direta: o cadastro manual passa por estas funções,
-- que só criam/alteram mídias "manual" do próprio usuário.

create or replace function public.criar_midia_manual(
  p_tipo public.tipo_midia,
  p_titulo text,
  p_ano smallint default null,
  p_plataformas text[] default '{}',
  p_duracao_min integer default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Precisa estar logado' using errcode = 'insufficient_privilege';
  end if;

  insert into public.midias (tipo, fonte, titulo, ano, plataformas, duracao_min, criado_por)
  values (p_tipo, 'manual', trim(p_titulo), p_ano, coalesce(p_plataformas, '{}'), p_duracao_min, auth.uid())
  returning id into v_id;

  return v_id;
end;
$$;

-- Temporadas de uma série manual: p_episodios[1] = episódios da temporada 1, e assim por diante.
create or replace function public.definir_temporadas_manual(p_midia uuid, p_episodios smallint[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.midias
    where id = p_midia and fonte = 'manual' and tipo = 'serie' and criado_por = auth.uid()
  ) then
    raise exception 'Série manual não encontrada' using errcode = 'insufficient_privilege';
  end if;

  delete from public.temporadas where midia_id = p_midia;
  insert into public.temporadas (midia_id, numero, total_episodios)
  select p_midia, n, p_episodios[n]
  from generate_subscripts(p_episodios, 1) as n
  where p_episodios[n] > 0;
end;
$$;

revoke all on function public.criar_midia_manual(public.tipo_midia, text, smallint, text[], integer) from public, anon;
revoke all on function public.definir_temporadas_manual(uuid, smallint[]) from public, anon;
grant execute on function public.criar_midia_manual(public.tipo_midia, text, smallint, text[], integer) to authenticated;
grant execute on function public.definir_temporadas_manual(uuid, smallint[]) to authenticated;
