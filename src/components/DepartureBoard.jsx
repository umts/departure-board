import AlertCarousel from './AlertCarousel.jsx'
import classNames from './DepartureBoard.module.css'
import MigrateWarning from './MigrateWarning.jsx'
import StopGrid from './StopGrid.jsx'
import useOptimalGridDimensions from '../hooks/useOptimalGridDimensions.js'

export default function DepartureBoard ({ migrateWarning, stops, alerts }) {
  const [width, height] = useOptimalGridDimensions(stops.length)
  return (
    <div
      className={classNames['departure-board']}
      style={{ fontSize: `min(${3 / width}vw, ${3 / height}vh)` }}
    >
      {migrateWarning && (<MigrateWarning />)}
      <StopGrid stops={stops} width={width} />
      <AlertCarousel alerts={alerts} />
    </div>
  )
}
