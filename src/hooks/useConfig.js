import { useMemo } from 'react'

export default function useConfig () {
  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return {
      gtfsScheduleUrl: searchParams.get('gtfsScheduleUrl') ||
        import.meta.env.VITE_GTFS_SCHEDULE_URL ||
        DEFAULT_GTFS_SCHEDULE_URL,
      gtfsRealtimeTripUpdatesUrl: searchParams.get('gtfsRealtimeTripUpdatesUrl') ||
        import.meta.env.VITE_GTFS_REALTIME_TRIP_UPDATES_URL ||
        DEFAULT_GTFS_REALTIME_TRIP_UPDATES_URL,
      gtfsRealtimeAlertsUrl: searchParams.get('gtfsRealtimeAlertsUrl') ||
        import.meta.env.VITE_GTFS_REALTIME_ALERTS_URL ||
        DEFAULT_GTFS_REALTIME_ALERTS_URL,
      stopIds: parseArray(searchParams.get('stopIds') || import.meta.env.VITE_STOP_IDS),
      routeIds: parseArray(searchParams.get('routeIds') || import.meta.env.VITE_ROUTE_IDS),
    }
  }, [])
}

const DEFAULT_GTFS_SCHEDULE_URL = 'https://gtfs-cache.admin.umass.edu/gtfs'
const DEFAULT_GTFS_REALTIME_TRIP_UPDATES_URL = 'https://gtfs-cache.admin.umass.edu/gtfs-rt/trip-updates'
const DEFAULT_GTFS_REALTIME_ALERTS_URL = 'https://gtfs-cache.admin.umass.edu/gtfs-rt/alerts'

function parseArray (arg) {
  return arg?.split(',')?.filter((item) => !!(item))
}
