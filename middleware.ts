import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths except Next.js internals and static files
  matcher: [
    // Match root
    '/',
    // Match all locale-prefixed paths
    '/(es|fr|de|it)/:path*',
    // Match all other paths (excluding _next, api, static files)
    '/((?!_next|api|.*\\..*).+)',
  ],
};
