import { isFuture, fromUnixTime } from 'date-fns'
/* v8 ignore next */
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'

export default function departuresFromGtfs (gtfsSchedule, gtfsTripUpdates, stopIds) {
  if (gtfsSchedule?.stops === undefined ||
      gtfsSchedule?.stopTimes === undefined ||
      gtfsSchedule?.trips === undefined ||
      gtfsTripUpdates === undefined) {
    return undefined
  }

  stopIds = new Set(stopIds)
  return stopIds.values()
    .map((stopId) => getStopDepartures(gtfsSchedule, gtfsTripUpdates, stopId))
    .filter((departures) => departures)
    .toArray()
}

const STOP_SKIPPED = GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship.SKIPPED

function getStopDepartures (gtfsSchedule, gtfsTripUpdates, stopId) {
  const stop = gtfsSchedule.stops.find((stop) => stop.stopId === stopId)
  /* v8 ignore next */
  if (stop === undefined) return undefined

  const result = { stopId: stop.stopId, stopName: stop.stopName }

  const routeIds = [...new Set(
    gtfsSchedule.stopTimes
      .filter((stopTime) => stopTime.stopId === stopId)
      .map((stopTime) => gtfsSchedule.trips.find((trip) => trip.tripId === stopTime.tripId).routeId)
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
  // servicing each shape at this stop. Times are delivered sorted by earliest time -- so just grab the first one which is in the future
  const shapeToNextDepartureMap = new Map()
  relevantUpdates.forEach((tripUpdate, index) => {
    const trip = gtfsSchedule.trips.find((trip) => trip.tripId === tripUpdate.trip.tripId)
    const stopTimeUpdate = tripUpdate.stopTimeUpdate.find((stopTimeUpdate) => stopTimeUpdate.stopId === stopId)
    /* v8 ignore next */
    const departureTime = fromUnixTime((stopTimeUpdate.departure || stopTimeUpdate.arrival).time)
    if (!shapeToNextDepartureMap.has(trip.shapeId) && isFuture(departureTime)) {
      shapeToNextDepartureMap.set(trip.shapeId, { departureTime, trip })
    }
  })

  // Now map over those shapes to our departures format
  result.departures = shapeToNextDepartureMap.values().map((departure) => {
    const route = gtfsSchedule.routes.find((route) => route.routeId === departure.trip.routeId)
    return {
      id: departure.trip.tripId,
      destination: departure.trip.tripHeadsign,
      route: route.routeShortName,
      time: departure.departureTime,
      color: `#${route.routeColor}`,
      sortOrder: route.routeSortOrder,
    }
  }).toArray()

  result.departures.sort((departure1, departure2) => Number(departure1.sortOrder) - Number(departure2.sortOrder))
  return result
}
