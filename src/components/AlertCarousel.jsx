import classNames from './AlertCarousel.module.css'

export default function AlertCarousel ({ alerts }) {
  return (
    <div>
      <pre>
        {JSON.stringify(alerts, {}, 2)}
      </pre>
    </div>
  )
}
