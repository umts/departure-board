import { fromUnixTime, isPast, isFuture } from 'date-fns'
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'

export default function alertsFromGtfs (gtfsAlerts, stopIds, routeIds) {
  if (gtfsAlerts === undefined) {
    return undefined
  }

  return gtfsAlerts.entity
    .map((entity) => entity.alert)
    .filter(Boolean)
    .filter(alertIsPresent)
    .filter((alert) => { return alertIsRelevant(alert, stopIds, routeIds) })
    .map(transformToReactData)
}

// Alerts must be shown if there is no defined time period in the alert
// The object prototype for time periods will return 0 for start/end if the alert doesn't define it
function alertIsPresent(alert) {
  return (
    alert.activePeriod == undefined ||
    alert.activePeriod.some((time_period) => {
      return (time_period.start == 0 || isPast(fromUnixTime(time_period.start))) &&
             (time_period.end == 0 || isFuture(fromUnixTime(time_period.end)))
    })
  )
}

function alertIsRelevant(alert, stopIds, routeIds) {
  return (
    alert.informedEntity.some((informed_entity) => {
      if (routeIds !== undefined && informed_entity.routeId !== undefined &&
          !routeIds.includes(informed_entity.routeId)) {
        return false
      }

      if (stopIds !== undefined && informed_entity.stopId !== undefined &&
          !stopIds.includes(informed_entity.stopId)) {
        return false
      }
      return true
    })
  )
}

function transformToReactData(alert) {
  return {
    id: `${alert.headerText.translation[0].text}-${alert.descriptionText.translation[0].text}`,
    header: alert.headerText.translation[0].text,
    description: alert.descriptionText.translation[0].text,
    entity: alert.informedEntity
  }
}
