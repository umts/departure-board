import { useState, useEffect } from 'react'
import classNames from './AlertCarousel.module.css'

export default function AlertCarousel ({ alerts }) {
  const [alertIndex, setAlertIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAlertIndex((index) => (index + 1) % alerts.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [alerts])

  const currentAlert = alerts[alertIndex]

  return (
    <>
      {(currentAlert) && (
        <div role='alert' className={classNames['alert-carousel']}>
          <div className={classNames['alert-number']}>
            <div><i className='fa-regular fa-bell' /></div>
            <div>{alertIndex + 1}/{alerts.length}</div>
          </div>
          <div className={classNames['alert-content']}>
            <div className={classNames['alert-subject']}>
              <div><strong>{currentAlert.header}</strong></div>
              <div>{currentAlert.routes.map((route) => route.name).join(', ')}</div>
            </div>
            <div>{currentAlert.description}</div>
          </div>
        </div>
      )}
    </>
  )
}
