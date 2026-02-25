import { useState, useEffect } from 'react'
import classNames from './AlertCarousel.module.css'

export default function AlertCarousel ({ alerts }) {
  const [alertIndex, setAlertIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAlertIndex((index) => (index + 1) % alerts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [alerts])

  const currentAlert = alerts[alertIndex]

  return (
    <div className={classNames['alert-carousel']}>
      <div className={classNames['alert-number']}>{alertIndex + 1}/{alerts.length}</div>
      <div className={classNames['alert-content']}>
        <div><strong>{currentAlert.header}</strong></div>
        <div>{currentAlert.description}</div>
      </div>
      <div>
        <div>{currentAlert.routes.map((route) => (<span key={route.id}>{route.name}</span>))}</div>
        <div>{currentAlert.effect}</div>
      </div>
    </div>
  )
}
