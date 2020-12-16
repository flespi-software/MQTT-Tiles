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
  'map-location': mapLocation,
  'map-route': mapRoute
}
export default function getTopics (board, widgets) {
  return widgets.reduce((topics, widget) => {
    const handler = handlers[widget.type] || (() => ({}))
    const widgetTopics = handler(widget)
    if (widgetTopics.subscribe) {
      topics.subscribe = uniq([...topics.subscribe, ...widgetTopics.subscribe]).sort()
    }
    if (widgetTopics.publish) {
      topics.publish = uniq([...topics.publish, ...widgetTopics.publish]).sort()
    }
    return topics
  },
  {
    subscribe: board.settings.variables ? board.settings.variables.map(variable => variable.topic.topicTemplate) : [],
    publish: []
  })
}
