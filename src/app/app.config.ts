import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PrimeNGConfig } from 'primeng/api';

import { environment } from '../environments/environment';
import { INTERCEPTORES_MOCK } from './mocks/interceptores-mock';
import { PRIMENG_ES } from './shared/primeng-es';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Los mocks solo se registran en dev y QA. En producción usarMocks es false y,
    // además, interceptores-mock.ts se reemplaza por una lista vacía (angular.json).
    provideHttpClient(withInterceptors(environment.usarMocks ? INTERCEPTORES_MOCK : [])),
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
