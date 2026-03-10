import { fromUnixTime, isPast, isFuture } from 'date-fns'
import buildIndex from './buildIndex.js'

export default function alertsFromGtfs (gtfsSchedule, gtfsAlerts, stopIds, routeIds) {
  if (gtfsSchedule?.routes === undefined ||
      gtfsSchedule?.stops === undefined ||
      gtfsSchedule?.stopTimes === undefined ||
      gtfsSchedule?.trips === undefined ||
      gtfsAlerts === undefined) {
    return undefined
  }

  const relevantRouteIds = routeIds || relevantRouteIdsForStopIds(gtfsSchedule, stopIds)

  return gtfsAlerts.entity
    .map((entity) => entity.alert)
    .filter(Boolean)
    .filter(alertIsActive)
    .filter((alert) => { return alertIsRelevant(alert, stopIds, relevantRouteIds) })
    .map((alert) => transformToReactData(gtfsSchedule, alert))
}

function relevantRouteIdsForStopIds (gtfsSchedule, stopIds) {
  const routeIds = new Set()
  const tripsById = buildIndex(gtfsSchedule.trips, (trip) => trip.tripId)
  gtfsSchedule.stopTimes.forEach((stopTime) => {
    if (stopIds.includes(stopTime.stopId)) {
      routeIds.add(tripsById[stopTime.tripId].routeId)
    }
  })
  return [...routeIds]
}

// Alerts must be shown if there is no defined time period in the alert
// The object prototype for time periods will return 0 for start/end if the alert doesn't define it
function alertIsActive (alert) {
  return (
    alert.activePeriod === undefined ||
    alert.activePeriod.some((timePeriod) => {
      return (timePeriod.start === 0 || isPast(fromUnixTime(timePeriod.start))) &&
             (timePeriod.end === 0 || isFuture(fromUnixTime(timePeriod.end)))
    })
  )
}

function alertIsRelevant (alert, stopIds, routeIds) {
  return alert.informedEntity.some((informedEntity) => (
    stopIds.includes(informedEntity.stopId) || routeIds.includes(informedEntity.routeId)
  ))
}

function transformToReactData (gtfsSchedule, alert) {
  const routesById = buildIndex(gtfsSchedule.routes, (route) => route.routeId)

  return {
    id: `${alert.headerText.translation[0].text}-${alert.descriptionText.translation[0].text}`,
    header: alert.headerText.translation[0].text,
    description: alert.descriptionText.translation[0].text,
    routes: alert.informedEntity.map((informedEntity) =>
      routesById[informedEntity.routeId]
    ).map((route) => ({
      id: route.id,
      name: route.routeShortName
    }))
  }
}
