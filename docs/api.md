# Contrato de la API (simulada)

Endpoints que consume el frontend. **El backend real todavía no existe**: en dev y QA las respuestas las simula un interceptor de Angular (`src/app/mocks/`). Este contrato es una propuesta para validar con el equipo de backend.

- **URL base:** `apiUrl` del ambiente (`/api` por ahora; la de producción está pendiente en `environment.prod.ts`).
- **Sesión:** el backend identifica al afiliado por la sesión del sitio actual. Las consultas no envían el legajo.
- **Fechas:** texto `AAAA-MM-DD`, sin hora ni zona horaria.

## GET /afiliado

Datos del afiliado con sesión iniciada.

**Respuesta 200**

```json
{
  "legajo": "100234",
  "nombre": "María",
  "apellido": "González",
  "matricula": "45123",
  "estadoMatricula": "activa"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `legajo` | texto | Legajo profesional: número de identificación del afiliado |
| `nombre`, `apellido` | texto | |
| `matricula` | texto | Número de matrícula |
| `estadoMatricula` | `activa` · `cancelado` · `suspendido` · `fallecido` | Solo `fallecido` impide proyectar (RF-05) |

## GET /afiliado/fechas-minimas

Fecha mínima de jubilación de cada beneficio (RF-01). No se llama si el afiliado está fallecido.

**Respuesta 200**

```json
{
  "legajo": "100234",
  "ordinaria": "2031-10-12",
  "parcial": "2027-10-12"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `legajo` | texto | Legajo profesional |
| `ordinaria` | fecha | Fecha mínima de Jubilación Ordinaria |
| `parcial` | fecha | Fecha mínima de Jubilación Parcial |

Si alguna de las dos consultas falla, la pantalla muestra "No pudimos cargar tus datos" con el botón Reintentar.

## POST /proyeccion

Genera el reporte de la proyección (RF-06).

**Solicitud**

```json
{
  "legajo": "100234",
  "tipoBeneficio": "PARCIAL",
  "fechaJubilacion": "2027-10-12"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `legajo` | texto | Legajo profesional, tomado de `GET /afiliado` |
| `tipoBeneficio` | `ORDINARIA` · `PARCIAL` | Beneficio elegido |
| `fechaJubilacion` | fecha | Fecha elegida; nunca anterior a la fecha mínima del beneficio |

**Respuesta 200:** el PDF, con `Content-Type: application/pdf`.

**Errores:** cualquier error, o no tener respuesta en 10 s (`TIEMPO_MAXIMO_PROYECCION_MS`, a validar), muestra "No pudimos generar su proyección. Intente nuevamente." y vuelve a habilitar Proyectar (RF-10).

## Escenarios simulados

Se eligen con `?escenario=...` en la URL (solo dev y QA). La lista está en [avance.md](avance.md#cómo-probar).

## Para validar con backend

- URLs reales de los tres endpoints.
- Nombres de los campos y valores de `estadoMatricula` y `tipoBeneficio`.
- Formato de las fechas.
- Si `POST /proyeccion` necesita el legajo o lo toma de la sesión, como las consultas.
- Códigos de error y si traen un mensaje para mostrar.
