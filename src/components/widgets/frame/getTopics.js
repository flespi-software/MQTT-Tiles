import { IFRAME_MODE_INTEGRATION, IFRAME_MODE_SHOW } from './constants'
export default function getTopics (widget) {
  const mode = widget.settings.mode
  let subscribe, publish
  if (mode === IFRAME_MODE_INTEGRATION) {
    publish = widget.settings.items.map(item => {
      const topic = item.topic
      return (topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+')
    })
  } else if (mode === IFRAME_MODE_SHOW) {
    subscribe = widget.dataTopics.map(topic => (topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+'))
  }
  return {
    subscribe,
    publish
  }
}
