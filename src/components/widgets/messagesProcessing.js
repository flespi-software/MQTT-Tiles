import multiplierHandler from './multiplier/messagesProcessing'
import mapDevicesHandler from './mapDevices/messagesProcessing'
function defaultProcessing (packets, dest, subTopic, widget) {
  return (packets && ((packets.length && packets.slice(-1)[0]) || dest)) || null
}

const customHandlersByType = {
  multiplier: multiplierHandler,
  "map-devices": mapDevicesHandler
}

export default function (type) {
  return customHandlersByType[type] || defaultProcessing
}
