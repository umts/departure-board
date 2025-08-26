import { fromUnixTime, isPast } from 'date-fns'
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'

const ScheduleRelationship = GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship

export default function departuresFromGtfs (gtfsSchedule, gtfsTripUpdates, stopIds) {
  if (gtfsSchedule?.routes === undefined ||
      gtfsSchedule?.stops === undefined ||
      gtfsSchedule?.stopTimes === undefined ||
      gtfsSchedule?.trips === undefined ||
      gtfsTripUpdates === undefined) {
    return undefined
  }

  const routesById = buildIndex(gtfsSchedule.routes, (route) => route.routeId)
  const stopsById = buildIndex(gtfsSchedule.stops, (stop) => stop.stopId)
  const tripsById = buildIndex(gtfsSchedule.trips, (trip) => trip.tripId)
  const stopTimesByTripId = gtfsSchedule.stopTimes.reduce((map, current) => {
    map[current.tripId] ??= []
    map[current.tripId].push(current)
    return map
  })

  const stops = [...new Set(stopIds)].map((stopId) => stopsById[stopId]).filter(Boolean)
  const updates = earliestStopTimeUpdates(gtfsTripUpdates.entity.map((entity) => entity.tripUpdate), tripsById, stopTimesByTripId)

  const departures = []
  stops.forEach((stop) => {
    departures.push({
      id: stop.stopId,
      name: stop.stopName,
      departures: updates.filter((update) => update.stopId === stop.stopId).map((update) => {
        const trip = tripsById[update.tripId]
        const route = routesById[update.routeId]
        if (trip === undefined || route === undefined) return undefined

        return {
          id: `${update.shapeId}-${update.routeId}`,
          destination: trip.tripHeadsign,
          route: route.routeShortName,
          time: update.time,
          color: `#${route.routeColor}`
        }
      }).filter(Boolean)
    })
  })
  return departures
}

function buildIndex (collection, computeKey) {
  const index = {}
  collection.forEach((item) => { index[computeKey(item)] ??= item })
  return index
}

function earliestStopTimeUpdates (tripUpdates, tripsById, stopTimesByTripId) {
  const stopTimeUpdates = {}
  tripUpdates.forEach((tripUpdate) => {
    const trip = tripsById[tripUpdate.trip.tripId]
    if (trip === undefined) return

    tripUpdate.stopTimeUpdate.forEach((stopTimeUpdate) => {
      if (stopTimeUpdate.scheduleRelationship !== ScheduleRelationship.SCHEDULED) return

      const shapeId = trip.shapeId
      const stopId = stopTimeUpdate.stopId
      const routeId = trip.routeId
      const tripId = trip.tripId
      const time = fromUnixTime((stopTimeUpdate.departure || stopTimeUpdate.arrival).time)

      if (isPast(time)) return
      if (isLastStopInTrip(tripId, stopId, stopTimesByTripId)) return

      stopTimeUpdates[stopId] ??= {}
      stopTimeUpdates[stopId][routeId] ??= {}
      const previousDeparture = stopTimeUpdates[stopId][routeId][shapeId]
      if (previousDeparture === undefined || previousDeparture.time > time) {
        stopTimeUpdates[stopId][routeId][shapeId] = { shapeId, stopId, tripId, routeId, time }
      }
    })
  })
  const departures = []
  Object.values(stopTimeUpdates).forEach((byRoute) => {
    Object.values(byRoute).forEach((byShape) => {
      Object.values(byShape).forEach((departure) => {
        departures.push(departure)
      })
    })
  })
  return departures
}

function isLastStopInTrip (tripId, stopId, stopTimesByTripId) {
  const lastStopId = stopTimesByTripId[tripId].reduce((target, current) => {
    return Number(target.stopSequence) > Number(current.stopSequence) ? target : current
  }).stopId
  return lastStopId === stopId
}
