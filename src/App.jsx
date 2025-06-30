import { useGtfsSchedule, useGtfsRealtime, useFetchResolver } from 'gtfs-react-hooks'
import Departure from './components/Departure.jsx'
import DepartureBoard from './components/DepartureBoard.jsx'
import Stop from './components/Stop.jsx'
import departuresFromGtfs from './utils/departuresFromGtfs.js'

export default function App () {
  const scheduleResolver = useFetchResolver('http://localhost:9292/gtfs')
  const gtfsSchedule = useGtfsSchedule(scheduleResolver, 24 * 60 * 60 * 1000)

  const tripUpdatesResolver = useFetchResolver('http://localhost:9292/gtfs-rt/trip-updates')
  const gtfsTripUpdates = useGtfsRealtime(tripUpdatesResolver, 30 * 1000)

  const stopIds = ['116', '64']
  const stopDepartures = departuresFromGtfs(gtfsSchedule, gtfsTripUpdates, stopIds)

  return (
    <>
      {(stopDepartures === undefined)
        ? null
        : (
          <DepartureBoard>
            {stopDepartures.map((departures, index) => {
              return (
                <Stop name={departures.stopName}>
                  {departures.departures.map((departure) => (
                    <Departure
                      key={departure.id}
                      route={departure.route}
                      destination={departure.destination}
                      time={departure.time}
                      color={departure.color}
                      textColor={departure.textColor}
                    />
                  ))}
                </Stop>
              );
            })}
          </DepartureBoard>
          )}
    </>
  )
}
