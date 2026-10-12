import { HttpInterceptorFn } from '@angular/common/http';

import { mockInterceptor } from './mock.interceptor';

/** Interceptores de mocks para dev y QA. En producción se usa interceptores-mock.prod.ts. */
export const INTERCEPTORES_MOCK: HttpInterceptorFn[] = [mockInterceptor];
