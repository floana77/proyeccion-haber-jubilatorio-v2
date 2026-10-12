import { environment } from './environment.prod';

describe('environment.prod', () => {
  it('no usa mocks en producción', () => {
    expect(environment.usarMocks).toBeFalse();
    expect(environment.production).toBeTrue();
  });
});
