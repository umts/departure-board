import classNames from './DepartureBoard.module.css'
import StopGrid from './StopGrid.jsx'

export default function DepartureBoard ({ stops }) {
  return (
    <div className={classNames['departure-board']}>
      <StopGrid stops={stops}></StopGrid>
    </div>
  )
}
