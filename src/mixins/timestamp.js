import get from 'lodash/get'
import { date } from 'quasar'
const getTimeByPacket = (packet) => {
  return parseInt(get(packet, 'properties.userProperties.timestamp', packet.timestamp / 1000)) * 1000
}
const getTimeByTimestamp = (t) => {
  const timestamp = t,
    now = new Date(Date.now()),
    time = new Date(timestamp)
  let format = 'DD/MM HH:mm:ss'
  if (now.getDate() + now.getMonth() === time.getDate() + time.getMonth()) {
    format = 'HH:mm:ss'
  }
  return timestamp ? date.formatDate(timestamp, format) : ''
}
export {
  getTimeByTimestamp,
  getTimeByPacket
}
export default {
  computed: {
    time () {
      return Object.keys(this.value).reduce((timestamp, topic) => {
        if (!this.value[topic]) { return timestamp }
        const time = getTimeByPacket(this.value[topic])
        if (time > timestamp) { timestamp = time }
        return timestamp
      }, 0)
    },
    timestamp () {
      return getTimeByTimestamp(this.time)
    }
  }
}
