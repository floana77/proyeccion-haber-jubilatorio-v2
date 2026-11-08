---
name: crear-prd
description: Construye o audita PRDs (documentos de requerimientos de producto) para que se puedan construir y comprobar, con requerimientos funcionales y no funcionales con ID, criterios de aceptación binarios Dado/Cuando/Entonces, RNF con número, objetivos medibles, fuera de alcance explícito y riesgos con mitigación. Usala siempre que el usuario mencione PRD, requerimientos, RF/RNF, criterios de aceptación, alcance o "documento de requerimientos", o pida escribir, revisar, mejorar, validar o auditar un PRD, aunque no diga "PRD" (por ejemplo "armame los requerimientos de esta funcionalidad" o "revisá si este documento está bien"). Lo primero que hace es preguntar si se quiere construir uno de cero o auditar uno existente.
compatibility: Necesita python3 para el validador scripts/lint_prd.py; curl para bajar PRDs desde una URL.
---

# Crear y auditar PRDs

Un PRD sirve si otra persona puede construir a partir de él y comprobar que quedó bien. Todo lo de esta skill apunta a eso: que cada requerimiento se pueda verificar, que cada cualidad tenga un número y que nada importante quede implícito.

Escribí en español rioplatense (voseo), salvo que el usuario use otro idioma.

## Paso 0: preguntar el modo

Al empezar, preguntá en texto (no con un widget de opciones) qué quiere hacer, salvo que el usuario ya lo haya dicho sin ambigüedad en su mensaje:

> ¿Qué querés hacer?
> a) Construir un PRD de cero
> b) Auditar un PRD existente (y, si querés, después lo reescribo)

Esperá la respuesta antes de seguir. El usuario pidió explícitamente que esta pregunta se haga siempre, porque el punto de partida cambia todo el trabajo.

## Reglas de trabajo (valen en los dos modos)

- **Preguntá antes de asumir.** Las reglas de negocio, las cifras, los plazos y los textos de la interfaz los conoce el usuario, no vos. Juntá las dudas en un solo bloque numerado, con opciones a/b/c cuando haya respuestas probables, y pedí que conteste todo en un mensaje. Por qué en texto: el usuario prefiere contestar de corrido, y los widgets interactivos ya le resultaron molestos.
- **No inventes lo que no sabés.** Dejá `[COMPLETAR: qué falta]` en el lugar exacto. Un hueco visible es mejor que un dato falso que alguien construya.
- **Marcá lo que proponés vos.** Todo valor que no te dio el usuario (por ejemplo contraste ≥ 4,5:1 o un texto de error) lleva "(valor propuesto, a validar)" o se menciona en el resumen final como propuesta tuya.
- **Si dicen "no sé"**, mantené el `[COMPLETAR]`, decí qué bloquea ese dato y, si ayuda, ofrecé un valor de referencia para que decidan.
- **Subir a un repo o publicar es una acción externa.** Confirmá el destino (¿reemplazar el archivo existente o crear uno nuevo?) antes de hacerlo. Si falla por credenciales, explicá qué pasó y dale el comando para correr con `!`.

## Modo A: construir de cero

1. **Reuní lo que ya existe:** documentos, capturas, URLs, lo hablado en la conversación. Extraé de ahí todo lo posible antes de preguntar. Si te pasan una URL, bajala con `curl -sL`.
2. **Entrevistá por bloques** siguiendo `references/interview-guide.md`: contexto y personas, objetivos con línea base, alcance y fuera de alcance, funcionalidad, cualidades, riesgos. Preguntá solo lo que falta.
3. **Escribí el borrador** con `assets/prd-template.md` y las reglas de `references/template.md`. Guardalo como archivo `.md`, por ejemplo `PRD-001-<nombre>.md`.
4. **Validá** con el script (ver abajo), corregí lo que marque y volvé a correrlo hasta que no haya errores.
5. **Entregá** con el cierre descripto más abajo.

## Modo B: auditar un PRD existente

1. **Obtené el PRD** (archivo o URL) y leelo entero.
2. **Corré el validador** para la parte mecánica y complementá con el criterio de `references/audit-checklist.md`, que cubre lo que un script no ve: contradicciones, objetivos que son entregables, mockups como plan de producción, metas que dependen de sistemas fuera de alcance.
3. **Presentá el informe** con la estructura de `references/audit-checklist.md`: veredicto, tabla de las 5 reglas, tabla de formato contra el template, inconsistencias de contenido y prioridades de arreglo (alta, media, baja).
4. **Ofrecé reescribirlo.** Si acepta, primero preguntá en texto las decisiones que solo el usuario puede tomar (las que hayas visto como huecos o contradicciones) y recién después reescribí siguiendo los pasos 3 a 5 del modo A.

## Las 5 reglas para saber si el PRD está bien

1. ¿Cada RF tiene un AC que lo verifique?
2. ¿Cada RNF tiene un número?
3. ¿Los AC son binarios (pasa o no pasa), sin "correctamente" ni "adecuado"?
4. ¿Hay IDs (RF-01, AC-01) para poder trazar?
5. ¿El fuera de alcance es explícito?

Si las cinco dan que sí, el PRD se puede construir y comprobar.

## Formato

El PRD lleva exactamente estas secciones, en este orden: Contexto y Problema, Objetivos, Requerimientos Funcionales, Requerimientos No Funcionales, Criterios de Aceptación, Fuera de Alcance, Riesgos y Dependencias. Se permiten secciones opcionales (Anexos, Referencias) solo **al final**. Los detalles de cada sección, con ejemplos, están en `references/template.md`. Leelo antes de redactar.

## Validador

```bash
python3 scripts/lint_prd.py <archivo.md>          # errores y advertencias
python3 scripts/lint_prd.py <archivo.md> --strict # las advertencias también fallan
```

Revisa: título `# PRD-NNN: nombre — resumen`, secciones y su orden, que cada RF y cada RNF tengan un AC que lo referencie, que cada AC apunte a un RF o RNF existente y tenga Dado/Cuando/Entonces, que cada RNF tenga un número, tiempos sin percentil, "100%", palabras vagas, IDs duplicados, fuera de alcance vacío, riesgos sin mitigación. También lista los `[COMPLETAR]` pendientes y las fechas que aparecen, para que las compares a mano.

El script solo detecta lo mecánico. Que un AC sea de verdad medible o que los objetivos no se contradigan lo juzgás vos.

## Cierre de cada trabajo

Terminá con un resumen corto que contenga:
- Qué cambió o qué se generó y dónde quedó el archivo.
- **Supuestos y valores propuestos por vos**, para que el usuario los valide.
- **Pendientes `[COMPLETAR]`**, ordenados por lo que bloquean (primero lo que frena a desarrollo o QA), con una línea por cada uno.
- Una oferta de siguiente paso (subirlo al repo, ajustar algo), sin ejecutarlo.
