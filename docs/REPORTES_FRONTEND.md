# Reportes de ventas y compras

## Resumen financiero

```http
GET /api/reportes/resumen
GET /api/reportes/resumen?fecha_desde=2026-11-01&fecha_hasta=2026-11-30
```

Respuesta:

```json
{
  "ok": true,
  "data": {
    "ventas": {
      "cantidad": 25,
      "total": 3200,
      "ticket_promedio": 128,
      "por_metodo_pago": {
        "Efectivo": 1800,
        "Tarjeta": 1400
      },
      "por_producto": {
        "Americano Grande": 900,
        "Latte Mediano": 1200
      }
    },
    "compras": {
      "cantidad": 8,
      "total": 2400,
      "por_proveedor": {
        "Café Sierra Madre": 1800
      },
      "por_insumo": {
        "Café en grano": 1800
      }
    },
    "utilidad_bruta": 800
  }
}
```

`utilidad_bruta` es una diferencia simple entre el total registrado de ventas y el total registrado de compras en el período. No incluye costos indirectos ni costo exacto de consumo de insumos por venta.

## Reporte de ventas

```http
GET /api/reportes/ventas
GET /api/reportes/ventas?fecha_desde=2026-11-01&fecha_hasta=2026-11-30
```

Devuelve:

- Número de ventas.
- Total vendido.
- Ticket promedio.
- Total agrupado por método de pago.
- Total agrupado por producto y tamaño.

## Reporte de compras

```http
GET /api/reportes/compras
GET /api/reportes/compras?fecha_desde=2026-11-01&fecha_hasta=2026-11-30
```

Devuelve:

- Número de compras.
- Total comprado.
- Total agrupado por proveedor.
- Total agrupado por insumo.

Las fechas deben enviarse en formato `YYYY-MM-DD`. También se acepta una fecha ISO completa si el frontend ya maneja zonas horarias.

## Uso en JavaScript

```javascript
const API_URL = 'http://localhost:3000';

async function getReporte(path) {
  const response = await fetch(`${API_URL}${path}`);
  const body = await response.json();

  if (!response.ok || !body.ok) {
    throw new Error(body.error || 'Error al obtener el reporte');
  }

  return body.data;
}

const resumen = await getReporte(
  '/api/reportes/resumen?fecha_desde=2026-11-01&fecha_hasta=2026-11-30',
);

console.log('Ventas:', resumen.ventas.total);
console.log('Compras:', resumen.compras.total);
console.log('Diferencia:', resumen.utilidad_bruta);
```

## Ejemplo con React

```jsx
import { useEffect, useState } from 'react';

export function ReporteDashboard({ fechaDesde, fechaHasta }) {
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
    });

    fetch(`http://localhost:3000/api/reportes/resumen?${params}`)
      .then((response) => response.json())
      .then((body) => {
        if (!body.ok) throw new Error(body.error);
        setReporte(body.data);
      })
      .catch((cause) => setError(cause.message));
  }, [fechaDesde, fechaHasta]);

  if (error) return <p>{error}</p>;
  if (!reporte) return <p>Cargando...</p>;

  return (
    <section>
      <article>
        <strong>Ventas</strong>
        <p>${reporte.ventas.total}</p>
      </article>
      <article>
        <strong>Compras</strong>
        <p>${reporte.compras.total}</p>
      </article>
      <article>
        <strong>Diferencia</strong>
        <p>${reporte.utilidad_bruta}</p>
      </article>
    </section>
  );
}
```
