import { useEffect, useState } from 'react'
import Departure from './components/Departure.jsx'
import DepartureBoard from './components/DepartureBoard.jsx'
import Stop from './components/Stop.jsx'

export default function App () {
  const [fiveMinutesFromNow, setFiveMinutesFromNow] = useState(new Date(Date.now() + 5 * 60 * 1000))
  const [tenMinutesFromNow, setTenMinutesFromNow] = useState(new Date(Date.now() + 6 * 60 * 1000))
  useEffect(() => {
    const interval = setInterval(() => {
      setFiveMinutesFromNow(new Date(Date.now() + 5 * 60 * 1000))
      setTenMinutesFromNow(new Date(Date.now() + 10 * 60 * 1000))
    }, 1000)
    return clearInterval(interval)
  }, [])
  return (
    <DepartureBoard>
      <Stop name='Integrative Learning Center'>
        <Departure
          route='30'
          destination='Old Belchertown Road'
          time={fiveMinutesFromNow}
          color='#FF8C00'
          textColor='#FFFFFF'
        />
        <Departure
          route='31'
          destination='South Amherst'
          time={fiveMinutesFromNow}
          color='#EC5E82'
          textColor='#FFFFFF'
        />
        <Departure
          route='33'
          destination='Big Y / Stop and Shop'
          time={tenMinutesFromNow}
          color='#00AEEC'
          textColor='#FFFFFF'
        />
        <Departure
          route='36'
          destination='Atkins Farm'
          time={tenMinutesFromNow}
          color='#00A94E'
          textColor='#FFFFFF'
        />
        <Departure
          route='45'
          destination='Belchertown Center via Gatehouse Road'
          time={tenMinutesFromNow}
          color='#00A94E'
          textColor='#FFFFFF'
        />
      </Stop>
    </DepartureBoard>
  )
}
