/**
 * Prefix app-relative paths with Vite BASE_URL.
 * Works for both local "/" and GitHub Pages subpath deployments (e.g. "/Science/").
 */
export function withBaseFrom(path: string, baseUrl: string): string {
  const normalizedPath = path.replace(/^\/+/, '');
  const base = baseUrl || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${normalizedPath}`;
}

export function withBase(path: string): string {
  return withBaseFrom(path, import.meta.env.BASE_URL || '/');
}

