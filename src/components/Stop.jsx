import classNames from './Stop.module.css'

export default function Stop ({ name, children }) {
  return (
    <div className={classNames['stop-container']}>
      <div className={classNames['stop-header']}>
        {name}
      </div>
      <hr />
      <div className={classNames['stop-departures']}>{children}</div>
    </div>
  )
}
