import uniq from 'lodash/uniq'
import clicker from './clicker/getTopics.js'
import singleselect from './singleselect/getTopics'
import switcher from './switcher/getTopics'
import textSender from './textSender/getTopics'
import calculator from './calculator/getTopics'
import color from './color/getTopics'
import complex from './complex/getTopics'
import frame from './frame/getTopics'
import informer from './informer/getTopics'
import multiInformer from './multiInformer/getTopics'
import multiplier from './multiplier/getTopics'
import statusIndicator from './statusIndicator/getTopics'
import linear from './linear/getTopics'
import radial from './radial/getTopics'
import slider from './slider/getTopics'
import mapLocation from './mapLocation/getTopics'
import mapDevices from './mapDevices/getTopics'
import mapRoute from './mapRoute/getTopics'
const handlers = {
  clicker,
  singleselect,
  switcher,
  'text-sender': textSender,
  calculator,
  color,
  complex,
  frame,
  informer,
  'multi-informer': multiInformer,
  multiplier,
  'status-indicator': statusIndicator,
  linear,
  radial,
  slider,
  'map-devices': mapDevices,
  'map-location': mapLocation,
  'map-route': mapRoute
}
export default function getTopics (board, widgets) {
  let subscribeTopics = [`xflespifront/mqtttiles/boards/${board.id}`]
  if (board.settings.variables) {
    subscribeTopics = [...subscribeTopics, ...board.settings.variables.map(variable => variable.topic.topicTemplate)]
  }
  const result = widgets.reduce((topics, widget) => {
    const handler = handlers[widget.type] || (() => ({}))
    const widgetTopics = handler(widget)
    if (widgetTopics.subscribe) {
      topics.subscribe = [...topics.subscribe, ...widgetTopics.subscribe]
    }
    if (widgetTopics.publish) {
      topics.publish = [...topics.publish, ...widgetTopics.publish]
    }
    return topics
  },
  { subscribe: subscribeTopics, publish: [] })
  if (result.subscribe) {
    result.subscribe = uniq(result.subscribe).sort()
  }
  if (result.publish) {
    result.publish = uniq(result.publish).sort()
  }
  return result
}
