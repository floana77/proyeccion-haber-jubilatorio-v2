import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Reemplaza a interceptores-mock.ts en el build de producción (angular.json),
 * para que los mocks y sus datos no lleguen al bundle.
 */
export const INTERCEPTORES_MOCK: HttpInterceptorFn[] = [];
