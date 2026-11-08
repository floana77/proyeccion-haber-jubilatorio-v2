# Guía de cada sección del PRD

Índice: Título · Contexto y Problema · Objetivos · Requerimientos Funcionales · Requerimientos No Funcionales · Criterios de Aceptación · Fuera de Alcance · Riesgos y Dependencias · Secciones opcionales · Ejemplo completo en miniatura

Los ejemplos vienen de un PRD real (proyección de haber jubilatorio en un sitio de afiliados). Sirven como ilustración de nivel de detalle; no los copies.

## Título

`# PRD-001: <nombre> — <una línea de qué es>`

El número se incrementa por documento (PRD-002, PRD-003). La línea después de la raya dice qué es el producto en una oración, para que alguien que ve solo el título entienda de qué se trata. Usá la raya larga "—".

## Contexto y Problema

Respondé: qué dolor se resuelve y para quién.
- **Situación actual con números.** "Recorre 3 pantallas y espera [COMPLETAR] s" vale más que "el proceso es lento". Sin línea base no se puede demostrar mejora.
- **Problema** en una o dos oraciones, sin mezclarlo con la solución.
- **Personas:** quién usa el producto y qué necesita. Si hay perfiles con necesidades distintas (por ejemplo un usuario joven y uno mayor con menor destreza digital), listalos por separado, porque de ahí salen los RNF de accesibilidad.
- **Stakeholder clave:** quién decide o aprueba.
- Las capturas de pantalla y los links van acá como referencias visuales o al final en Anexos.

## Objetivos

"Qué significa ganar", a nivel producto. Un objetivo es un **resultado medible**, no un entregable ni una fecha.

- Forma: `OBJ-01: <verbo> <métrica> de <línea base> a <meta>, medido <cómo> durante <cuándo>`.
- Ejemplo malo: "Liberar la nueva versión antes del 28/02/2027." Es un hito.
- Ejemplo bueno: "Reducir de 3 pantallas a 1 sola la generación de la proyección."
- Las fechas van en una línea de **Hitos** aparte y tienen que ser coherentes entre sí: si el release es el 28/02, el primer mes posterior es marzo.
- Evitá "100% de los casos" para tiempos: usá un percentil (p95). El 100% no es realista y no se puede demostrar.
- Incluí al menos una métrica de producto (adopción, tasa de finalización, reducción de consultas al soporte, satisfacción). Si el usuario no la sabe todavía, dejá `[COMPLETAR]`.

## Requerimientos Funcionales

Formato: `RF-01: El sistema debe <acción en verbo imperativo>.`

- **Un comportamiento por RF.** "Validar, mostrar una alerta y bloquear" son tres RF, o uno solo si son inseparables por definición. Los RF atómicos se testean uno a uno.
- **En positivo:** "debe rechazar fechas menores" en lugar de "no debe permitir".
- **Textos exactos** de mensajes y botones entre comillas, para que QA compare literal.
- **Incluí los caminos de error:** servicio caído, dato faltante, estado no permitido. Sin ellos el desarrollo improvisa.
- **Reglas de negocio definidas o delegadas explícitamente.** Si el PRD dice "en condiciones de jubilarse", tiene que decir qué significa o que lo determina un servicio existente.
- Lo que parece cualidad pero es un comportamiento observable (por ejemplo "el PDF se abre en una pestaña nueva") es un RF, no un RNF.

## Requerimientos No Funcionales

Formato: `RNF-01: <Cualidad>: <número + unidad + percentil + dónde se mide>.`

Todo RNF lleva un número. Tabla de traducción:

| Vago | Con número |
|---|---|
| "rápido" | "< 2 s (p95), desde el clic hasta ver el resultado, en producción" |
| "se ve con claridad en celular" | "sin scroll horizontal ni elementos superpuestos de 360×640 a 1024×768" |
| "textos grandes, alto contraste" | "texto base ≥ 16 px, contraste ≥ 4,5:1 (WCAG 2.1 AA), botones ≥ 44×44 px" |
| "pocos clics" | "1 clic con los valores propuestos por defecto" |
| "funciona en los navegadores comunes" | "en 4 navegadores: Chrome, Edge, Firefox y Safari iOS, última versión estable" (la compatibilidad se cuantifica con una lista cerrada y su cantidad) |

Categorías para repasar: performance, usabilidad, responsive, accesibilidad, compatibilidad, disponibilidad, seguridad y privacidad. No hace falta cubrir todas, pero preguntá cuáles aplican. Cuando el número es una propuesta tuya, agregá "(valor propuesto, a validar)".

## Criterios de Aceptación

Formato: `AC-01 (RF-01): Dado <contexto>, cuando <acción>, entonces <resultado medible>.`

- **Binarios:** pasan o no pasan. Prohibido "correctamente", "adecuado", "válido" sin definir, "los datos". Si el resultado es un archivo, compará contra una referencia concreta: "contiene los mismos campos que el reporte que genera hoy el servicio actual".
- **Cada RF y cada RNF tiene al menos un AC**, y cada AC nombra el RF o RNF que verifica entre paréntesis.
- **Casos límite:** si la regla es "fecha ≥ mínima", hay un AC con la fecha exactamente igual a la mínima y otro con un día antes.
- **Caminos negativos y de error:** un AC por cada RF de bloqueo o de error.
- **Sin duplicados:** dos AC con el mismo contexto y acción son uno solo.
- Numeración corrida (AC-01, AC-02, …), sin sufijos tipo "AC-05b".
- Los AC de RNF llevan el número del RNF: "el p95 del tiempo entre el clic y la apertura del PDF es menor a 2 s".

## Fuera de Alcance

Sección propia, no anidada en otra. Es explícito: lista lo que un lector razonablemente podría creer que entra y no entra.
- Lo que se hará en una segunda etapa (con una línea que diga cuándo o después de qué).
- Otros tipos de usuario, beneficio o canal que no se cubren.
- Cambios a sistemas existentes que no se tocan (backend, login, reportes).
- Restricciones de uso, como "los mockups son solo para desarrollo y QA, nunca en producción".

## Riesgos y Dependencias

- `Riesgo: <qué puede salir mal> → mitigación: <cómo lo cubrís>.`
- `Dependencia: <de qué depende para funcionar>.`

Repasá estos riesgos típicos: un objetivo de performance que depende de un backend que no se modifica (pedí la latencia actual como línea base); fecha de release en riesgo (con plan de contingencia); usuarios con baja destreza digital; integración con login o sesión de otro sistema; compatibilidad de navegadores y visualización de PDF en móviles; falla de servicios en producción (con qué ve el usuario, no con mockups).

Un mockup es una mitigación para **desarrollo y QA**. Nunca planifiques mostrarle datos de prueba a un usuario real en producción.

## Secciones opcionales

Anexos y Referencias se permiten **después** de Riesgos y Dependencias. Ahí van capturas, diseños, glosario, links. Las siete secciones obligatorias se mantienen en su orden.

## Ejemplo completo en miniatura

```markdown
# PRD-001: Proyección de Haber Jubilatorio — Pantalla única para proyectar el haber en un clic

## Contexto y Problema
Hoy el afiliado recorre 3 pantallas y espera [COMPLETAR] s para obtener su proyección...

## Objetivos
- OBJ-01: Reducir de 3 pantallas a 1 sola la generación de la proyección.
- OBJ-02: Lograr p95 < 2 s con 1 clic (valores por defecto), medido en marzo 2027.

## Requerimientos Funcionales
- RF-06: El sistema debe rechazar una fecha menor a la fecha mínima, mostrar "La fecha ingresada no puede ser menor a la fecha mínima de jubilación" y no generar la proyección.

## Requerimientos No Funcionales
- RNF-04: Accesibilidad: contraste ≥ 4,5:1 (WCAG 2.1 AA), texto base ≥ 16 px y botones ≥ 44×44 px (valores propuestos, a validar).

## Criterios de Aceptación
- AC-06 (RF-06): Dado un afiliado con fecha mínima F, cuando ingresa F − 1 día y hace clic en Proyectar, entonces se muestra el mensaje y no se genera ningún PDF.
- AC-14 (RNF-04): Dada la pantalla del módulo, cuando se audita con una herramienta de accesibilidad, entonces todo el texto tiene contraste ≥ 4,5:1 y todos los botones miden ≥ 44×44 px.

## Fuera de Alcance
- Nuevos endpoints backend (segunda etapa, después del lanzamiento).

## Riesgos y Dependencias
- Riesgo: la latencia del backend actual impide p95 < 2 s → mitigación: medir la latencia actual antes del release y escalar si supera el objetivo.
- Dependencia: el login y la sesión del sitio actual.
```
