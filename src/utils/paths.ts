// Every local asset and page URL is relative to the deployment, including
// GitHub project Pages under /repository/. External URLs are left intact.
export function appPath(path: string, base = import.meta.env.BASE_URL): string {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path)) return path;
  return `${base}${path.replace(/^\//, '')}`;
}

export function pagePath(
  path: string,
  base = import.meta.env.BASE_URL,
): string {
  const url = appPath(path, base);
  return url.endsWith('/') ? url : `${url}/`;
}

export function routeForPath(
  pathname: string,
  base = import.meta.env.BASE_URL,
): string {
  if (!pathname.startsWith(base)) return '/404';
  return (
    `/${pathname.slice(base.length)}`
      .replace(/\/index\.html$/, '/')
      .replace(/\/+$/, '') || '/'
  );
}
