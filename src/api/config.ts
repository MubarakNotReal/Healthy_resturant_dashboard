const envBase = (import.meta.env.VITE_API_BASE ?? '').trim();
const defaultBase = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';
const normalizedBase = (envBase || defaultBase).replace(/\/+$/, '');

export const API_BASE = normalizedBase;

export function apiUrl(path = ''): string {
  const cleanPath = path.replace(/^\/+/, '');
  return cleanPath ? `${normalizedBase}/${cleanPath}` : normalizedBase;
}
