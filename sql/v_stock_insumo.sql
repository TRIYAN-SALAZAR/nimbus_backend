create or replace view public.v_stock_insumo as
with compras as (
  select
    dc.id_insumo,
    sum(dc.cantidad) as total_comprado
  from public.detalle_compra dc
  group by dc.id_insumo
),
consumo_variantes as (
  select
    rv.id_insumo,
    sum(dv.cantidad * rv.cantidad_consumida) as total_consumido
  from public.detalle_venta dv
  join public.venta v on v.id_venta = dv.id_venta
  join public.receta_variante rv on rv.id_variante = dv.id_variante
  where v.consumo_local = false or rv.solo_para_llevar = false
  group by rv.id_insumo
),
consumo_extras as (
  select
    re.id_insumo,
    sum(dve.cantidad * re.cantidad_consumida) as total_consumido
  from public.detalle_venta_extra dve
  join public.detalle_venta dv on dv.id_detalle = dve.id_detalle
  join public.receta_extra re on re.id_extra = dve.id_extra
  group by re.id_insumo
),
consumo_total as (
  select
    id_insumo,
    sum(total_consumido) as total_consumido
  from (
    select id_insumo, total_consumido from consumo_variantes
    union all
    select id_insumo, total_consumido from consumo_extras
  ) consumos
  group by id_insumo
)
select
  i.id_insumo,
  i.nombre,
  i.unidad_medida,
  i.stock_minimo,
  coalesce(c.total_comprado, 0)::numeric as total_comprado,
  coalesce(ct.total_consumido, 0)::numeric as total_consumido,
  (
    coalesce(c.total_comprado, 0) - coalesce(ct.total_consumido, 0)
  )::numeric as stock_actual,
  (
    i.stock_minimo is not null
    and coalesce(c.total_comprado, 0) - coalesce(ct.total_consumido, 0) <= i.stock_minimo
  ) as necesita_reabastecimiento
from public.insumo i
left join compras c on c.id_insumo = i.id_insumo
left join consumo_total ct on ct.id_insumo = i.id_insumo
where i.activo = true;
