/* istanbul ignore file */

import { useFetchResolver, useGtfsRealtime } from "gtfs-react-hooks";

export default function useGtfsRealtimeAlerts(url) {
  return useGtfsRealtime(useFetchResolver(url), 30 * 1000);
}
