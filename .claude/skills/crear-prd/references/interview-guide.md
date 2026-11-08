# Guía de entrevista para construir un PRD

Índice: Cómo preguntar · Bloques y preguntas · Cómo tratar las respuestas · Ejemplo de bloque

## Cómo preguntar

- **Antes de preguntar, extraé** todo lo posible de lo que ya existe (documentos, capturas, conversación). Preguntar lo que ya está dicho cansa.
- **Todo en texto**, en un solo mensaje por ronda, numerado. El usuario contesta de corrido con la letra o con sus palabras.
- **Ofrecé opciones a/b/c** cuando haya respuestas probables. Poné primero la que recomendás y decí por qué en una frase.
- **Máximo 6 a 8 preguntas por ronda.** Priorizá las que bloquean: reglas de negocio, cifras, plazos.
- **Cerrá cada ronda con una vía de escape:** "si no lo sabés, lo dejo como `[COMPLETAR]`".
- Pedí explícitamente lo que suele olvidarse: línea base, métrica de producto, qué pasa cuando falla algo y qué queda afuera.

## Bloques y preguntas

Recorré los bloques en orden y saltá lo que ya esté resuelto.

**1. Contexto y problema**
- ¿Qué producto o funcionalidad es y para quién? (una línea para el título)
- ¿Cómo se hace hoy y cuánto cuesta en pantallas, tiempo, errores o consultas?
- ¿Qué perfiles de usuario hay y qué necesita cada uno? ¿Hay alguno con limitaciones (edad, dispositivo, conectividad)?
- ¿Quién es el stakeholder que aprueba?

**2. Objetivos**
- ¿Cómo sabemos que ganamos? ¿Qué número tiene que cambiar?
- ¿Cuál es la línea base actual de cada métrica y qué meta se quiere?
- ¿Cuáles son las fechas: release, período de medición, cierre?

**3. Alcance**
- ¿Qué entra en esta versión?
- ¿Qué se deja explícitamente afuera o para una segunda etapa? ¿Qué podría asumir alguien que entra pero no entra?
- ¿Se toca algún sistema existente (backend, login) o se reutiliza tal cual?

**4. Funcionalidad**
- Contame el flujo principal paso a paso, desde que el usuario entra hasta el resultado.
- ¿Qué reglas de negocio gobiernan cada decisión (edades, plazos, estados)? ¿Quién las calcula?
- ¿Qué bloqueos o validaciones hay y qué texto exacto se muestra en cada caso?
- ¿Qué debe ver el usuario si falla un servicio o falta un dato?
- ¿Hay valores por defecto? ¿Cuáles y con qué criterio?

**5. Cualidades (RNF)**
- Performance: ¿qué tiempo máximo y en qué percentil?
- Usabilidad: ¿cuántos clics o pasos como máximo?
- Dispositivos y resoluciones: ¿celular, tablet, escritorio?
- Accesibilidad: ¿algún estándar (WCAG AA) o necesidad especial?
- Navegadores y versiones soportadas.
- Disponibilidad, seguridad y privacidad si aplican (datos personales, sesión).

**6. Riesgos y dependencias**
- ¿De qué sistemas o equipos depende esto para funcionar?
- ¿Qué es lo que más podría fallar y cómo se cubre?
- ¿Qué pasa si no se llega a la fecha?

## Cómo tratar las respuestas

- **Respuesta concreta:** incorporala tal cual y verificá que no contradiga lo anterior (fechas, verbos, cifras).
- **"No sé":** dejá `[COMPLETAR: qué falta]`, anotá qué bloquea y, si ayuda, sugerí un valor de referencia.
- **Respuesta vaga** ("que sea rápido"): repreguntá por el número o proponé uno marcado como "(valor propuesto, a validar)".
- **Contradicción con algo previo:** señalala en la ronda siguiente con las dos citas y pedí que elija.
- **Cambia el alcance:** actualizá Fuera de Alcance en el mismo momento; el fuera de alcance se desactualiza fácil.

## Ejemplo de bloque

> Para cerrar el PRD necesito estas precisiones (contestá con la letra o con tus palabras; si no lo sabés, lo dejo como `[COMPLETAR]`):
>
> **1. Edades mínimas por beneficio**
> - a) Parcial 60 / Ordinaria 65
> - b) Ambas 60 y lo que cambia son otros requisitos (¿cuáles?)
>
> **2. ¿Qué define "en condiciones de jubilarse"?**
> - a) Solo la edad
> - b) Edad + aportes completos
> - c) Lo determina el backend actual
>
> **3. Timeout del servicio antes de mostrar el error.** Referencia habitual: 10 s.
