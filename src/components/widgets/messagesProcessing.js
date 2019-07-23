import multiplierHandler from './multiplier/messagesProcessing'
function defaultProcessing (packet, dest, subTopic, widget) {
  return packet
}

let customHandlersByType = {
  'multiplier': multiplierHandler
}

export default function (type) {
  return customHandlersByType[type] || defaultProcessing
}
