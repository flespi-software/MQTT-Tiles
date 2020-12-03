import RestConnector from 'flespi-io-js/dist/rest'
import get from 'lodash/get'

class Connector {
  constructor (config) {
    this.bus = new RestConnector(config)
  }

  get settings () { return this.bus.settings }
  set settings (settings) { this.bus.settings = settings }

  get token () { return this.bus.token }
  set token (token) { this.bus.token = token }

  async getDevices (relatedCalcs) {
    let deviceIds = 'all'
    if (relatedCalcs && relatedCalcs !== 'all') {
      const calcsIds = relatedCalcs.join(',')
      try {
        const tasksData = await this.bus.gw.getCalcsDevices(calcsIds, 'all', { fileds: 'device_id' })
        const tasks = get(tasksData, 'data.result', [])
        const relatedDevicesIds = tasks.reduce((devices, task) => {
          devices[task.device_id] = true
          return devices
        }, {})
        deviceIds = Object.keys(relatedDevicesIds).join(',')
      } catch (e) {
        return []
      }
    }
    const devicesData = await this.bus.gw.getDevices(deviceIds, { fields: 'id,name' })
    let devices = get(devicesData, 'data.result', [])
    devices = devices.map(device => ({ label: device.name || `#${device.id}`, value: `${device.id}` }))
    return devices
  }

  async getChannels () {
    const calcsData = await this.bus.gw.getChannels('all', { fileds: 'id,name' })
    let calcs = get(calcsData, 'data.result', [])
    calcs = calcs.map(calc => ({ label: calc.name || `#${calc.id}`, value: `${calc.id}` }))
    return calcs
  }

  async getCalcs (relatedDevices) {
    let calcsIds = 'all'
    if (relatedDevices && relatedDevices !== 'all') {
      try {
        const devicesIds = relatedDevices.join(',')
        const tasksData = await this.bus.gw.getCalcsDevices('all', devicesIds, { fields: 'calc_id' })
        const tasks = get(tasksData, 'data.result', [])
        const relatedCalcsIds = tasks.reduce((calcs, task) => {
          calcs[task.calc_id] = true
          return calcs
        }, {})
        calcsIds = Object.keys(relatedCalcsIds).join(',')
      } catch (e) {
        return []
      }
    }
    const channelsData = await this.bus.gw.getCalcs(calcsIds, { fileds: 'id,name' })
    let channels = get(channelsData, 'data.result', [])
    channels = channels.map(channel => ({ label: channel.name || `#${channel.id}`, value: `${channel.id}` }))
    return channels
  }

  async getDevicesTelemetry (id) {
    const telemetryData = await this.bus.gw.getDevicesTelemetry(id)
    let telemetry = get(telemetryData, 'data.result', [])
    telemetry = telemetry.reduce((telemetry, device) => {
      const deviceTelemetry = device.telemetry
      if (deviceTelemetry) {
        telemetry = { ...telemetry, ...deviceTelemetry }
      }
      return telemetry
    }, {})
    telemetry = Object.keys(telemetry).sort().map(param => ({ label: param, value: param }))
    return telemetry
  }

  async getDevicesSettings (id) {
    const settingsData = await this.bus.gw.getDevicesSettings(id, 'all', { fields: 'name,schema' })
    let settings = get(settingsData, 'data.result', [])
    settings = settings.reduce((settings, setting) => {
      const name = setting.name,
        label = setting.schema.title
      if (!settings[name]) { settings[name] = {} }
      settings[name][label] = true
      return settings
    }, {})
    settings = Object.keys(settings).map(settingName => ({ label: Object.keys(settings[settingName]).join(', '), value: settingName }))
    return settings
  }
}
export default Connector
