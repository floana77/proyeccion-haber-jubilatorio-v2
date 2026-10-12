# Avance del desarrollo — Proyección de haber jubilatorio (v2)

Fecha de corte: 12/10/2026 · Último commit: `4bd1562`

## Resumen

Están hechas las tres funcionalidades core del [PRD](PRD-001-proyeccion-haber-jubilatorio.md). Llevamos **9 de 10 pasos** del plan. Falta el paso 4.1: los estilos de la Opción A, el responsive y la accesibilidad. Hay 81 tests unitarios y todos pasan, en UTC y en hora de Buenos Aires.

## Plan y estado

| Paso | Qué es | Estado | Commit |
|---|---|---|---|
| **Base** | | | |
| 0.1 | Proyecto Angular 18.2 base con PrimeNG y el build adaptado | ✅ | `5cb808a` |
| 0.2 | Ambientes dev, qa y prod, y simulación del backend para dev y QA | ✅ | `c56b3df` |
| **Funcionalidad 1: datos del afiliado, alertas y trámite** (RF-01, 05, 11, 02) | | | |
| 1.1 | Servicio y datos simulados del afiliado y sus fechas mínimas, con el legajo | ✅ | `f48bfed` |
| 1.2 | Reglas de alertas y del botón de trámite, con sus tests | ✅ | `d8b5642` |
| 1.3 | Pantalla con la tarjeta, las fechas mínimas, las alertas y el botón de trámite | ✅ | `1a5970f` |
| **Funcionalidad 2: beneficio y fecha** (RF-07, 03, 04, 12) | | | |
| 2.1 | Beneficio sugerido, desempate y cambio de beneficio (AC-06 a 09) | ✅ | `3d0d996` |
| 2.2 | Selector de beneficio y calendario sin días anteriores ni escritura a mano (AC-10 a 12) | ✅ | `97a1c4e` |
| **Funcionalidad 3: generar el PDF** (RF-06, 08, 09, 10) | | | |
| 3.1 | Servicio de proyección con límite de 10 s, y PDF, error y demora simulados | ✅ | `0abdd76` |
| 3.2 | Botón Proyectar: pestaña nueva, carga, sin doble clic, error y reintento (AC-15 a 19) | ✅ | `4bd1562` |
| **Cierre** | | | |
| 4.1 | Estilos de la Opción A, responsive de 360 a 1920 px y accesibilidad (texto de 18 px, botones de 44 px, contraste) | ⏳ Falta | — |

Commits fuera del plan:

- `ef62413`: aclaración en el PRD sobre el afiliado fallecido.
- `a42f5ca`: carpeta `docs/`.
- `edfb079`: imágenes de diseño.
- `1b57489` y `d07f324`: arreglos para que los datos simulados no lleguen a producción.
- `6680fe4`: analytics de Angular CLI desactivado.

## Decisiones tomadas durante el desarrollo

- **Legajo:** es el número de identificación del afiliado. Está en todos los datos simulados y se envía al pedir la proyección.
- **Afiliado fallecido:** no se consultan sus fechas mínimas. Solo ve la alerta de fallecido y Proyectar deshabilitado. Esto se actualizó en el PRD (RF-01, RF-05 y AC-13) y en el `.feature`.
- **Diseño frente al PRD:**
  - Los textos de alertas y botones son los del PRD: "Proyectar", "Ud. se encuentra en condiciones de jubilarse" e "Inicie su trámite de jubilación aquí".
  - No se muestra la edad actual ni la fecha de nacimiento. Se quitó el recuadro "Edad actual / Fecha mínima" del diseño.
  - El chip muestra solo el estado de la matrícula: ACTIVO, CANCELADO, SUSPENDIDO o FALLECIDO.
  - No hay link "Hablá con un asesor".
  - Cada opción de beneficio muestra su propia fecha mínima.
- **En condiciones de jubilarse:** las opciones de beneficio y el calendario se ven, pero deshabilitados.
- **Error al cargar los datos:** se muestra "No pudimos cargar tus datos" con un botón Reintentar.
- **Pestaña del PDF:** se abre en el mismo clic, con el texto "Generando su proyección…", y el PDF se carga cuando llega. Se hace así para que Safari en iPhone no la bloquee. Si hay un error, la pestaña se cierra.
- **Producción sin datos simulados:** el build de prod cambia `src/app/mocks/interceptores-mock.ts` por una lista vacía (`fileReplacements` en `angular.json`). Para verificarlo, se busca `en-condiciones-hoy` en `build_package/main.*.js`: tiene que haber 0 resultados.

## Pendientes fuera del plan

| Pendiente | Qué falta |
|---|---|
| URL del backend de producción | Completar `apiUrl` en `src/environments/environment.prod.ts` (marcado `[COMPLETAR]`) |
| Destino del botón "Inicie su trámite de jubilación aquí" | URL del trámite; por ahora el botón no navega |
| AC-16 | Probar en dispositivos reales: Chrome en Android y Safari en iPhone |
| AC-15 completo | Comparar el PDF con el del sitio actual, con el backend real |
| Tiempo máximo de 10 s (RF-10) | El PRD lo marca "a validar". Está en `TIEMPO_MAXIMO_PROYECCION_MS` |
| Tamaño de producción | La carga inicial es de 991 kB y el aviso salta en 1 MB. Se revisa en el paso 4.1 |

## Cómo probar

```bash
npm start   # http://localhost:4200
```

Para elegir el escenario simulado se agrega `?escenario=...` a la URL:

| Escenario | Qué muestra |
|---|---|
| `normal` | Afiliado activo, con Parcial preseleccionada (+1 año) y Ordinaria a +5 años |
| `fallecido` | Solo la alerta de fallecido y Proyectar deshabilitado |
| `cancelado`, `suspendido` | Chip del estado; se puede proyectar |
| `en-condiciones-hoy` | Las dos fechas son hoy: alerta, trámite y Proyectar deshabilitado |
| `en-condiciones-vencidas` | Las dos fechas ya pasaron: igual que el anterior |
| `parcial-hoy` | Parcial hoy y Ordinaria mañana: botón de trámite, sin alerta |
| `ambas-manana` | Las dos fechas son mañana: sin alerta ni trámite |
| `fechas-iguales` | Fechas iguales: se preselecciona Ordinaria |
| `parcial-vencida` | Parcial ya pasada: igual se preselecciona Parcial |
| `proyeccion-lenta` | El PDF tarda 3 s: se ve la carga |
| `proyeccion-error` | El servicio de proyección da error |
| `proyeccion-sin-respuesta` | El servicio no responde: el error aparece a los 10 s |

### Tests en WSL

WSL no tiene Chrome instalado. Hay que indicar un Chrome con `CHROME_BIN`:

```bash
CHROME_BIN=/ruta/a/chrome npx ng test --watch=false --browsers=ChromeHeadless
```

## Próximo paso

**Paso 4.1:** estilos de la Opción A (colores, tipografías y tarjetas como en `docs/diseno/`), responsive de 360 a 1920 px y accesibilidad (texto de 18 px, botones de 44 px y contraste). Antes de empezar, se arma el plan y se aprueba.
