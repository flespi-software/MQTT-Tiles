import compareVersions from 'compare-versions'
import clicker from './clicker/migrations'
import frame from './frame/migrations'
import switcher from './switcher/migrations'
import mapLocation from './mapLocation/migrations'
import mapDevices from './mapDevices/migrations'
import mapRoute from './mapRoute/migrations'
import scheme from './scheme/migrations'
/* widgetType: {[version]: handler} */
const migrateHandlers = {
  clicker,
  frame,
  switcher,
  'map-devices': mapDevices,
  'map-location': mapLocation,
  'map-route': mapRoute,
  scheme
}
function migrateWidgets (widgets, fromVersion, toVersion) {
  return widgets.reduce((newWidgets, widget) => {
    const migrations = migrateHandlers[widget.type] || {}
    const versions = Object.keys(migrations)
    versions.forEach((version) => {
      if (compareVersions.compare(version, fromVersion, '>') && compareVersions.compare(version, toVersion, '<=')) {
        try {
          migrations[version](widget)
        } catch (e) {
          console.log(e)
        }
      }
    })
    newWidgets.push(widget)
    return newWidgets
  }, [])
}

export default migrateWidgets
