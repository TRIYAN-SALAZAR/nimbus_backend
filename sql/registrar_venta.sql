create or replace function public.registrar_venta(
  p_venta jsonb,
  p_detalles jsonb
)
returns jsonb
language plpgsql
as $$
declare
  v_id_venta integer;
  v_total numeric(10, 2) := 0;
  v_detalle jsonb;
  v_extra jsonb;
  v_precio_variante numeric(10, 2);
  v_precio_extra numeric(10, 2);
  v_id_detalle integer;
  v_cantidad integer;
  v_cantidad_extra integer;
begin
  if jsonb_typeof(p_detalles) <> 'array' or jsonb_array_length(p_detalles) = 0 then
    raise exception 'La venta debe incluir al menos un detalle';
  end if;

  if (p_venta->>'consumo_local') is null
    or (p_venta->>'requiere_nota') is null
    or (p_venta->>'id_metodo_pago') is null then
    raise exception 'La venta no contiene todos los campos obligatorios';
  end if;

  if (p_venta->>'requiere_nota' = 'true')
    and nullif(p_venta->>'folio_nota', '') is null then
    raise exception 'folio_nota es obligatorio cuando requiere_nota es verdadero';
  end if;

  for v_detalle in select value from jsonb_array_elements(p_detalles)
  loop
    v_cantidad := (v_detalle->>'cantidad')::integer;
    if (v_detalle->>'id_variante') is null or v_cantidad is null or v_cantidad <= 0 then
      raise exception 'Los detalles tienen variantes o cantidades inválidas';
    end if;

    select precio_actual
      into v_precio_variante
    from public.variante
    where id_variante = (v_detalle->>'id_variante')::integer
      and activo = true;

    if not found then
      raise exception 'La variante no existe o está inactiva: %', v_detalle->>'id_variante';
    end if;

    v_total := v_total + (v_cantidad * v_precio_variante);

    for v_extra in select value from jsonb_array_elements(coalesce(v_detalle->'extras', '[]'::jsonb))
    loop
      v_cantidad_extra := (v_extra->>'cantidad')::integer;
      if (v_extra->>'id_extra') is null
        or v_cantidad_extra is null
        or v_cantidad_extra <= 0 then
        raise exception 'Los extras tienen identificadores o cantidades inválidas';
      end if;

      select precio_actual
        into v_precio_extra
      from public.extra
      where id_extra = (v_extra->>'id_extra')::integer
        and activo = true;

      if not found then
        raise exception 'El extra no existe o está inactivo: %', v_extra->>'id_extra';
      end if;

      v_total := v_total + (v_cantidad * v_cantidad_extra * v_precio_extra);
    end loop;
  end loop;

  insert into public.venta (
    total,
    consumo_local,
    requiere_nota,
    folio_nota,
    id_metodo_pago,
    id_cliente
  )
  values (
    v_total,
    (p_venta->>'consumo_local')::boolean,
    (p_venta->>'requiere_nota')::boolean,
    nullif(p_venta->>'folio_nota', ''),
    (p_venta->>'id_metodo_pago')::integer,
    (p_venta->>'id_cliente')::integer
  )
  returning id_venta into v_id_venta;

  for v_detalle in select value from jsonb_array_elements(p_detalles)
  loop
    insert into public.detalle_venta (
      id_venta,
      id_variante,
      cantidad,
      precio_cobrado
    )
    select
      v_id_venta,
      (v_detalle->>'id_variante')::integer,
      (v_detalle->>'cantidad')::integer,
      precio_actual
    from public.variante
    where id_variante = (v_detalle->>'id_variante')::integer
    returning id_detalle into v_id_detalle;

    for v_extra in select value from jsonb_array_elements(coalesce(v_detalle->'extras', '[]'::jsonb))
    loop
      insert into public.detalle_venta_extra (
        id_detalle,
        id_extra,
        cantidad,
        precio_cobrado
      )
      select
        v_id_detalle,
        (v_extra->>'id_extra')::integer,
        (v_extra->>'cantidad')::integer,
        precio_actual
      from public.extra
      where id_extra = (v_extra->>'id_extra')::integer;
    end loop;
  end loop;

  return jsonb_build_object(
    'id_venta', v_id_venta,
    'total', v_total,
    'detalle', (
      select coalesce(jsonb_agg(to_jsonb(dv) order by dv.id_detalle), '[]'::jsonb)
      from public.detalle_venta dv
      where dv.id_venta = v_id_venta
    )
  );
end;
$$;
