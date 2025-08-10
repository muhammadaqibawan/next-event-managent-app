type DynamicRoute = (id: string) => string;

interface Routes {
  HOME: string;
  LOGIN: string;
  DASHBOARD: string;
  EVENT_VIEW: DynamicRoute;
  EVENT_EDIT: DynamicRoute;
}

export const ROUTES: Routes = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard/events",
  EVENT_VIEW: (eventId: string) => `/dashboard/events/${eventId}/view`,
  EVENT_EDIT: (eventId: string) => `/dashboard/events/${eventId}/edit`,
};

export const QUERY_TIMES = {
  FIRST_PAGE_STALE_TIME: 10 * 60 * 1000, // 10 minutes
  FIRST_PAGE_GC_TIME: 10 * 60 * 1000, // 10 minutes
  DEFAULT_STALE_TIME: 0,
  DEFAULT_GC_TIME: 0,
};
