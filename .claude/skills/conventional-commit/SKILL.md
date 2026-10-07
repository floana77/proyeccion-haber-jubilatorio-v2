---
name: conventional-commit
description: Redacta mensajes de commit en formato Conventional Commits. Se usa al commitear cambios, cuando el usuario pide "commiteá esto", "hacé un commit", "guardá los cambios" o cualquier pedido que termine en un git commit, aunque no mencione el formato.
---

# Conventional Commit

Todo commit de este proyecto lleva un mensaje de una sola línea con este formato:

    tipo(scope): descripción en imperativo

## Pasos

1. Mirá qué cambió antes de escribir nada. Corré `git status` y `git diff --staged`.
   Si no hay nada en staging, revisá `git diff` y decidí qué archivos
   corresponde agregar (nunca secretos ni archivos ajenos al cambio).
2. Elegí el tipo según lo que muestra el diff, no según lo que dijo el usuario.
3. Elegí el scope: la parte del proyecto que toca el cambio (módulo, carpeta
   o área). Es libre y opcional: si el cambio no pertenece a un área clara,
   omitilo y escribí `tipo: descripción`.
4. Escribí la descripción.
5. Antes de tocar git, mostrale al usuario los archivos que vas a agregar y el
   mensaje propuesto, y esperá su confirmación. No corras `git add` ni
   `git commit` sin ese OK.
6. Con la confirmación, hacé `git add` de esos archivos y el commit con
   `git commit -m "..."`.

## Rama, cuerpo y push

- Se commitea directo en `main`, salvo que el usuario indique otra rama.
- El mensaje es solo la primera línea: sin cuerpo y sin línea `Co-Authored-By`.
- Nunca hacer `git push`; solo commitear.

## Tipos

- `feat`: funcionalidad nueva
- `fix`: arreglo de un error
- `docs`: solo documentación
- `refactor`: cambio de código que no altera el comportamiento
- `test`: agregar o corregir tests
- `chore`: mantenimiento (dependencias, configuración, build, tareas)

## Reglas de la descripción

- En imperativo: "agregar", "rechazar", "aclarar" (no "agregado", "agrega" ni "agregando").
- Empieza en minúscula.
- Sin punto final.
- La línea completa (`tipo(scope): descripción`) tiene como máximo 72 caracteres.
- Dice qué hace el cambio, no qué archivos se tocaron.

## Ejemplos

    feat(auth): agregar validación de email en el registro
    fix(tickets): rechazar tickets con asunto vacío
    docs(prd): aclarar criterio de control de acceso

Evitá mensajes genéricos como "update", "cambios varios" o "fix bug".

Si el diff mezcla cambios de distinto tipo (por ejemplo, un fix y
documentación no relacionada), proponé separarlos en commits distintos.
