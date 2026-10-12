import { MOCK_RUTAS_AFILIADO } from './afiliado.mock';
import { MockRuta } from './mock.model';
import { MOCK_RUTAS_PROYECCION } from './proyeccion.mock';

/** Rutas mockeadas del backend. Se agregan en cada feature. */
export const MOCK_RUTAS: MockRuta[] = [...MOCK_RUTAS_AFILIADO, ...MOCK_RUTAS_PROYECCION];
