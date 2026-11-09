/** Where the button of a mini-simulator leads: the first page carrying the full calculator of that kind. */
import { ROUTES, route } from '../i18n/routes';
import { pageOfTool } from './pages';
export const miniHref = (kind: string, fallback: string) => { const id = pageOfTool(kind); return id && ROUTES.some((r) => r.id === id) ? route(id, 'en') : fallback; };
