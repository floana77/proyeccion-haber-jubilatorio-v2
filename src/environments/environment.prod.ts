// Ambiente de producción. Nunca usa mocks ni apunta a servidores mock.
export const environment = {
  nombre: 'prod',
  production: true,
  // [COMPLETAR: URL de los servicios backend actuales de CPBA]
  apiUrl: '/api',
  usarMocks: false
};
