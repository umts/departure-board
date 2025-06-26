import classNames from './DepartureBoard.module.css'

export default function DepartureBoard ({ children }) {
  return (
    <div className={classNames['departure-board']}>
      {children}
    </div>
  )
}
