/**
 * Convierte una fecha AAAA-MM-DD en un Date a las 00:00 de la hora local.
 * new Date('AAAA-MM-DD') la toma como UTC y en Argentina da el día anterior.
 */
export function parsearFecha(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

/** Devuelve la fecha a las 00:00 de la hora local, sin la hora del día. */
export function inicioDelDia(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

/** Convierte un Date en texto AAAA-MM-DD según la hora local. */
export function formatearFecha(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}
