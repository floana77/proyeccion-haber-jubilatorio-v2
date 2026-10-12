# Proyección de haber jubilatorio (v2)

Módulo web de CPBA para que el afiliado genere la proyección de su haber jubilatorio en una sola pantalla: elige el beneficio y la fecha, y obtiene el PDF con un clic.

> **Estado:** las funcionalidades del PRD están hechas. El backend todavía no existe y se simula en dev y QA.
> Ver [docs/avance.md](docs/avance.md).

## Documentación

| Documento | Qué tiene |
|---|---|
| [PRD-001](docs/PRD-001-proyeccion-haber-jubilatorio.md) | Requerimientos, criterios de aceptación y objetivos |
| [proyeccion-haber-jubilatorio.feature](docs/proyeccion-haber-jubilatorio.feature) | Escenarios en Gherkin |
| [api.md](docs/api.md) | Contrato de la API simulada |
| [avance.md](docs/avance.md) | Estado, decisiones y pendientes |
| [docs/diseno/](docs/diseno/) | Diseño de referencia (Opción A) |

## Tecnología

Angular 18.2 · PrimeNG 17 · PrimeFlex · custom-webpack

## Cómo levantarlo

Requiere Node 18.19, 20.11 o 22 (lo exige Angular 18).

```bash
npm install
npm start          # http://localhost:4200
```

### Escenarios simulados

En dev y QA se elige el caso agregando `?escenario=...` a la URL. Ejemplo:
`http://localhost:4200/?escenario=en-condiciones-hoy`

La lista completa está en [avance.md](docs/avance.md#cómo-probar).

## Ambientes

| Ambiente | Comando | Backend |
|---|---|---|
| dev | `npm start` | Simulado |
| qa | `npm run build -- -c qa` | Simulado |
| prod | `npm run build` | Real (`apiUrl` pendiente en `environment.prod.ts`) |

El build se genera en `build_package/`. En prod los datos simulados no se incluyen.

## Tests

```bash
npm test
```

En WSL no hay Chrome instalado. Hay que indicar uno:

```bash
CHROME_BIN=/ruta/a/chrome npx ng test --watch=false --browsers=ChromeHeadless
```

## Estructura

```
src/app/
  afiliado/     datos del afiliado, fechas mínimas y reglas de alertas
  proyeccion/   pantalla, selección de beneficio, servicio y visor del PDF
  mocks/        backend simulado (solo dev y QA)
  shared/       fechas y traducción de PrimeNG
```
