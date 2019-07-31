import compareVersions from 'compare-versions'
import clicker from './clicker/migrations'
/* widgetType: {[version]: handler} */
let migrateHandlers = {
  clicker
}
function migrateWidgets (widgets, fromVersion, toVersion) {
  return widgets.reduce((newWidgets, widget) => {
    let migrations = migrateHandlers[widget.type] || {}
    let versions = Object.keys(migrations)
    versions.forEach((version) => {
      if (compareVersions.compare(version, fromVersion, '>') && compareVersions.compare(version, toVersion, '<=')) {
        migrations[version](widget)
      }
    })
    newWidgets.push(widget)
    return newWidgets
  }, [])
}

export default migrateWidgets
