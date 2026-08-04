/**
 * The frontend imports shared types from api/_lib, so in development Vite asks
 * for source modules under the same /api prefix the endpoints live at. Anything
 * carrying a file extension is a module, not an endpoint.
 */
export function isApiEndpoint(pathname: string): boolean {
  return pathname.startsWith('/api/') && !/\.[a-z]+$/i.test(pathname)
}
