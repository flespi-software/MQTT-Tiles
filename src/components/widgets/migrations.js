import compareVersions from 'compare-versions'
import clicker from './clicker/migrations'
import frame from './frame/migrations'
import switcher from './switcher/migrations'
/* widgetType: {[version]: handler} */
let migrateHandlers = {
  clicker,
  frame,
  switcher
}
function migrateWidgets (widgets, fromVersion, toVersion) {
  return widgets.reduce((newWidgets, widget) => {
    let migrations = migrateHandlers[widget.type] || {}
    let versions = Object.keys(migrations)
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
