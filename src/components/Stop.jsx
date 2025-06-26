import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import classNames from './Stop.module.css'

export default function Stop ({ name, children }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className={classNames['stop-container']}>
      <div className={classNames['stop-header']}>
        <div>{name}</div>
        <div>{format(time, 'h:mm aaa')}</div>
      </div>
      <hr />
      <div className={classNames['stop-departures']}>{children}</div>
    </div>
  )
}
