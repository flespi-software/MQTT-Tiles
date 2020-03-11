import compareVersions from 'compare-versions'
import clicker from './clicker/migrations'
import frame from './frame/migrations'
import switcher from './switcher/migrations'
/* widgetType: {[version]: handler} */
const migrateHandlers = {
  clicker,
  frame,
  switcher
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
