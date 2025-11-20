import { useGtfsSchedule, useGtfsRealtime, useFetchResolver } from 'gtfs-react-hooks'
import Departure from './components/Departure.jsx'
import DepartureBoard from './components/DepartureBoard.jsx'
import Stop from './components/Stop.jsx'
import useConfig from './hooks/useConfig.js'
import departuresFromGtfs from './utils/departuresFromGtfs.js'

export default function App () {
  const { stopIds, routeIds } = useConfig()

  const scheduleResolver = useFetchResolver('http://localhost:9292/gtfs')
  const gtfsSchedule = useGtfsSchedule(scheduleResolver, 24 * 60 * 60 * 1000)

  const tripUpdatesResolver = useFetchResolver('http://localhost:9292/gtfs-rt/trip-updates')
  const gtfsTripUpdates = useGtfsRealtime(tripUpdatesResolver, 30 * 1000)

  const stops = departuresFromGtfs(gtfsSchedule, gtfsTripUpdates, stopIds, routeIds)

  return (
    <>
      {(stops === undefined)
        ? null
        : (
          <DepartureBoard>
            {stops.map((stop) => (
              <Stop key={stop.id} name={stop.name}>
                {stop.departures.map((departure) => (
                  <Departure
                    key={departure.id}
                    route={departure.route}
                    destination={departure.destination}
                    time={departure.time}
                    color={departure.color}
                  />
                ))}
              </Stop>
            ))}
          </DepartureBoard>
          )}
    </>
  )
}
