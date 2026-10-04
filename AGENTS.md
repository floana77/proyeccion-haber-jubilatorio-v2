# AGENTS.md — Proyección de Haber Jubilatorio (CPBA)

## Propósito
Frontend nuevo del módulo de proyección de haber jubilatorio de CPBA (cpbaonline.com.ar).
Consume los servicios backend actuales y usa la sesión del sitio actual. Requerimientos: `PRD-001-proyeccion-haber-jubilatorio.md`.

## Stack
- Angular 18.2, TypeScript ~5.5, RxJS ~7.8, zone.js ~0.14. Node ^18.19.1, ^20.11.1 o ^22 (lo exige Angular 18).
- UI: PrimeNG ^17.18, PrimeFlex ^3.3, PrimeIcons ^7, Chart.js ^4.4.
- Build: `@angular-builders/custom-webpack:browser` (webpack, no esbuild); config extra en `config/webpack.custom.js`. Salida en `./build_package`.
- Tests unitarios: Karma ~6.4 + Jasmine ~5.2, en Chrome. Los `.feature` (Gherkin) no se ejecutan por ahora.
- Ambientes: `src/environments/environment.ts` (dev), `environment.qa.ts` y `environment.prod.ts`, que se reemplazan por `fileReplacements`.
- Mockups de desarrollo y QA: servidores mock de Postman (todavía no están creados). Sus URLs van solo en `environment.ts` o `environment.qa.ts`.

## Cómo correr
```bash
npm install                 # instalar dependencias
npm start                   # levantar en dev: http://localhost:4200 (usa environment.ts)
npm start -- -c qa          # levantar con la configuración de QA
npm test                    # tests unitarios (Karma)
npm run build               # build de producción (configuración por defecto)
npm run build -- -c qa      # build de QA
```

## Qué NO hacer
- No usar mockups ni datos de prueba en producción: `environment.prod.ts` nunca apunta a los servidores mock de Postman.
- No crear endpoints ni servicios backend, y no tocar el cálculo del haber ni el contenido o diseño del PDF: solo se consumen los servicios actuales.
- No implementar login ni manejo de sesión propio: se usa la sesión del sitio actual.
