import AlertCarousel from './AlertCarousel.jsx'
import classNames from './DepartureBoard.module.css'
import StopGrid from './StopGrid.jsx'

export default function DepartureBoard ({ stops, alerts }) {
  return (
    <div className={classNames['departure-board']}>
      <StopGrid stops={stops} />
      <AlertCarousel alerts={alerts} />
    </div>
  )
}
