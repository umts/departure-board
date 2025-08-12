import { fromUnixTime } from 'date-fns'
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'

export default function departuresFromGtfs (gtfsSchedule, gtfsTripUpdates, stopIds) {
  if (gtfsSchedule?.routes === undefined ||
      gtfsSchedule?.stops === undefined ||
      gtfsSchedule?.trips === undefined ||
      gtfsTripUpdates === undefined) {
    return undefined
  }

  const routesById = buildIndex(gtfsSchedule.routes, (route) => route.routeId)
  const stopsById = buildIndex(gtfsSchedule.stops, (stop) => stop.stopId)
  const tripsById = buildIndex(gtfsSchedule.trips, (trip) => trip.tripId)

  const departuresByStop = {}
  stopIds.forEach((stopId) => {
    const stop = stopsById[stopId]
    if (stop) departuresByStop[stop.stopId] = { id: stop.stopId, name: stop.stopName, departures: [] }
  })

  gtfsTripUpdates.entity.forEach((entity) => {
    const trip = tripsById[entity.tripUpdate.trip.tripId]
    entity.tripUpdate.stopTimeUpdate.forEach((stopTimeUpdate) => {
      const stop = stopsById[stopTimeUpdate.stopId]
      const route = routesById[trip.routeId]

      if (stopTimeUpdate.scheduleRelationship !== ScheduleRelationship.SCHEDULED) return
      if (!(stop.stopId in departuresByStop)) return

      departuresByStop[stop.stopId].departures.push({
        id: trip.tripId,
        destination: trip.tripHeadsign,
        route: routesById[tripsById[trip.tripId].routeId].routeShortName,
        time: fromUnixTime((stopTimeUpdate.departure || stopTimeUpdate.arrival).time),
        color: `#${route.routeColor}`,
      })
    })
  })

  return Object.values(departuresByStop)
}

function buildIndex (collection, computeKey) {
  const index = {}
  collection.forEach((item) => { index[computeKey(item)] ??= item })
  return index
}
