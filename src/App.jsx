import DepartureBoard from './components/DepartureBoard.jsx'
import { useGtfsSchedule, useGtfsRealtime, useFetchResolver } from 'gtfs-react-hooks'
import departuresFromGtfs from './utils/departuresFromGtfs.js'

export default function App () {
  const scheduleResolver = useFetchResolver("http://localhost:9292/gtfs")
  const gtfsSchedule = useGtfsSchedule(scheduleResolver, 24 * 60 * 60 * 1000)

  const tripUpdatesResolver = useFetchResolver("http://localhost:9292/gtfs-rt/trip-updates")
  const gtfsTripUpdates = useGtfsRealtime(tripUpdatesResolver, 30 * 1000)

  const stopId = 64
  const departures = departuresFromGtfs(gtfsSchedule, gtfsTripUpdates, stopId)

  return (<DepartureBoard />)
}
