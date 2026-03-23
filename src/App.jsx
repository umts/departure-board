import { useGtfsSchedule, useGtfsRealtime, useFetchResolver } from 'gtfs-react-hooks'
import DepartureBoard from './components/DepartureBoard.jsx'
import useConfig from './hooks/useConfig.js'
import departuresFromGtfs from './utils/departuresFromGtfs.js'
import alertsFromGtfs from './utils/alertsFromGtfs.js'

export default function App () {
  const { gtfsScheduleUrl, gtfsRealtimeTripUpdatesUrl, gtfsRealtimeAlertsUrl, stopIds, routeIds } = useConfig()

  const scheduleResolver = useFetchResolver(gtfsScheduleUrl)
  const gtfsSchedule = useGtfsSchedule(scheduleResolver, 24 * 60 * 60 * 1000)

  const tripUpdatesResolver = useFetchResolver(gtfsRealtimeTripUpdatesUrl)
  const gtfsTripUpdates = useGtfsRealtime(tripUpdatesResolver, 30 * 1000)

  const alertsResolver = useFetchResolver(gtfsRealtimeAlertsUrl)
  const gtfsAlerts = useGtfsRealtime(alertsResolver, 30 * 1000)

  const stops = departuresFromGtfs(gtfsSchedule, gtfsTripUpdates, stopIds, routeIds)
  const alerts = alertsFromGtfs(gtfsSchedule, gtfsAlerts, stopIds, routeIds)

  return (
    <>
      {(stops === undefined || alerts === undefined) ? null : (<DepartureBoard stops={stops} alerts={alerts} />)}
    </>
  )
}
