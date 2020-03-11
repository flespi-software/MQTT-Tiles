import multiplierHandler from './multiplier/messagesProcessing'
function defaultProcessing (packets, dest, subTopic, widget) {
  return (packets && ((packets.length && packets.slice(-1)[0]) || dest)) || null
}

const customHandlersByType = {
  multiplier: multiplierHandler
}

export default function (type) {
  return customHandlersByType[type] || defaultProcessing
}
