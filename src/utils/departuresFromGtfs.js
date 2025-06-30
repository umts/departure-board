import { isBefore, fromUnixTime } from 'date-fns'
/* v8 ignore next */
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'

const STOP_SKIPPED = GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship.SKIPPED

export default function departuresFromGtfs (gtfsSchedule, gtfsTripUpdates, stopId) {
  if (gtfsSchedule?.stops === undefined ||
      gtfsSchedule?.stopTimes === undefined ||
      gtfsSchedule?.trips === undefined ||
      gtfsTripUpdates === undefined) {
    return undefined
  }

  const stop = gtfsSchedule.stops.find((stop) => stop.stopId === stopId)
  /* v8 ignore next */
  if (stop === undefined) return undefined

  const result = { stopId: stop.stopId, stopName: stop.stopName }

  // Isolate relevant trips based on our stop id
  const tripIds = gtfsSchedule.stopTimes
    .filter((stopTime) => stopTime.stopId === stopId)
    .map((stopTime) => stopTime.tripId)

  // Create then splat a Set to enforce uniqueness after mapping trip ids to their routes
  const routeIds = [...new Set(
    gtfsSchedule.trips.filter((trip) => tripIds.includes(trip.tripId)).map((trip) => trip.routeId)
  )]

  // Now retain updates which are for stops on our routes at this stop which haven't been cancelled
  const relevantUpdates = gtfsTripUpdates.entity
    .map((entity) => entity.tripUpdate)
    .filter((tripUpdate) => routeIds.includes(tripUpdate.trip.routeId)) // Only want updates relevant to our routes
    .filter((tripUpdate) => tripUpdate.stopTimeUpdate.some((stopTimeUpdate) =>
      stopTimeUpdate.stopId === stopId &&                       // Only want updates relevant to our stop
      stopTimeUpdate.scheduleRelationship !== STOP_SKIPPED &&   // We just want the next departure, ignore skipped stops
      tripUpdate.stopTimeUpdate[tripUpdate.stopTimeUpdate.length - 1] !== stopTimeUpdate // If it's the last stop in the sequence, we don't care about it's arrival
    ))

  // GTFS deals with many destinations on a route though shapes. We're really showing the time till the next bus
  // servicing each shape at this stop. So go through our updates and find the earliest departure on each shape.
  const shapeToNextDepartureMap = new Map()
  relevantUpdates.forEach((tripUpdate) => {
    const trip = gtfsSchedule.trips.find((trip) => trip.tripId === tripUpdate.trip.tripId)
    const shapeId = trip.shapeId
    const departureTime = fromUnixTime(
      /* v8 ignore next */
      tripUpdate.stopTimeUpdate.find((stopTimeUpdate) => stopTimeUpdate.stopId === stopId)?.departure?.time ||
      /* v8 ignore next */
      tripUpdate.stopTimeUpdate.find((stopTimeUpdate) => stopTimeUpdate.stopId === stopId).arrival.time
    )
    if (shapeToNextDepartureMap.get(shapeId) === undefined ||
        isBefore(departureTime, shapeToNextDepartureMap.get(shapeId).departureTime)) {
      shapeToNextDepartureMap.set(shapeId, { departureTime, trip })
    }
  })

  // Now map over those shapes to our departures format
  result.departures = []
  shapeToNextDepartureMap.values().forEach((departure) => {
    const route = gtfsSchedule.routes.find((route) => route.routeId === departure.trip.routeId)
    result.departures.push({
      id: departure.trip.tripId,
      destination: departure.trip.tripHeadsign,
      route: route.routeShortName,
      time: departure.departureTime,
      color: `#${route.routeColor}`,
      textColor: `#${route.routeTextColor}`,
      sortOrder: route.routeSortOrder,
    })
  })

  result.departures.sort((departure1, departure2) => Number(departure1.sortOrder) - Number(departure2.sortOrder))

  return result
}
