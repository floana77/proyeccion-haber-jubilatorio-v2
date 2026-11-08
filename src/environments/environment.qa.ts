// Ambiente de QA (-c qa). Usa los mocks del interceptor hasta que existan
// los servidores mock de Postman; ahí se cambia apiUrl y se apaga usarMocks.
export const environment = {
  nombre: 'qa',
  production: false,
  apiUrl: '/api',
  usarMocks: true,
  // Trámite de jubilación en el servidor de calidad.
  urlTramite: 'http://calidadonline2/apps/Main#/BeneficiosPrecarga/SolicitudJubilacion/Index'
};
