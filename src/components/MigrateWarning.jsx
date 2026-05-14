import classNames from './MigrateWarning.module.css'

export default function MigrateWarning () {
  return (
    <div className={classNames['migrate-warning']}>
      <div><i className='fa-solid fa-triangle-exclamation' /></div>
      <div>
        The previous departure board application has been replaced and this display has been automatically
        redirected to the new application as a courtesy. The IT Administrator for this display must visit
        https://github.com/umts/departure-board and follow the reconfiguration instructions to remove this message.
      </div>
    </div>
  )
}
