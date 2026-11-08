# Auditoría de un PRD

Índice: Cómo auditar · Las 5 reglas y cómo evaluarlas · Catálogo de defectos · Formato del informe

## Cómo auditar

1. Leé el PRD entero antes de opinar.
2. Corré `scripts/lint_prd.py` sobre el archivo (si está en una URL, bajalo con `curl -sL <url> > prd.md`). Te da la parte mecánica: secciones, trazabilidad, números en RNF, palabras vagas.
3. Recorré el catálogo de abajo para lo que el script no ve.
4. Armá el informe. Sé concreto: citá el ID o la frase problemática y proponé el arreglo. Reconocé también lo que está bien, porque el usuario necesita saber qué conservar.

## Las 5 reglas y cómo evaluarlas

| Regla | Cómo se evalúa | Estados |
|---|---|---|
| Cada RF tiene un AC que lo verifique | Por cada RF, buscá un AC que lo nombre. Si hay casos de prueba sin referencia, cubren por contenido pero no son trazables: ⚠️. | ✅ todos / ⚠️ cubiertos sin trazar / ❌ faltan |
| Cada RNF tiene un número | Buscá cifra + unidad. "Con claridad", "textos grandes" no son números. Además verificá que cada RNF tenga su AC. | ✅ / ❌ cuántos de cuántos |
| AC binarios | Leé cada resultado esperado: ¿dos personas distintas coincidirían en si pasó o no? Marcá "correctamente", "válidos", "contiene los datos". | ✅ / ⚠️ con excepciones |
| IDs para trazar | RF, RNF, AC y objetivos con ID, y cada AC con su referencia. | ✅ / ⚠️ parcial |
| Fuera de alcance explícito | Sección propia, con lo que el lector podría asumir incluido. | ✅ / ⚠️ parcial / ❌ |

## Catálogo de defectos

Cada fila: qué mirar, por qué importa y cómo arreglarlo.

| Defecto | Por qué importa | Arreglo |
|---|---|---|
| **Objetivo que es un entregable o una fecha** ("liberar antes del 28/02") | No dice qué significa ganar. | Objetivo = resultado medible con línea base y meta; las fechas van en Hitos. |
| **"100%" en tiempos o sin percentil** | Es inalcanzable y no demostrable; y RNF y objetivo se contradicen si uno usa percentil y el otro no. | p95 o p99, con desde dónde y hasta dónde se mide. |
| **Verbo que contradice el problema** ("mantener 1 pantalla" cuando el problema es "exceso de pantallas") | Confunde qué hay que lograr. | Alinear: "reducir de 3 a 1". |
| **Fechas incompatibles** (medición "primer mes post-lanzamiento" en un mes que no es el siguiente al release) | Nadie sabe cuándo medir. | Enumerar todas las fechas y ordenarlas: release, medición, cierre. |
| **RNF sin número** | No se puede verificar. | Tabla de traducción en `references/template.md`. |
| **RNF que es un RF** ("el PDF se abre en pestaña nueva", "valores por defecto") | Se testea distinto y se pierde en la lista de cualidades. | Mover a RF. |
| **AC vagos** ("proyecta correctamente", "el archivo contiene los datos") | Cada tester decide distinto. | Referenciar un valor concreto o una fuente de comparación medible. |
| **Falta el caso límite** (la regla es ≥ y solo se prueba <) | Los errores de uno más o uno menos son los más comunes. | AC con el valor exacto en el borde y otro justo afuera. |
| **Falta el camino de error** (¿qué ve el usuario si el servicio cae?) | El desarrollo improvisa. | RF de error con mensaje y acción (reintentar) y su AC. |
| **Mockups como plan de producción** | Mostrar datos de prueba a un usuario real puede llevarlo a decisiones equivocadas. | Mockups solo para dev y QA (también en Fuera de Alcance); en producción, error visible. |
| **Regla de negocio nombrada pero no definida** ("en condiciones de jubilarse") | Cada uno la implementa a su manera. | Definirla o decir que la determina un servicio existente. |
| **RF compuestos** (validar + alertar + bloquear + ofrecer botón) | No se puede testear ni estimar por partes. | Un comportamiento por RF. |
| **Meta que depende de un sistema que no se toca** (p95 con backend legacy) | El objetivo puede ser inalcanzable sin que nadie lo sepa. | Línea base de latencia, riesgo explícito y plan de escalamiento. |
| **Sin línea base** ("es lento", "muchas pantallas") | No se puede demostrar mejora. | Medir hoy: cantidad de pantallas, segundos, tasa de error. |
| **"1 clic" sin condición** | Si el usuario elige otra fecha, ya no es 1 clic. | "1 clic con los valores propuestos por defecto". |
| **Fuera de alcance escondido** dentro de otra sección o incompleto | Genera expectativas falsas. | Sección propia con lo que el lector asumiría incluido. |
| **Casos de prueba duplicados** (dos con el mismo dato de entrada y acción) | Ruido; el segundo suele ser otro RF sin verificar. | Diferenciar o fusionar. |
| **Casos numerados sin RF** ("caso 4") | No hay trazabilidad. | `AC-04 (RF-06)`. |
| **Estados o tipos no cubiertos** (solo "fallecido" cuando hay más estados) | ¿Qué pasa con los demás? | Preguntar y dejar explícito, incluso en Fuera de Alcance. |
| **Riesgos pobres** (uno solo o sin mitigación) | El equipo no ve lo que puede fallar. | Repasar la lista de riesgos típicos en `references/template.md`. |

## Formato del informe

Usá estas secciones, en este orden, con tablas para lo comparable.

```
## Veredicto
<Una o dos frases: ¿cumple o no, y qué tan cerca está?>

## 1. Reglas mentales
<Tabla: regla | estado (✅ ⚠️ ❌) | detalle con IDs>

## 2. Formato vs. template
<Tabla: sección del template | cómo está en el PRD>

## 3. Inconsistencias de contenido
<Lista numerada de las más importantes, cada una con la cita o el ID>

## 4. Qué arreglar primero
<Prioridad alta / media / baja, con ejemplos de cómo quedaría el arreglo>
```

Cerrá ofreciendo reescribir el PRD y avisando que las decisiones que solo el usuario puede tomar (cifras, reglas de negocio) las vas a preguntar en texto o dejar como `[COMPLETAR]`.
