-- Status das peças: mais situações e os detalhes de cada mudança (venda, empréstimo, conserto...).
-- Saídas (vendido, trocado, doado, descartado) deixam o setup atual e não contam no valor.

alter type public.status_peca add value if not exists 'emprestado' after 'guardado';
alter type public.status_peca add value if not exists 'em_conserto' after 'emprestado';
alter type public.status_peca add value if not exists 'trocado' after 'vendido';
alter type public.status_peca add value if not exists 'doado' after 'trocado';
alter type public.status_peca add value if not exists 'descartado' after 'doado';

alter table public.pecas
  add column if not exists status_desde date,
  add column if not exists valor_saida_centavos integer check (valor_saida_centavos >= 0), -- valor da venda ou abatido na troca
  add column if not exists status_com text check (length(status_com) <= 120),    -- comprador, quem pegou emprestado, assistência...
  add column if not exists status_onde text check (length(status_onde) <= 80),   -- OLX, Mercado Livre, loja da troca...
  add column if not exists status_detalhes text check (length(status_detalhes) <= 500); -- defeito, condições, etc.
