import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';
import { mockInterceptor } from './mocks/mock.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Los mocks solo se registran en dev y QA; en producción usarMocks es false.
    provideHttpClient(withInterceptors(environment.usarMocks ? [mockInterceptor] : [])),
    // PrimeNG usa animaciones de Angular en varios componentes.
    provideAnimations()
  ]
};
