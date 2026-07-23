import { useMemo } from "react";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

export default function useTripStatus(status) {
  const ScheduleRelationship =
    GtfsRealtimeBindings.transit_realtime.TripDescriptor.ScheduleRelationship;

  return useMemo(() => (
    { textDecoration: status === ScheduleRelationship.CANCELED ? 'line-through' : 'none' }),
    [status, ScheduleRelationship]);
}
