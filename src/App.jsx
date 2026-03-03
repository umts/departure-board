import { useGtfsSchedule, useGtfsRealtime, useFetchResolver } from 'gtfs-react-hooks'
import DepartureBoard from './components/DepartureBoard.jsx'
import useConfig from './hooks/useConfig.js'
import departuresFromGtfs from './utils/departuresFromGtfs.js'

export default function App () {
  const { gtfsScheduleUrl, gtfsRealtimeTripUpdatesUrl, stopIds, routeIds } = useConfig()

  const scheduleResolver = useFetchResolver(gtfsScheduleUrl)
  const gtfsSchedule = useGtfsSchedule(scheduleResolver, 24 * 60 * 60 * 1000)

  const tripUpdatesResolver = useFetchResolver(gtfsRealtimeTripUpdatesUrl)
  const gtfsTripUpdates = useGtfsRealtime(tripUpdatesResolver, 30 * 1000)

  const stops = departuresFromGtfs(gtfsSchedule, gtfsTripUpdates, stopIds, routeIds)

  return (
    <>
      {(stops === undefined) ? null : (<DepartureBoard stops={stops} />)}
    </>
  )
}
