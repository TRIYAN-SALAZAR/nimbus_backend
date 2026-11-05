create or replace function public.registrar_compra(
  p_compra jsonb,
  p_detalles jsonb
)
returns jsonb
language plpgsql
as $$
declare
  v_id_compra integer;
  v_total numeric(10, 2);
begin
  if jsonb_typeof(p_detalles) <> 'array' or jsonb_array_length(p_detalles) = 0 then
    raise exception 'La compra debe incluir al menos un detalle';
  end if;

  select coalesce(sum(d.cantidad * coalesce(d.precio, 0)), 0)
    into v_total
  from jsonb_to_recordset(p_detalles) as d(
    id_insumo integer,
    cantidad numeric(10, 2),
    precio numeric(10, 2)
  );

  if exists (
    select 1
    from jsonb_to_recordset(p_detalles) as d(
      id_insumo integer,
      cantidad numeric(10, 2),
      precio numeric(10, 2)
    )
    where d.id_insumo is null or d.cantidad is null or d.cantidad <= 0
      or (d.precio is not null and d.precio < 0)
  ) then
    raise exception 'Los detalles tienen cantidades o precios inválidos';
  end if;

  insert into public.compra (fecha, total, notas, id_origen, id_proveedor)
  values (
    coalesce((p_compra->>'fecha')::date, current_date),
    v_total,
    p_compra->>'notas',
    (p_compra->>'id_origen')::integer,
    (p_compra->>'id_proveedor')::integer
  )
  returning id_compra into v_id_compra;

  insert into public.detalle_compra (id_compra, id_insumo, cantidad, precio)
  select v_id_compra, d.id_insumo, d.cantidad, d.precio
  from jsonb_to_recordset(p_detalles) as d(
    id_insumo integer,
    cantidad numeric(10, 2),
    precio numeric(10, 2)
  );

  return jsonb_build_object(
    'id_compra', v_id_compra,
    'fecha', (select fecha from public.compra where id_compra = v_id_compra),
    'total', v_total,
    'notas', (select notas from public.compra where id_compra = v_id_compra),
    'id_origen', (select id_origen from public.compra where id_compra = v_id_compra),
    'id_proveedor', (select id_proveedor from public.compra where id_compra = v_id_compra),
    'detalles', (
      select coalesce(jsonb_agg(to_jsonb(dc) order by dc.id_insumo), '[]'::jsonb)
      from public.detalle_compra dc
      where dc.id_compra = v_id_compra
    )
  );
end;
$$;
