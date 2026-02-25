import { useGtfsSchedule, useGtfsRealtime, useFetchResolver } from 'gtfs-react-hooks'
import DepartureBoard from './components/DepartureBoard.jsx'
import useConfig from './hooks/useConfig.js'
import departuresFromGtfs from './utils/departuresFromGtfs.js'
import alertsFromGtfs from './utils/alertsFromGtfs.js'

export default function App () {
  const { gtfsScheduleUrl, gtfsRealtimeTripUpdatesUrl, stopIds, routeIds } = useConfig()

  const scheduleResolver = useFetchResolver(gtfsScheduleUrl)
  const gtfsSchedule = useGtfsSchedule(scheduleResolver, 24 * 60 * 60 * 1000)

  const tripUpdatesResolver = useFetchResolver(gtfsRealtimeTripUpdatesUrl)
  const gtfsTripUpdates = useGtfsRealtime(tripUpdatesResolver, 30 * 1000)

  const alertsResolver = useFetchResolver('http://localhost:9292/gtfs-rt/alerts')
  const gtfsAlerts = useGtfsRealtime(alertsResolver, 30 * 1000)

  const stops = departuresFromGtfs(gtfsSchedule, gtfsTripUpdates, stopIds, routeIds)
  // const alerts = alertsFromGtfs(gtfsAlerts, stopIds, routeIds)
  const alerts = [
    { header: 'Test1', description: 'Test1 Alert', routes: [{ id: 1, name: '30' }], effect: 'Detour' },
    { header: 'Test2', description: 'Test2 Alert',
      routes: [{ id: 2, name: '34' }, { id: 3, name: '35' }], effect: 'Stop closed' },
  ]

  return (
    <>
      {(stops === undefined || alerts === undefined) ? null : (<DepartureBoard stops={stops} alerts={alerts} />)}
    </>
  )
}
