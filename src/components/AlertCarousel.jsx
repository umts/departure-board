import Alert from './Alert.jsx'
import classNames from './AlertCarousel.module.css'

export default function AlertCarousel ({ alerts }) {
  return (
    <div className={classNames['alert-carousel']}>
      <Alert
        title={'Detour on Route G1'}
        description={'Buses on Route G1 will be on detour due to an accident. Toward Five Town Plaza via Canon, stop Sumner / Ormond will not be served.'}
        effect={'Detour'}
      />
    </div>
  )
}
