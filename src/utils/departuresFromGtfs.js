import { isFuture, fromUnixTime } from 'date-fns'
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'

const ScheduleRelationship = GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship

export default function departuresFromGtfs (gtfsSchedule, gtfsTripUpdates, stopIds) {
  if (gtfsSchedule?.routes === undefined ||
      gtfsSchedule?.stops === undefined ||
      gtfsSchedule?.trips === undefined ||
      gtfsTripUpdates === undefined) {
    return undefined
  }

  stopIds = [...new Set(stopIds)]
  return stopIds
    .map((stopId) => getStopDepartures(gtfsSchedule, gtfsTripUpdates, stopId))
    .filter((departures) => !!departures)
}

function getStopDepartures (gtfsSchedule, gtfsTripUpdates, stopId) {
  const stop = gtfsSchedule.stops.find((stop) => stop.stopId === stopId)
  if (stop === undefined) return undefined

  const STOP_SKIPPED = GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship.SKIPPED
  const processedShapes = new Set()
  const result = { id: stop.stopId, name: stop.stopName }
  result.departures = gtfsTripUpdates.entity
    .map((entity) => entity.tripUpdate)
    .map((tripUpdate) => {
      const stopTimeUpdate = tripUpdate.stopTimeUpdate.find((stopTimeUpdate) => stopTimeUpdate.stopId === stopId)
      if (
        stopTimeUpdate &&
        stopTimeUpdate.scheduleRelationship !== STOP_SKIPPED
      ) {
        const departureTime = fromUnixTime((stopTimeUpdate.departure || stopTimeUpdate.arrival).time)
        const trip = gtfsSchedule.trips.find((trip) => trip.tripId === tripUpdate.trip.tripId)
        const shapeId = trip.shapeId
        if (!processedShapes.has(shapeId) && isFuture(departureTime)) {
          processedShapes.add(shapeId)
          return { departureTime, trip }
        }
      }
      return undefined
    })
    .filter((departure) => !!departure)
    .map((departure) => {
      const route = gtfsSchedule.routes.find((route) => route.routeId === departure.trip.routeId)
      return {
        id: departure.trip.tripId,
        destination: departure.trip.tripHeadsign,
        route: route.routeShortName,
        time: departure.departureTime,
        color: `#${route.routeColor}`,
        sortOrder: route.routeSortOrder,
      }
    })
    .sort((departure1, departure2) => {
      return Number(departure1.sortOrder) - Number(departure2.sortOrder)
    })

  return result
}
