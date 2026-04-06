import { fromUnixTime, isPast } from 'date-fns'
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import buildIndex from './buildIndex.js'

const ScheduleRelationship = GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship

export default function departuresFromGtfs (gtfsSchedule, gtfsTripUpdates, stopIds, routeIds) {
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
  const lastStopTimesByTripId = buildIndex(gtfsSchedule.stopTimes, (stopTime) => stopTime.tripId, (prev, next) => (
    Number(next.stopSequence) >= Number(prev.stopSequence)
  ))

  const stops = [...new Set(stopIds)].map((stopId) => stopsById[stopId]).filter(Boolean)
  const updates = earliestStopTimeUpdates(
    gtfsTripUpdates.entity.map((entity) => entity.tripUpdate),
    tripsById,
    lastStopTimesByTripId
  )

  const departures = []
  stops.forEach((stop) => {
    departures.push({
      id: stop.stopId,
      name: stop.stopName,
      departures: updates.filter((update) => update.stopId === stop.stopId).map((update) => {
        const trip = tripsById[update.tripId]
        const route = routesById[update.routeId]
        if (trip === undefined || route === undefined) return undefined
        if (routeIds && !(routeIds.includes(route.routeId))) return undefined

        return {
          id: `${update.routeId}-${trip.tripHeadsign}`,
          destination: trip.tripHeadsign,
          route: route.routeShortName,
          time: update.time,
          color: `#${route.routeColor}`,
          routeSortOrder: route.routeSortOrder,
        }
      }).filter(Boolean).sort((departure1, departure2) => {
        if (departure1.routeSortOrder === departure2.routeSortOrder) {
          return departure1.destination.localeCompare(departure2.destination)
        } else {
          return departure1.routeSortOrder - departure2.routeSortOrder
        }
      })
    })
  })
  return departures
}

function earliestStopTimeUpdates (tripUpdates, tripsById, lastStopTimesByTripId) {
  const stopTimeUpdates = {}
  tripUpdates.forEach((tripUpdate) => {
    const trip = tripsById[tripUpdate.trip.tripId]
    if (trip === undefined) return

    tripUpdate.stopTimeUpdate.forEach((stopTimeUpdate) => {
      if (stopTimeUpdate.scheduleRelationship !== ScheduleRelationship.SCHEDULED) return

      const headsign = trip.tripHeadsign
      const stopId = stopTimeUpdate.stopId
      const routeId = trip.routeId
      const tripId = trip.tripId
      const time = fromUnixTime((stopTimeUpdate.departure || stopTimeUpdate.arrival).time)

      if (isPast(time)) return
      if (lastStopTimesByTripId[tripId]?.stopId === stopId) return

      stopTimeUpdates[stopId] ??= {}
      stopTimeUpdates[stopId][routeId] ??= {}
      const previousDeparture = stopTimeUpdates[stopId][routeId][headsign]
      if (previousDeparture === undefined || previousDeparture.time > time) {
        stopTimeUpdates[stopId][routeId][headsign] = { stopId, tripId, routeId, time }
      }
    })
  })
  const departures = []
  Object.values(stopTimeUpdates).forEach((byRoute) => {
    Object.values(byRoute).forEach((byHeadsign) => {
      Object.values(byHeadsign).forEach((departure) => {
        departures.push(departure)
      })
    })
  })
  return departures
}
