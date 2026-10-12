import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PrimeNGConfig } from 'primeng/api';

import { environment } from '../environments/environment';
import { mockInterceptor } from './mocks/mock.interceptor';
import { PRIMENG_ES } from './shared/primeng-es';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Los mocks solo se registran en dev y QA; en producción usarMocks es false.
    provideHttpClient(withInterceptors(environment.usarMocks ? [mockInterceptor] : [])),
    // PrimeNG usa animaciones de Angular en varios componentes.
    provideAnimations(),
    // Calendario y demás componentes de PrimeNG en español.
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [PrimeNGConfig],
      useFactory: (config: PrimeNGConfig) => () => config.setTranslation(PRIMENG_ES)
    }
  ]
};
