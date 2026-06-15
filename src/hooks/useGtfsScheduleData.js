/* istanbul ignore file */

import { useFetchResolver, useGtfsSchedule } from "gtfs-react-hooks";

export default function useGtfsScheduleData(url) {
  return useGtfsSchedule(useFetchResolver(url), 24 * 60 * 60 * 1000);
}
