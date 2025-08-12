import { fromUnixTime, isPast } from 'date-fns'
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
  stopIds = new Set(stopIds)

  const uniqueDepartures = {}

  gtfsTripUpdates.entity.forEach((entity) => {
    const trip = tripsById[entity.tripUpdate.trip.tripId]

    entity.tripUpdate.stopTimeUpdate.forEach((stopTimeUpdate) => {
      if (stopTimeUpdate.scheduleRelationship !== ScheduleRelationship.SCHEDULED) return

      const route = routesById[trip.routeId]

      const stop = stopsById[stopTimeUpdate.stopId]
      if (!(stopIds.has(stop.stopId))) return

      const time = fromUnixTime((stopTimeUpdate.departure || stopTimeUpdate.arrival).time)
      if (isPast(time)) return

      uniqueDepartures[stop.stopId] ??= {}
      uniqueDepartures[stop.stopId][route.routeId] ??= {}
      const previousDeparture = uniqueDepartures[stop.stopId][route.routeId][trip.shapeId]
      if (previousDeparture === undefined || previousDeparture.time > time) {
        uniqueDepartures[stop.stopId][route.routeId][trip.shapeId] = { tripId: trip.tripId, time }
      }
    })
  })

  return [...stopIds].map((stopId) => stopsById[stopId]).map((stop) => ({
    id: stop.stopId,
    name: stop.stopName,
    departures: Object.values(uniqueDepartures[stop.stopId] || {})
      .flatMap((byShape) => Object.values(byShape))
      .map(({ tripId, time }) => ({
        id: tripId,
        destination: tripsById[tripId].tripHeadsign,
        route: routesById[tripsById[tripId].routeId].routeShortName,
        time,
        color: `#${routesById[tripsById[tripId].routeId].routeColor}`
      }))
  }))
}

function buildIndex (collection, computeKey) {
  const index = {}
  collection.forEach((item) => { index[computeKey(item)] ??= item })
  return index
}
