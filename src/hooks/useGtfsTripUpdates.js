/* istanbul ignore file */

import { useFetchResolver, useGtfsRealtime } from "gtfs-react-hooks";

export default function useGtfsTripUpdates(url) {
  return useGtfsRealtime(useFetchResolver(url), 30 * 1000);
}
