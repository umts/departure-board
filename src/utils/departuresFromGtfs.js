import { isFuture, fromUnixTime } from 'date-fns'
/* v8 ignore next */
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'

const index = (arr, callback) => {
  const indexed = {}
  arr.forEach((item) => { indexed[callback(item)] = item })
  return indexed
}

export default function departuresFromGtfs (gtfsSchedule, gtfsTripUpdates, stopIds) {
  if (gtfsSchedule?.routes === undefined ||
      gtfsSchedule?.stops === undefined ||
      gtfsSchedule?.trips === undefined ||
      gtfsTripUpdates === undefined) {
    return undefined
  }

  stopIds = [...new Set(stopIds)]
  const routesById = index(gtfsSchedule.routes, (route) => route.routeId)
  const stopsById = index(gtfsSchedule.stops, (stop) => stop.stopId)
  const tripsById = index(gtfsSchedule.trips, (trip) => trip.tripId)

  const stops = {}

  gtfsTripUpdates.entity.forEach((entity) => {
    const trip = tripsById[entity.tripUpdate.trip.tripId]

    if (trip === undefined) return

    entity.tripUpdate.stopTimeUpdate.forEach((stopTimeUpdate) => {
      if (!(stopIds.includes(stopTimeUpdate.stopId))) return

      const stop = stopsById[stopTimeUpdate.stopId]
      const route = routesById[trip.routeId]

      stops[stop.stopId] ??= { id: stop.stopId, name: stop.stopName, departures: [] }

      stops[stop.stopId].departures.push({
        id: trip.tripId,
        destination: trip.tripHeadsign,
        route: routesById[tripsById[trip.tripId].routeId].routeShortName,
        time: fromUnixTime((stopTimeUpdate.departure || stopTimeUpdate.arrival).time),
        color: `#${route.routeColor}`,
      })
    })
  })

  return Object.values(stops)
}

function getStopDepartures (gtfsSchedule, gtfsTripUpdates, stopId) {
  const stop = gtfsSchedule.stops.find((stop) => stop.stopId === stopId)
  /* v8 ignore next */
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
        stopTimeUpdate.scheduleRelationship !== STOP_SKIPPED &&
        tripUpdate.stopTimeUpdate[tripUpdate.stopTimeUpdate.length - 1] !== stopTimeUpdate
      ) {
        /* v8 ignore next */
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
    .sort((departure1, departure2) => Number(departure1.sortOrder) - Number(departure2.sortOrder))

  return result
}
