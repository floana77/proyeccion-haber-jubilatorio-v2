# Guion de la demo

Duración estimada: 10 minutos. Todo corre con datos simulados.

## Antes de empezar

1. `npm test` y `npm run build`: los dos tienen que terminar sin errores.
2. `npm start` y abrir http://localhost:4200.
3. Permitir ventanas emergentes para localhost (el PDF se abre en una pestaña nueva).
4. Tener abiertos el PRD y las imágenes de `docs/diseno/` por si hay preguntas.

## Recorrido

| # | URL | Qué mostrar | Qué decir |
|---|---|---|---|
| 1 | `/?escenario=normal` | Datos del afiliado, chip ACTIVO, Parcial preseleccionada con su fecha mínima. Clic en Proyectar: se abre el PDF | Una pantalla y un clic con los valores por defecto (OBJ-01, OBJ-02). El PDF es de prueba |
| 2 | mismo | Cambiar a Ordinaria: la fecha pasa a su mínima. Abrir el calendario: no deja elegir días anteriores ni escribir | RF-03, RF-04, RF-12 |
| 3 | `/?escenario=fechas-iguales` | Se preselecciona Ordinaria | Regla de desempate (AC-07) |
| 4 | `/?escenario=parcial-hoy` | Aparece "Inicie su trámite de jubilación aquí", sin alerta, y Proyectar habilitado | El botón todavía no navega: falta la URL del trámite |
| 5 | `/?escenario=en-condiciones-hoy` | Alerta "Ud. se encuentra en condiciones de jubilarse", opciones deshabilitadas, Proyectar deshabilitado | RF-11 |
| 6 | `/?escenario=fallecido` | Solo la alerta de fallecido y Proyectar deshabilitado | RF-05 |
| 7 | `/?escenario=proyeccion-lenta` | Proyectar: indicador de carga y el botón no acepta otro clic | AC-17 |
| 8 | `/?escenario=proyeccion-error` | Proyectar: mensaje de error y se puede reintentar | RF-10 |
| 9 | `/?escenario=normal` | Achicar la ventana a ancho de celular (360 px) | Responsive: en celular se ocultan la introducción y las descripciones para que Proyectar se vea sin scroll |
